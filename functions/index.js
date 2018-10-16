const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const app = express();
admin.initializeApp();

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

/*****************************************************************************     
* Author: Jacob Nogle ------------------------------------------ 2/2018      *
* Add additional user info                                                   *
* Expects gender, first/last name, phone number, a list of campus references *
*   and ministry references, and photo url in request body                   *                                *
******************************************************************************/
app.post('/users/add-user-info/:uid', (req, res) => {
    var uid = req.params.uid;

    var first = req.body.first;
    var last = req.body.last;
    var phone = req.body.phone;
    var imageUrl = req.body.imageLink;
    var gender = req.body.gender;
    var campuses = req.body.campuses;
    var ministries = req.body.ministries;

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
    if(typeof campuses === 'undefined' || campuses.length === 0) {
        var json_res = {
            "message": "Validation failed",
            "name": "ValidationError",
            "errors": {
                "name": {
                    "message": "User must be a member of at least one campus.",
                    "name": "ValidatorError",
                    "path": "campuses",
                    "type": "required"
                }
            }
        }
    }
    if(typeof ministries === 'undefined' || ministries.length === 0) {
        var json_res = {
            "message": "Validation failed",
            "name": "ValidationError",
            "errors": {
                "name": {
                    "message": "User must be a member of at least one ministry.",
                    "name": "ValidatorError",
                    "path": "ministries",
                    "type": "required"
                }
            }
        }
    }

    const coll = db.collection("users");

    coll.doc(uid).update({
        "name": {
            "first": first,
            "last": last
        },
        "gender": gender,
        "phone": phone,
        "profile.imageLink": imageUrl,
        "campuses": campuses,
        "ministries": ministries
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

/************************************************************************
* Author: Jacob Nogle ------------------------------------------ 3/2018 *
* Join a community group                                                *
* Expects the communityGroupId in query params                          *
*   and the new member's name and phone number in the request body      *
*************************************************************************/
app.post('/communityGroups/:id/join', (req, res) => {
    const tokenId = req.get('Authorization').split('Bearer ')[1];

    return admin.auth().verifyIdToken(tokenId)
        .then((decoded) => {
            var communityGroupId = req.params.id;
            var name = req.body.name;
            var phone = req.body.phone;
            var memberId = req.body.uid;

            var cgRef = db.collection('communityGroups').doc(communityGroupId);
            var memberRef = db.collection('users').doc(memberId);
            var cgMembers;
            var memberCgs;

            var getMember = memberRef.get().then(function (doc) {
                if (doc.exists) {
                    if (doc.data().communityGroups) {
                        memberCgs = doc.data().communityGroups;
                        if(!memberCgs.includes(cgRef)) {
                            memberCgs.push(cgRef);
                        } else {
                            console.log("User already a member of this community group");
                            return res.status(200).send("Already joined");
                        }
                    } else {
                        memberCgs = [cgRef];
                    }
                    var updateCommunityGroups = memberRef.update({ communityGroups: memberCgs });
                } else {
                    console.log("No such document!");
                    return res.status(404).send('User not found');
                }
            }).catch(function (error) {
                console.log("Error getting document:", error);
                return res.status(400).send(error);
            });

            var getGroup = cgRef.get()
                .then(doc => {
                    if (!doc.exists) {
                        console.log('No such document!');
                        return res.status(404).send('Community Group not found');
                    } else {
                        var cgName = doc.data().name;
                        var leaders = doc.data().leaders;
                        if (doc.data().members) {
                            cgMembers = doc.data().members;
                            cgMembers.push(memberRef);
                        } else {
                            cgMembers = [memberRef];
                        }
                        var updateMembers = cgRef.update({ members: cgMembers });
                    }
                    var message = name + " wants to join " + cgName + ". Their phone number is " + phone + ".";
                    leaders.forEach(leaderRef => {
                        var getUser = leaderRef.get()
                            .then(doc => {
                                if (!doc.exists) {
                                    console.log('No such document!');
                                    return res.status(404).send('Leader not found in users collection');
                                } else {
                                    var leader = doc.data();
                                    var fcmToken;
                                    if (leader.fcmId) {
                                        fcmToken = {
                                            id: leader.fcmId,
                                            device: leader.deviceType,
                                            user: doc.id
                                        };
                                    } else {
                                        fcmToken = {
                                            user: doc.id
                                        };
                                    }
                                }
                                notificationUtils.sendToOneDevice(fcmToken, "Community Group Join", message, "", function (err) {
                                    if (err) return res.apiError('failed to send notification', err);
                                });
                            })
                            .catch(err => {
                                console.log('Error getting document', err);
                                return res.status(400).send(err);
                            });
                    })
                })
                .catch(err => {
                    console.log('Error getting document', err);
                    return res.status(400).send(err);
                });
            return res.status(200).send("Leaders notified of join");
        })
        .catch((err) => {
            res.status(401).send(err);
        });
});

exports.api = functions.https.onRequest(app);

/*******************************************************************
* Author: Jacob Nogle ------------------------------------- 1/2018 *
* Function to write newly created users to database                *
* Triggered by new user creation                                   *
********************************************************************/
exports.storeNewUser = functions.auth.user().onCreate((userRecord, context) => {
    const uid = userRecord.uid;
    const email = userRecord.email;

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
        created: Firestore.Timestamp.now(),
        updated: Firestore.Timestamp.now(),
        disabled: false,
        deleted: null,
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
exports.removeUser = functions.auth.user().onDelete((userRecord, context) => {
    const uid = userRecord.uid;
    const coll = db.collection("users");

    return coll.doc(uid).delete()
        .then(function () {
            console.log("User successfully deleted from database");
        })
        .catch(function (error) {
            console.error("Error deleting user from database")
        })
});

/*******************************************************************
* Author: Jacob Nogle ------------------------------------- 3/2018 *
* fcm utility functions                                            *
********************************************************************/
var fcmUtils = {
    createMessage: function (title, body, device) {
        // iOS requires a certain message format
        if (device === "iphone") {
            return {
                notification: {
                    body: body,
                    title: title,
                    sound: "default"
                }
            };
        } else {
            return {
                data: {
                    message: body,
                    title: title,
                    sound: "default"
                }
            };
        }
    }
};

/*******************************************************************
* Author: Jacob Nogle ------------------------------------- 3/2018 *
* notification utility functions                                   *
********************************************************************/
var notificationUtils = {
    sendToDevice: function (tokens, title, body, subTitle, callback) {
        if (!Array.isArray(tokens)) return new Error("sendToDevice expects an Array of FCM Tokens as its first parameter");

        var options = {
            contentAvailable: true,
            priority: "high"
        };

        tokens.forEach(function (token) {
            if (token.id) {
                var payload = fcmUtils.createMessage(title, body, token.device);

                admin.messaging().sendToDevice(token.id, payload, options).then(function () {
                    this.addToUserNotifications(title, body, subTitle, true, token.user);
                    callback();
                }).catch(function (error) {
                    this.addToUserNotifications(title, body, subTitle, false, token.user);
                    callback(error);
                });
            } else {
                this.addToUserNotifications(title, body, subTitle, false, token.user);
            }
        }, this);
    },
    sendToOneDevice: function (token, title, body, subTitle, callback) {
        var options = {
            contentAvailable: true,
            priority: "high"
        };

        if (token.id) {
            var payload = fcmUtils.createMessage(title, body, token.device);

            admin.messaging().sendToDevice(token.id, payload, options).then(function () {
                this.addToUserNotifications(title, body, subTitle, true, token.user);
                callback();
            }).catch(function (error) {
                this.addToUserNotifications(title, body, subTitle, false, token.user);
                callback(error);
            });
        } else {
            this.addToUserNotifications(title, body, subTitle, false, token.user);
        }
    },
    addToUserNotifications: function (title, body, subTitle, sent, user) {
        db.collection("userNotifications").add({
            title: title,
            body: body,
            subTitle: subTitle,
            sent: sent,
            user: user.toString()
        })
    }
};

