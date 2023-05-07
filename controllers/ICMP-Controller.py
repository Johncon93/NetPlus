import sys
from ping3 import ping

# ICMP health check used for live traffic.
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
    # Retrieve host IP
    host = sys.argv[1]

    # Run ICMP check and write result to console. Flush buffer to return values back to parent process.
    uplink_data = Ping_Host(host)
    sys.stdout.write(str(uplink_data))
    sys.stdout.flush()

if __name__ == '__main__':
    main()