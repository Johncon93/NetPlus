from netmiko import ConnectHandler
import sys

def send_ssh(command, host):

    device = {
        "device_type": "cisco_ios",
        "host": f'{host}',
        "username": "admin",
        "password": "admin",
        "secret": "cisco"
    }

    net_connect = ConnectHandler(**device)

    net_connect.enable()
    output = net_connect.send_command_timing(command)
    print(f"\n{output}")
    net_connect.close()
    sys.stdout.flush()

def main():
    command = sys.argv[1]
    host = sys.argv[2]

    send_ssh(command, host)

if __name__ == '__main__':
    main()