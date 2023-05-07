# Import NetMiko Modules
from netmiko import ConnectHandler
import sys, pyotp, os
from ping3 import ping
from dotenv import load_dotenv

# Basic ICMP health check to determine if TAC server active.
def Health_Check(host):
    try:
        result = ping(host)

        if result == None:
            return False
        elif result == False:
            return False
        else:
            return True
    except (RuntimeError, TypeError, NameError):
        return False
    
# Function to send SSH command to target device.
def send_ssh(command, host):

    if ',' in command:
        command = command.split(',')

    device = ''
    tac_check = Health_Check('192.168.177.200')

    if tac_check != True:
        # Test device dictionary, only IP address needs to be retrieved and set as Host attribute.
        device = {
            "device_type": "cisco_ios",
            "host": f'{host}',
            "username": f"{os.getenv('BACKUP_USERNAME')}",
            "password": f"{os.getenv('BACKUP_PASSWORD')}",
            "secret": f"{os.getenv('BACKUP_SECRET')}"
        }
    else: # TACACS+ Server is active, generate OTP.
        totp = pyotp.TOTP(os.getenv('TACACS_PRIV_STRING2'))
        device = {
            "device_type": "cisco_ios",
            "host": f'{host}',
            "username": "johnc",
            "password": f"{totp.now()}",
            "secret": f"{os.getenv('BACKUP_SECRET')}"
        }

    # Use ConnectHandler to target the device and establish SSH session.
    net_connect = ConnectHandler(**device)
    net_connect.enable()

    if type(command) != type([]):
        # Execute command via SSH and print result to terminal.
        output = net_connect.send_command(command)
        print(f"\n{output}")
    else:
        output = net_connect.send_config_set(command)
        print(f"\n{output}")

    # Close SSH connection and flush the buffer to write everything into terminal.
    net_connect.close()
    sys.stdout.flush()

# Main function
def main():

    # Load environment variables.
    load_dotenv()

    # Retrieve arguments from the command script.
    command = sys.argv[1]
    host = sys.argv[2]

    # Send command parameter to target host.
    send_ssh(command, host)

if __name__ == '__main__':
    main()



    