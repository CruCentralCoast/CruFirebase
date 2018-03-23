import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json


########## Transfers community group data ###########


project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('communitygroups.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	if('meetingTime' not in o):
		o['meetingTime'] = None
	if('dayOfWeek' not in o):
		o['dayOfWeek'] = None
	if('gender' not in o):
		o['gender'] = None
	if('imageLink' not in o):
		o['imageLink'] = None
	if('ministry' not in o):
		o['ministry'] = None

	leaders = []
	for l in o['leaders']:
		leaders.append(db.collection(u'users').document(l['$oid']))
	if(o['ministry']):
		ministry = db.collection(u'ministries').document(o['ministry']['$oid'])

	data = {
		u'slug': o['slug'],
    	u'name': o['name'],
    	u'description': o['description'],
    	u'meetingTime': o['meetingTime'],
    	u'dayOfWeek': o['dayOfWeek'],
    	u'type': o['type'],
    	u'gender': o['gender'],
    	u'leaders': leaders,
    	u'ministry': ministry,
    	u'imageLink': o['imageLink']
	}

	db.collection(u'communitygroups').document(o['_id']['$oid']).set(data)