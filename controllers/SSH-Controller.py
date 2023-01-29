from netmiko import ConnectHandler
import sys


def main():
    command = sys.argv[1]
    host = sys.argv[2]

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

if __name__ == '__main__':
    main()