import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json


########## Transfers campus data ###########


project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('campus.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	data = {
		u'slug': o['slug'],
    	u'name': o['name'],
    	u'location': o['location'],
    	u'url': o['url'],
    	u'image': o['image'],
    	u'imageLink': o['imageLink']
	}

	db.collection(u'campus').document(o['_id']['$oid']).set(data)