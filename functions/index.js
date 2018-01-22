const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

exports.createUser = functions.https.onRequest((req, res) => {
	var password = req.body.password;
	var email = req.body.email;
	var first = req.body.first;
	var last = req.body.last;
	var phone = req.body.phone;

	if(typeof phone === 'undefined') {
        var json_res = {
            "message": "Validation failed",
            "name": "ValidationError",
            "errors": {
                "name": {
                    "message": "Path `phone` is required.",
                    "name": "ValidatorError",
                    "path": "phone",
                    "type": "required"
                }
            }
        }
        return res.status(400).json(json_res);
    }
    if(isNaN(phone) || phone.length !== 10) {
    	var json_res = {
            "message": "Validation failed",
            "name": "ValidationError",
            "errors": {
                "name": {
                    "message": "Phone number must only include numbers, Phone number must be 10 digits",
                    "name": "ValidatorError",
                    "path": "phone",
                    "type": "format"
                }
            }
        }
        return res.status(400).json(json_res);
    }
	if(typeof password === 'undefined' || password.length === 0) {
        var json_res = {
            "message": "Validation failed",
            "name": "ValidationError",
            "errors": {
                "name": {
                    "message": "Path `password` is required.",
                    "name": "ValidatorError",
                    "path": "password",
                    "type": "required"
                }
            }
        }
            return res.status(400).json(json_res);
    }
    if(typeof email === 'undefined' || email.length === 0) {
        var json_res = {
            "message": "Validation failed",
            "name": "ValidationError",
            "errors": {
                "name": {
                    "message": "Path `email` is required.",
                    "name": "ValidatorError",
                    "path": "email",
                    "type": "required"
                }
            }
        }
            return res.status(400).json(json_res);
    }
    if(typeof first === 'undefined' || typeof last === 'undefined'
    	|| first.length === 0 || last.length === 0) {
        var json_res = {
            "message": "Validation failed",
            "name": "ValidationError",
            "errors": {
                "name": {
                    "message": "First and Last name required.",
                    "name": "ValidatorError",
                    "path": "name",
                    "type": "required"
                }
            }
        }
            return res.status(400).json(json_res);
    }
    if(password.length < 8 || password.length > 72) {
    	var json_res = {
            "message": "Validation failed",
            "name": "ValidationError",
            "errors": {
                "name": {
                    "message": "Passwords must be between 8 and 72 characters",
                    "name": "ValidatorError",
                    "path": "password",
                    "type": "length"
                }
            }
        }
            return res.status(400).json(json_res);
    }
    const newUser = {
  		email: email,
  		emailVerified: true,
  		phoneNumber: "+1" + phone,
  		password: password,
  		displayName: first + " " + last,
  		//photoURL: "http://www.example.com/12345678/photo.png",
	};
  	admin.auth().createUser(newUser)
  	.then(function(userRecord) {
    	// See the UserRecord reference doc for the contents of userRecord.
    	console.log("Successfully created new user:", userRecord.uid);
    	return res.status(200).json(newUser);
 	 })
  	.catch(function(error) {
    	console.log("Error creating new user:", error);
    	return res.status(400).send(error);
  	});
});

exports.storeNewUser = functions.auth.user().onCreate(event => {
	const uid = event.data.uid;
	const email = event.data.email;
	const phoneNumber = event.data.phoneNumber;
	const name = event.data.displayName;

	const coll = db.collection("users");
	return coll.doc(uid).set({
		email : email,
		phoneNumber : phoneNumber,
		name: name
	})
	.then(function() {
		console.log("New user successfully added to database");
	})
	.catch(function(error) {
		console.error("Error adding new user to database: ", error);
	});
});

//Write on user deletion function to remove from database
