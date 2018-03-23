import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json


######## Transfer the ministry question answers data ... It seemed to me that some of them had relationships to non-existent community groups, but probably not a big deal ##########



project_id = 'cru-central-coast-prod'
#Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('ministryquestionanswers.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	if(len(o['communityGroup']) == 1):
		if(type(o['communityGroup']) is dict):
			ref = o['communityGroup']['$oid']
		else:
			ref = o['communityGroup'][0]['$oid']
		communityGroup = db.collection(u'communitygroups').document(ref)
	else:
		communityGroup = []
		for g in o['communityGroup']:
			communityGroup.append(db.collection(u'communitygroups').document(g['$oid']))
	question = db.collection(u'ministryquestions').document(o['question']['$oid'])

	data = {
    	u'question': question,
    	u'communityGroup': communityGroup,
    	u'answer': o['answer']
	}

	db.collection(u'ministryquestionanswers').document(o['_id']['$oid']).set(data)