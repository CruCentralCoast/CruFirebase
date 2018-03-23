import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
from dateutil import parser
 
############ Transfers the summer missions data ##############

project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('summermissions.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	if('groupPhoto' not in o):
		o['groupPhoto'] = None
	if('groupImage' not in o):
		o['groupImage'] = None
	if('url' not in o):
		o['url'] = None
	if('image' not in o):
		o['image'] = None
	if('leaders' not in o):
		o['leaders'] = None
	if('cost' not in o):
		o['cost'] = None

	end_date = parser.parse(o['endDate']['$date'])
	start_date = parser.parse(o['startDate']['$date'])

	data = {
		u'slug': o['slug'],
    	u'name': o['name'],
    	u'description': o['description'],
    	u'location': o['location'],
    	u'url': o['url'],
    	u'endDate': end_date,
    	u'startDate': start_date,
    	u'groupPhoto': o['groupPhoto'],
    	u'groupImage': o['groupImage'],
    	u'image': o['image'],
    	u'imageLink': o['imageLink'],
    	u'bannerImageLink': o['bannerImageLink'],
    	u'groupImageLink': o['groupImageLink'],
    	u'squareImageLink': o['squareImageLink'],
    	u'leaders': o['leaders'],
    	u'cost': o['cost']
	}

	db.collection(u'summermissions').document(o['_id']['$oid']).set(data)