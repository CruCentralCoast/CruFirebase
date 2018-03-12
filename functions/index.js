const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const app = express();
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

/************************************************************************
* Author: Jacob Nogle ------------------------------------------ 1/2018 *
* Create a new user                                                     *
* Expects email, password, first/last name, phone number, and photo url *
*  in request body                                                      *
*************************************************************************/
app.post('/users/register-user', (req, res) => {
    var password = req.body.password;
    var email = req.body.email;

    if (typeof password === 'undefined' || password.length === 0) {
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
    if (password.length < 8 || password.length > 72) {
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
    if (typeof email === 'undefined' || email.length === 0) {
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
    const newUser = {
        email: email,
        password: password,
    };
    admin.auth().createUser(newUser)
        .then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully created new user:", userRecord.uid);
            return res.status(200).json(newUser);
        })
        .catch(function (error) {
            console.log("Error creating new user:", error);
            return res.status(400).send(error);
        });
});

/************************************************************************
* Author: Jacob Nogle ------------------------------------------ 2/2018 *
* Add additional user info                                              *
* Expects gender, first/last name, phone number, and photo url          *
*  in request body                                                      *
*************************************************************************/
app.post('/users/add-user-info/:uid', (req, res) => {
    var uid = req.params.uid;

    var first = req.body.first;
    var last = req.body.last;
    var phone = req.body.phone;
    var imageUrl = req.body.imageLink;
    var gender = req.body.gender;

    if (typeof gender === 'undefined' || gender.length === 0) {
        var json_res = {
            "message": "Validation failed",
            "name": "ValidationError",
            "errors": {
                "name": {
                    "message": "Path `gender` is required.",
                    "name": "ValidatorError",
                    "path": "gender",
                    "type": "required"
                }
            }
        }
        return res.status(400).json(json_res);
    }
    if (!['Unknown', 'Male', 'Female', 'Not Applicable'].includes(gender)) {
        var json_res = {
            "message": "Validation failed",
            "name": "ValidationError",
            "errors": {
                "name": {
                    "message": "Path `gender` must be  one of the following: Male, Female, Unknown, Not Applicable",
                    "name": "ValidatorError",
                    "path": "gender",
                    "type": "option"
                }
            }
        }
        return res.status(400).json(json_res);
    }
    if (typeof phone === 'undefined' || phone.length === 0) {
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
    if (isNaN(phone) || phone.length !== 10) {
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
    if (typeof first === 'undefined' || typeof last === 'undefined'
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

    const coll = db.collection("users");

    return coll.doc(uid).update({
        "name": {
            "first": first,
            "last": last
        },
        "gender": gender,
        "phone": phone,
        "profile.imageLink": imageUrl
    })
        .then(function () {
            console.log("New user info successfully added to database");
            return res.status(200).send();
        })
        .catch(function (error) {
            console.error("Error adding new user data to database: ", error);
            return res.status(400).send(error);
        });
});

/************************************************************************
* Author: Jacob Nogle ------------------------------------------ 1/2018 *
* Delete a specified user                                               *
* Expects uid in query params                                           *
*************************************************************************/
app.delete('/users/delete-user/:uid', (req, res) => {
    const uid = req.params.uid;
    admin.auth().deleteUser(uid)
        .then(function () {
            console.log("Successfully deleted user");
            return res.status(200).send();
        })
        .catch(function (error) {
            console.log("Error deleting user:", error);
            return res.status(400).send(error);
        })
});

exports.api = functions.https.onRequest(app);

/*******************************************************************
* Author: Jacob Nogle ------------------------------------- 1/2018 *
* Function to write newly created users to database                *
* Triggered by new user creation                                   *
********************************************************************/
exports.storeNewUser = functions.auth.user().onCreate(event => {
    const uid = event.data.uid;
    const email = event.data.email;

    const coll = db.collection("users");
    //Add default data 
    return coll.doc(uid).set({
        email: email,
        profile: {
            isPublic: true,
            isStaff: false,
            isCommunityGroupLeader: false,
            isMinistryTeamLeader: false,
            isSummerMissionLeader: false,
        },
        notifications: {
            ministryTeamUpdates: true,
            communityGroupUpdates: true,
            summerMissionUpdates: true
        },
        permissions: {
            isAdmin: false,
            isVerified: false
        },
        lastActive: Date.now()
    })
        .then(function () {
            console.log("New user successfully added to database");
        })
        .catch(function (error) {
            console.error("Error adding new user to database: ", error);
        });
});

/*******************************************************************
* Author: Jacob Nogle ------------------------------------- 1/2018 *
* Function to remove a user from the database                      *
* Triggered by user deletion                                       *
********************************************************************/
exports.removeUser = functions.auth.user().onDelete(event => {
    const uid = event.data.uid;
    const coll = db.collection("users");

    return coll.doc(uid).delete()
        .then(function () {
            console.log("User successfully deleted from database");
        })
        .catch(function (error) {
            console.error("Error deleting user from database")
        })
});
