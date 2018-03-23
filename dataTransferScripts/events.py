import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
from dateutil import parser


######## Transfer the events data ... Left out 'notifications' field because there are none in the database and no events have a relationship to any ##########


project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('events.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	if('squareImage' not in o):
		o['squareImage'] = None
	if('locationTBD' not in o):
		o['locationTBD'] = False
	if('bannerImage' not in o):
		o['bannerImage'] = None
	if('image' not in o):
		o['image'] = None

	end_date = parser.parse(o['endDate']['$date'])
	start_date = parser.parse(o['startDate']['$date'])

	ministry = []
	for m in o['ministries']:
		ministry.append(db.collection(u'ministries').document(m['$oid']))

	data = {
		u'slug': o['slug'],
    	u'name': o['name'],
    	u'description': o['description'],
    	u'location': o['location'],
    	u'url': o['url'],
    	u'image': o['image'],
    	u'imageLink': o['imageLink'],
    	u'squareImage': o['squareImage'],
    	u'squareImageLink': o['squareImageLink'],
    	u'bannerImage': o['bannerImage'],
    	u'bannerImageLink': o['bannerImageLink'],
    	u'locationTBD': o['locationTBD'],
    	u'endDate': end_date,
    	u'startDate': start_date,
    	u'rideSharing': o['rideSharing'],
    	u'ministries': ministry,
    	u'displayOnWebsite': o['displayOnWebsite'],
    	u'displayOnApp': o['displayOnApp']
	}

	db.collection(u'events').document(o['_id']['$oid']).set(data)