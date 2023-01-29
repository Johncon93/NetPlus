import socketserver, requests, datetime, os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

HOST, PORT = "0.0.0.0", 514
url = 'http://127.0.0.1:8443/alerts'

def post(alert):
	try:
		x = requests.post(url, data= alert)
	except requests.exceptions.RequestException as error:
		raise SystemExit(error)

class SyslogUDPHandler(socketserver.BaseRequestHandler):

	def handle(self):
		data = bytes.decode(self.request[0].strip())
		socket = self.request[1]
		print( "%s : " % self.client_address[0], str(data))
		
		obj = {
			'time': f'{datetime.datetime.now()}',
			'host': f'{str(self.client_address[0])}',
			'message': f'{data}' 
		}

		try:
			x = self.server.db.insert_one(obj)
			print(x)
		except Exception as error:
			print(f'Exception occured reference: {error}')
			raise SystemExit(error)


if __name__ == "__main__":
	
	try:
		server = socketserver.UDPServer((HOST,PORT), SyslogUDPHandler)
		client = MongoClient(os.getenv('MONGODB_PRIV_STRING'))
		collection = client['final_project']
		db = client['final_project']['alerts']

		server.url = 'http://127.0.0.1:8443/alerts'
		server.conn = client
		server.col = collection
		server.db = db

		server.serve_forever()
	except Exception as error:
		print(f'Exception occured reference: {error}')
		raise SystemExit(error)


