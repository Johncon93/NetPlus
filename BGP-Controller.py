from sys import stdout
from time import sleep
from ping3 import ping

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

def main():


    core_routers = [
        {'192.168.177.3': '172.16.16.1'},
        {'192.168.177.4': '172.16.16.2'}
        ]

    core_router = ''

    for core in core_routers:
        for key in core:
            if Health_Check(key):
                core_router = core.get(key)
                break

    core_spines = [
        {'192.168.177.11': '172.16.16.101'},
        {'192.168.177.12': '172.16.16.201'}
        ]

    core_spine = ''
    for core in core_spines:
        for key in core:
            if Health_Check(key):
                core_spine = core.get(key)
                break
    
    bgp_peers = [
        {'192.168.177.3': [
            'announce route 192.168.30.0/30 next-hop 172.16.16.201',
            'announce route 192.168.31.0/30 next-hop 172.16.16.201',
            'announce route 192.168.40.0/30 next-hop 172.16.16.202',
            'announce route 192.168.41.0/30 next-hop 172.16.16.202',
            'announce route 192.168.50.0/30 next-hop 172.16.16.203',
            'announce route 192.168.51.0/30 next-hop 172.16.16.203',
            f'announce route 172.16.16.5/32 next-hop {core_spine}',
            f'announce route 0.0.0.0/0 next-hop {core_router}'
        ]}
    ]

    sleep(5)

    messages = []
    
    for peer in bgp_peers:
        for key in peer:
            alive = Health_Check(key)
            if alive:
                for route in peer.get(key):
                    messages.append(route)
            else:
                for route in peer.get(key):
                    route = route.replace('announce', 'withdraw')
                    messages.append(route)
                        
    #Iterate through messages
    for message in messages:
        stdout.write(message + '\n')
        stdout.flush()
        sleep(1)

    sleep(20)
    main()

if __name__ == '__main__':
    main()

