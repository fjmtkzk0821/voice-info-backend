const admin = require('firebase-admin');

var serviceAccount = require("../voice-info-firebase-adminsdk-lt90p-66fb3dd352.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://voice-info.firebaseio.com",
  storageBucket: "voice-info.appspot.com"
});

const db = admin.firestore();

module.exports = { admin, db };