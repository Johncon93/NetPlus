import socketserver

"""

UDP listener for DNS requests.
Feature was scrapped due to performance limitations observed in test environment.

"""

HOST, PORT = '0.0.0.0', 53

class DNSHandler(socketserver.BaseRequestHandler):

    def handle(self):
        data = bytes.decode(self.request[0].strip())
        socket = self.request[1]
        print( "%s : " % self, str(data))
        print( "%s : " % self, str(socket))

def main():
    try:
        server = socketserver.UDPServer((HOST,PORT), DNSHandler)

        server.serve_forever()

    except Exception as error:
        print(f'Exception occured reference: {error}')
        raise SystemExit(error)
    

if __name__ == '__main__':
    main()