import secrets
import pyotp
import sys
import datetime
from ping3 import ping

secret = sys.argv[1]

tac_check = ping('192.168.177.200')

if tac_check != None:
    totp = pyotp.TOTP(secret)
    timeleft = round(totp.interval - datetime.datetime.now().timestamp() % totp.interval)

    print(f'{totp.now()}@{timeleft}')
else:
    print('false@false')

