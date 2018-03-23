import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
from dateutil import parser


########## Transfer the user notifications data ##############


project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('usernotifications.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	time = parser.parse(o['time']['$date'])
	user = db.collection(u'users').document(o['user']['$oid'])
	data = {
		u'title': o['title'],
    	u'body': o['body'],
    	u'subTitle': o['subTitle'],
    	u'time': time,
    	u'sent': o['sent'],
    	u'user': user
	}

	db.collection(u'usernotifications').document(o['_id']['$oid']).set(data)