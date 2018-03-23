import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
from dateutil import parser


######### This script writes the resources, resourcePages, and resourceTags data, because they are all related to one another #############

project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

tags = []

for line in open('resourcetags.json', 'r'):
	tags.append(json.loads(line))

for t in tags:
	data = {
		u'slug': t['slug'],
    	u'title': t['title'],
	}

	db.collection(u'resourcetags').document(t['_id']['$oid']).set(data)

resources = []

for line in open('resources.json', 'r'):
	resources.append(json.loads(line))

for r in resources:
	if('image' not in r):
		r['image'] = None
	if('date' not in r):
		r['date'] = None

	if(r['date']):
		date = parser.parse(r['date']['$date'])

	resource_tags = []
	for t in r['tags']:
		resource_tags.append(db.collection(u'resourcetags').document(t['$oid']))

	data = {
		u'slug': r['slug'],
		u'url': r['url'],
		u'type': r['type'],
		u'date': date,
    	u'title': r['title'],
    	u'author': r['author'],
    	u'description': r['description'],
    	u'restricted': r['restricted'],
    	u'image': r['image'],
    	u'imageLink': r['imageLink'],
    	u'squareImageLink': r['squareImageLink'],
    	u'tags': resource_tags
	}

	db.collection(u'resources').document(r['_id']['$oid']).set(data)

pages = []

for line in open('resourcepages.json', 'r'):
	pages.append(json.loads(line))

for p in pages:
	if('publishedDate' not in p):
		p['publishedDate'] = None

	if(p['publishedDate']):
		pub_date = parser.parse(p['publishedDate']['$date'])

	resource_tags = []
	for t in r['tags']:
		resource_tags.append(db.collection(u'resourcetags').document(t['$oid']))

	data = {
		u'slug': p['slug'],
		u'publishedDate': pub_date,
    	u'title': p['title'],
    	u'state': p['state'],
    	u'author': p['author'],
    	u'restricted': p['restricted'],
    	u'content': p['content'],
    	u'tags': resource_tags
	}

	db.collection(u'resourcepages').document(p['_id']['$oid']).set(data)

tags = []

for line in open('resourcetags.json', 'r'):
	tags.append(json.loads(line))

for t in tags:

	resources = []
	for r in t['resources']:
		resources.append(db.collection(u'resources').document(r['$oid']))

	data = {
		u'resources': resources
	}

	db.collection(u'resourcetags').document(t['_id']['$oid']).update(data)