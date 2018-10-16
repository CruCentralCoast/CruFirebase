const firebase = require('firebase-admin');

let serviceAccountSource = require("./prod.json"); // source DB key
let serviceAccountDestination = require("./test.json"); // destination DB key

const sourceAdmin = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccountSource)
});

const destinationAdmin = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccountDestination)
}, "destination");

/* this schema is how your DB is organized in a tree structure. You don't have to care about the Documents
  but you do need to inform the name of your collections and any subcollections, in this
  case we have two collections called users and groups, the all have their documents, but 
  the collection users has its own subcollections, friends and groups, which again have their
  own subcollection, messages.
*/
const schema = {
  campus: {},
  communitygroups: {},
  events: {},
  ministries: {},
  ministryteams: {},
  permissionGroups: {},
  resourcepages: {},
  resources: {},
  resourcetags: {},
  summermissions: {},
  usernotifications: {},
  users: {},
};

// const schema = {
//     _communitygroups: {},
//     _events: {},
//     _ministryteams: {},
//     _resources: {},
//     _summermissions: {},
//     _users: {},
// }

const settings = {timestampsInSnapshots: true};
let source = sourceAdmin.firestore();
let destination = destinationAdmin.firestore();
source.settings(settings);
destination.settings(settings);
let aux = { ...schema };

const copy = (sourceDBrep, destinationDBref, aux) => {
  return Promise.all(Object.keys(aux).map((collection) => {
    return sourceDBrep.collection(collection).get()
      .then((data) => {
        let promises = [];
        data.forEach((doc) => {
          const data = doc.data();
          promises.push(
            destinationDBref.collection(collection).doc(doc.id).set(data).then((data) => {
              return copy(sourceDBrep.collection(collection).doc(doc.id),
              destinationDBref.collection(collection).doc(doc.id),
              aux[collection])
            })
          ); 
        })
      return Promise.all(promises);
    })
  }));
};

copy(source, destination, aux).then(() => {
  console.log('copied');
});