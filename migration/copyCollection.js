const firebase = require('firebase-admin');

let serviceAccount = require("./test.json"); // destination DB key

const admin = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

/* this schema is how your DB is organized in a tree structure. You don't have to care about the Documents
  but you do need to inform the name of your collections and any subcollections, in this
  case we have two collections called users and groups, the all have their documents, but 
  the collection users has its own subcollections, friends and groups, which again have their
  own subcollection, messages.
*/
const schema = {
  campus: "campuses",
  ministries: "movements",
  summermissions: "missions",
  usernotifications: "notifications",
};

// const schema = {
//     _summermissions: "_missions",
// }

const settings = {timestampsInSnapshots: true};
let source = admin.firestore();
source.settings(settings);
let aux = { ...schema };

function copy(DBref, aux) {
  return Promise.all(Object.keys(aux).map((collection) => {
    return DBref.collection(collection).get()
      .then((data) => {
        let promises = [];
        let newName = aux[collection];
        data.forEach((doc) => {
          const data = doc.data();
          promises.push(
            DBref.collection(newName).doc(doc.id).set(data)
          ); 
        })
      return Promise.all(promises);
    })
  }));
};

copy(source, aux).then(() => {
  console.log('copied');
});