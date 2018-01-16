const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

exports.createUserAccount = functions.auth.user().onCreate(event => {
	const uid = event.data.uid;
	const email = event.data.email;
	const coll = db.collection("users");
	coll.doc(uid).set({
		email : email
	}).then(()=>{
		console.log("done");
	});
});
