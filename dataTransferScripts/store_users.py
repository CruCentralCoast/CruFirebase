import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
from dateutil import parser
 

########## Adds all additional data to users after registering them with email and password ###########


project_id = 'cru-central-coast-prod'
# Use the downloaded json file with app credentials
cred = credentials.Certificate('/Users/jacobnogle/Desktop/CruApp/cru-central-coast-prod-firebase-adminsdk-yq1hp-b7c4990482.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
objects = []

for line in open('users.json', 'r'):
	objects.append(json.loads(line))

for o in objects:
	if('schoolYear' not in o):
		o['schoolYear'] = None
	if('communityGroups' not in o):
		o['communityGroups'] = None
	if('lastActive' not in o):
		o['lastActive'] = None
	if('imageLink' not in o):
		o['imageLink'] = None
	if('staffRole' not in o):
		o['staffRole'] = None
	if('fcmId' not in o):
		o['fcmId'] = None
	if('deviceType' not in o):
		o['deviceType'] = None
	if('sex' not in o):
		o['sex'] = None
	if('isAdmin' not in o):
		o['isAdmin'] = None
	if('isVerified' not in o):
		o['isVerified'] = None

	if(o['communityGroups']):	
		communityGroups = []
		for g in o['communityGroups']:
			communityGroups.append(db.collection(u'communitygroups').document(g['$oid']))
	else:
		communityGroups = None

	ministryTeams = []
	for t in o['ministryTeams']:
		ministryTeams.append(db.collection(u'ministryteams').document(t['$oid']))
	summerMissions = []
	for m in o['summerMissions']:
		summerMissions.append(db.collection(u'summermissions').document(m['$oid']))
	if(o['lastActive']):
		last_active = parser.parse(o['lastActive']['$date'])
	else:
		last_active = None

	data = {
    	u'name': o['name'],
    	u'email': o['email'],
    	u'phone': o['phone'],
    	u'imageLink': o['imageLink'],
    	u'isPublic': o['isPublic'],
    	u'isStaff': o['isStaff'],
    	u'staffRole': o['staffRole'],
    	u'isCommunityGroupLeader': o['isCommunityGroupLeader'],
    	u'isMinistryTeamLeader': o['isMinistryTeamLeader'],
    	u'isSummerMissionLeader': o['isSummerMissionLeader'],
    	u'sex': o['sex'],
    	u'schoolYear': o['schoolYear'],
    	u'fcmId': o['fcmId'],
    	u'deviceType': o['deviceType'],
    	u'notifications': o['notifications'],
    	u'isAdmin': o['isAdmin'],
    	u'isVerified': o['isVerified'],
    	u'communityGroups': communityGroups,
		u'ministryTeams': ministryTeams,
		u'summerMissions': ministryTeams,
		u'lastActive': last_active
	}

	db.collection(u'users').document(o['_id']['$oid']).update(data)