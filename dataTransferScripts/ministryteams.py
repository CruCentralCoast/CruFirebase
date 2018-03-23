import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json


############# Transfers the ministry team data ############### 


project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('ministryteams.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	if('image' not in o):
		o['image'] = None
	if('leaders' not in o):
		o['leaders'] = None
	if('teamImage' not in o):
		o['teamImage'] = None

	parent_ministry = db.collection(u'ministries').document(o['parentMinistry']['$oid'])

	if(o['leaders']):
		leaders = []
		for l in o['leaders']:
			leaders.append(db.collection(u'users').document(l['$oid']))

	data = {
		u'slug': o['slug'],
    	u'name': o['name'],
    	u'description': o['description'],
    	u'parentMinistry': parent_ministry,
    	u'image': o['image'],
    	u'teamImage': o['teamImage'],
    	u'teamImageLink': o['teamImageLink'],
    	u'leaders': leaders
	}

	db.collection(u'ministryteams').document(o['_id']['$oid']).set(data)