/* eslint-disable max-len */
import admin from "firebase-admin";
import {initializeApp} from "firebase/app";
import {QueryDocumentSnapshot} from "firebase/firestore";
import * as serviceAccount from "../voice-info-firebase-adminsdk-lt90p-8868d7676e.json";
// import firebaseConfig from "../config.json";

const params = { // clone json object into new object to make typescript happy
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};

const firebaseConfig = {
  apiKey: "AIzaSyAFjzW1Ld26DUcOGRKOixaPknuKohpZQME",
  authDomain: "voice-info.firebaseapp.com",
  projectId: "voice-info",
  storageBucket: "voice-info.appspot.com",
  messagingSenderId: "1038222256032",
  appId: "1:1038222256032:web:897f38a1c346efaeb1a6c5",
  measurementId: "G-5EJTY0JSYK",
};

initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(params),
  databaseURL: "https://voice-info.firebaseio.com",
  storageBucket: "voice-info.appspot.com",
});

const db = admin.firestore();

const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    snap.data() as T,
});

export {db, converter};
