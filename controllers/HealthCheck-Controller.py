import os, time
from pymongo import MongoClient
from dotenv import load_dotenv
from ping3 import ping

load_dotenv()

def ping_host(host):

    response = ping(host)

    return response


def main():

    client = MongoClient(os.getenv('MONGODB_PRIV_STRING'))
    
    db = client['final_project']['networks']
    health_history = client['final_project']['network_stats']

    network_list = db.find()

    for network in network_list:

        if ':' in network['host']:
            temp_host = str(network['host']).split(':')
            # Network uses port forwards to access hardware, likely a switch and not internet routable.
            # ToDo: Write NetMiko function to access temp_host and send command to LAN IP of network device
        else:
            print(f"Pinging host {network['host']}....")
            status = ping_host(network['host'])

            if status == None:
                status = 'Request timed out'
            elif status == False:
                result = 'Cannot resolve host'
            else:
                result = status

        if network['status'] == True and result != status:
            print('Network was previously alive and now dead...')
            newvalues = { "$set": {'status': False}}
            db.update_one({'_id': network['_id']}, newvalues)

        elif network['status'] == True and result == status:
            print('Network is alive and was alive previously...')

        elif network['status'] != True and result == status:
            print('Network was previously dead but is now alive...')
            newvalues = { "$set": {'status': True}}
            db.update_one({'_id': network['_id']}, newvalues)

        else:
            print('Network was previously dead and is still dead...')


if __name__ == "__main__":
    main()
