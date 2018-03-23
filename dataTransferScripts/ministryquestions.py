import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json


######## Transfer the ministry questions data ##########


project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('ministryquestions.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	if(len(o['ministry']) == 1):
		ministry = db.collection(u'ministries').document(o['ministry']['$oid'])
	else:
		ministry = []
		for m in o['ministry']:
			ministry.append(db.collection(u'ministries').document(m['$oid']))

	selectOptions = []
	for s in o['selectOptions']:
		selectOptions.append(db.collection(u'ministryquestionoptions').document(s['$oid']))

	if('required' not in o):
		o['required'] = None

	data = {
    	u'ministry': ministry,
    	u'question': o['question'],
    	u'type': o['type'],
    	u'required': o['required'],
    	u'selectOptions': selectOptions,
	}

	db.collection(u'ministryquestions').document(o['_id']['$oid']).set(data)