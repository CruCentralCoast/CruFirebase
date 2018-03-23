import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json

######## Transfers the ministry data ##########

project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('ministries.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	if('bannerImage' not in o):
		o['bannerImage'] = None
	if('squareImage' not in o):
		o['squareImage'] = None
	campusRef = db.collection(u'campus').document(o['campus']['$oid'])
	data = {
		u'slug': o['slug'],
    	u'name': o['name'],
    	u'campus': campusRef,
    	u'description': o['description'],
    	u'image': o['image'],
    	u'imageLink': o['imageLink'],
    	u'bannerImage': o['bannerImage'],
    	u'squareImage': o['squareImage'],
    	u'bannerImageLink': o['bannerImageLink'],
    	u'squareImageLink': o['squareImageLink'],
    	u'teams': o['teams'],
	}

	db.collection(u'ministries').document(o['_id']['$oid']).set(data)