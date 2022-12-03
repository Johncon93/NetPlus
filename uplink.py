import sys
from ping3 import ping

def Ping_Host(host):
    try:
        result = ping(host)

        if result == None:
            return 'TO'
        elif result == False:
            return 'CR'
        else:
            return result
    except (RuntimeError, TypeError, NameError):
        return 'ERR'

def main():
    host = sys.argv[1]
    uplink_data = Ping_Host(host)
    sys.stdout.write(str(uplink_data))
    sys.stdout.flush()

if __name__ == '__main__':
    main()