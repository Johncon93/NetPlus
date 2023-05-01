# Import Modules
from netmiko import ConnectHandler
import sys

# Function to send SSH command to target device.
def send_ssh(command, host):

    # Test device dictionary, only IP address needs to be retrieved and set as Host attribute.
    device = {
        "device_type": "cisco_ios",
        "host": f'{host}',
        "username": "admin",
        "password": "admin",
        "secret": "cisco"
    }

    # Use ConnectHandler to target the device and establish SSH session.
    net_connect = ConnectHandler(**device)
    net_connect.enable()

    # Execute command via SSH and print result to terminal.
    output = net_connect.send_command(command)
    print(f"\n{output}")

    # Close SSH connection and flush the buffer to write everything into terminal.
    net_connect.close()
    sys.stdout.flush()

# Main function
def main():

    # Retrieve arguments from the command script.
    command = sys.argv[1]
    host = sys.argv[2]

    # Send command parameter to target host.
    send_ssh(command, host)

if __name__ == '__main__':
    main()