import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import auth
import json

########## Registers all users as firebase users in the firebase authentication part of our app, follow this by adding their additional data with the 'store_users.py' script ##############
## I had to manually go through the Keystone data for users and delete users who had more than one account with the same email (firebase auth does not allow this). I kept the most recently created account in most cases
project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('users.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	username = o['email']
	password = o['password']
	uid = o["_id"]["$oid"]
	name = o["key"]

	auth.create_user(uid=uid, email=username, password=password, display_name=name)