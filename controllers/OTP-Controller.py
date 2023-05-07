import pyotp, sys, datetime
from ping3 import ping


# Retrieve passed TACACS+ String
secret = sys.argv[1]

# ICMP check to confirm if TACACS server is reachable.
tac_check = ping('192.168.177.200')

if tac_check != None:
    # Generate OTP using TAC string, determine time remaining by comparing interval against current time.
    totp = pyotp.TOTP(secret)
    timeleft = round(totp.interval - datetime.datetime.now().timestamp() % totp.interval)

    # Return OTP and expiration time to parent process.
    print(f'{totp.now()}@{timeleft}')
else:
    print('false@false')

