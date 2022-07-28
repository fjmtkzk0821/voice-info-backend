/* eslint-disable max-len */
import {FirebaseError} from "firebase/app";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail} from "firebase/auth";
import {FirestoreError} from "firebase/firestore";
import {CFirebaseError, CFirestoreError, CustomError} from "../utils/custom_error";
import {db} from "../utils/firebase_admin";
import UserDocument from "../utils/objects/user";

async function signUpByEmail(email:string, password: string) {
  const auth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
  ).catch((reason: FirebaseError) => {
    throw new CFirebaseError(reason);
  });
  const userDoc = new UserDocument(userCredential.user.uid, email);
  const snapshot = await db.collection("users").get();
  await db
      .collection("users")
      .doc(userCredential.user.uid)
      .set({
        ...userDoc.toObject(),
        order: snapshot.size + 1,
      })
      .catch((reason: FirestoreError) => {
        throw new CFirestoreError(reason);
      });
  await sendEmailVerification(userCredential.user);
  return {
    accessToken: await userCredential.user.getIdToken(),
    user: userDoc.toObject(),
  };
}

async function signInWithEmail(email: string, password: string) {
  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
  ).catch((reason: FirebaseError) => {
    throw new CFirebaseError(reason);
  });
  if (!userCredential.user.emailVerified) {
    throw new CustomError(
        "email-not-verify",
        "Please check the email to verify your account"
    );
  }
  return {
    accessToken: await userCredential.user.getIdToken(),
    uid: userCredential.user.uid,
    email: userCredential.user.email,
  };
}

async function getUserInformation(uid: string) {
  const docRef = await db.collection("seiyu").doc(uid).get();
  return {
    isSeiyu: docRef.exists,
  };
}

async function sendResetPasswordRequest(email: string) {
  const auth = getAuth();
  await sendPasswordResetEmail(auth, email).catch((reason: FirebaseError) => {
    throw new CFirebaseError(reason);
  });
}

export default {signUpByEmail, signInWithEmail, getUserInformation, sendResetPasswordRequest};
