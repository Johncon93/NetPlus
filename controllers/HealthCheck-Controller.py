import os, time
from pymongo import MongoClient
from dotenv import load_dotenv
from ping3 import ping

load_dotenv()

def ping_host(host):

    response = ping(host)

    return response

def update_stats(network):
    print()

def main():

    client = MongoClient(os.getenv('MONGODB_PRIV_STRING'))
    
    network_db = client['final_project']['networks']
    network_list = network_db.find()

    for network in network_list:

        if ':' in network['host']:
            temp_host = str(network['host']).split(':')
            # Network uses port forwards to access hardware, likely a switch and not internet routable.
            # ToDo: Write NetMiko function to access temp_host and send command to LAN IP of network device
        else:
            print(f"Pinging host {network['host']}....")

            # Send ICMP packet to target host and parse result.
            status = ping_host(network['host'])
            if status == None:
                status = 'Request timed out'
            elif status == False:
                result = 'Cannot resolve host'
            else:
                result = status

        # Check if network has an existing health key. If False then network has never had health check and new key value pair is created.
        if 'health' in network.keys():
            
            health_history = network['health'] # Set health_history list to value of existing health history.

            # Check if the network has had a full 30 day x 288 slot health check conducted
            if len(health_history[29]) != 288:

                health_index = 0
                for slot in health_history: # Find a day that does not have all 288 slots filled.
                    if len(slot) != 288:
                        break
                    else:
                        health_index += 1
                
                health_history[health_index].append(status) # Add the ICMP result into the health_history.

            else: # Network has had a full 30 x 288 health check.
                for i in range(len(health_history)-1): # Last value of each day is moved into the next day.
                    health_history[i + 1].insert(0, health_history[i].pop()) # Move last value of each day (except day 0 and 30) into the first value of next day.

                health_history[len(health_history)-1].pop() # Remove last value of day 30
                health_history[0].insert(0, status) # Insert ICMP result into 1st slot of day 0.

        else: # Network has never had a health check, create new Key Value pair and a 30 slot array.
            health_index = 0
            health_history = [None] * 30
            health_history[0] = []
            health_history[0].append(status) # Insert ICMP result into 1st slot of day 0.

        network_db.update_one({'_id': network['_id']}, { "$set": {'health': health_history}}, upsert=True) # Update network health key with the health_history data.

        # Parse result of ICMP packet and update network status accordingly.
        if network['status'] == True and result != status:
            print('Network was previously alive and now dead...')
            newvalues = { "$set": {'status': False}}
            network_db.update_one({'_id': network['_id']}, newvalues)

        elif network['status'] == True and result == status:
            print('Network is alive and was alive previously...')

        elif network['status'] != True and result == status:
            print('Network was previously dead but is now alive...')
            newvalues = { "$set": {'status': True}}
            network_db.update_one({'_id': network['_id']}, newvalues)

        else:
            print('Network was previously dead and is still dead...')


if __name__ == "__main__":
    main()
