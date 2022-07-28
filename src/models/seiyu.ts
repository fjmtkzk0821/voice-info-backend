import admin from "firebase-admin";
import {getStorage} from "firebase-admin/storage";
import {FirestoreError} from "firebase/firestore";
import {
  getObjectDifferent,
  getUrlFromStorageBucket,
  isStringEmpty,
} from "../utils/common";
import {
  CFirestoreError,
  CustomError,
  PermissionDeniedError,
  UnknownError,
} from "../utils/custom_error";
import {db} from "../utils/firebase_admin";
import {
  seiyuDetailDocConverter,
  SeiyuDetailDocument,
  seiyuDocConverter,
  SeiyuDocument,
  seiyuSampleDocConverter,
  SeiyuSampleDocument,
} from "../utils/objects/seiyu";

async function findProfile(uid: string) {
  const docRef = await db
      .collection("seiyu")
      .doc(uid)
      .withConverter(seiyuDocConverter)
      .get()
      .catch((reason: FirestoreError) => {
        throw new CFirestoreError(reason);
      });
  if (!docRef.exists) {
    throw new CustomError("seiyu_not_reg", "You did not register as a seiyu.");
  }
  return docRef;
}

async function register(uid: string): Promise<boolean> {
  console.log(uid);
  const seiyuDoc = new SeiyuDocument();
  const detailDoc = new SeiyuDetailDocument();
  seiyuDoc.uid = uid;
  detailDoc.uid = uid;
  const docRef = await db.collection("seiyu").doc(uid).get();
  if (!docRef.exists) {
    await Promise.all([
      db
          .collection("seiyu")
          .doc(uid)
          .withConverter(seiyuDocConverter)
          .set(seiyuDoc)
          .catch((reason: FirestoreError) => {
            throw new CFirestoreError(reason);
          }),
      db
          .collection("seiyu_detail")
          .doc(uid)
          .withConverter(seiyuDetailDocConverter)
          .set(detailDoc)
          .catch((reason: FirestoreError) => {
            throw new CFirestoreError(reason);
          }),
    ]);
  } else {
    throw new CustomError("doc_already_exist", "Document already exist.", 400);
  }
  return true;
}

async function informationRetrieve(
    uid: string
): Promise<SeiyuDocument | undefined> {
  const docRef = await findProfile(uid);
  return docRef.data();
}

async function detailInformationRetrieve(
    uid: string
): Promise<SeiyuDetailDocument | undefined> {
  const docRef = await db
      .collection("seiyu_detail")
      .doc(uid)
      .withConverter(seiyuDetailDocConverter)
      .get()
      .catch((reason: FirestoreError) => {
        throw new CFirestoreError(reason);
      });
  if (!docRef.exists) {
    throw new CustomError("seiyu_not_reg", "You did not register as a seiyu.");
  }
  return docRef.data();
}

async function samplesRetrieve(
    uuid: string
): Promise<SeiyuSampleDocument[]> {
  const docRef = await findProfile(uuid);
  if (!docRef.exists) {
    throw UnknownError;
  }
  const snapshot = await db
      .collection("samples")
      .where("pid", "==", uuid)
      .withConverter(seiyuSampleDocConverter)
      .get().catch((reason: FirestoreError) => {
        throw new CFirestoreError(reason);
      });
  return snapshot.docs.map((ss) => ss.data());
}

async function informationUpdate(
    uid: string,
    data: any,
    avatar?: {path: string, filename: string, mimetype: string},
): Promise<boolean> {
  const docRef = await findProfile(uid);
  if (avatar) {
    await getStorage().bucket()
        .upload(avatar.path, {
          resumable: false,
          metadata: {
            contentType: avatar.mimetype,
          },
        })
        .catch((reason) => {
          console.error(reason);
          throw reason;
          // throw new FirebaseError(reason);
        });
    data.avatar = avatar.filename;
  }
  const doc = docRef.data();
  if (doc != undefined) {
    await db
        .collection("seiyu")
        .doc(uid)
        .update(getObjectDifferent(doc.toObject(), data))
        .catch((reason: FirestoreError) => {
          throw new CFirestoreError(reason);
        });
    if (
      avatar &&
      !isStringEmpty(doc.avatar) &&
      !doc.avatar.includes("no_img.jpg")
    ) {
      console.log("IN");
      await admin
          .storage()
          .bucket()
          .file(doc.avatar)
          .delete()
          .catch((reason) => {
            console.error(reason);
          // throw reason;
          // throw new FirebaseError(reason);
          });
    }
  }
  return true;
}

async function detailInformationUpdate(uid: string, data: any) {
  const docRef = await db
      .collection("seiyu_detail")
      .doc(uid)
      .withConverter(seiyuDetailDocConverter)
      .get().catch((reason: FirestoreError) => {
        throw new CFirestoreError(reason);
      });
  if (!docRef.exists) {
    throw new CustomError("seiyu_not_reg", "You did not register as a seiyu.");
  }
  const doc = docRef.data();
  console.log(data);
  if (doc != undefined) {
    await db
        .collection("seiyu_detail")
        .doc(uid)
        .update(getObjectDifferent(doc.toObject(), data))
        .catch((reason: FirestoreError) => {
          throw new CFirestoreError(reason);
        });
  }
  return;
}

async function sampleUpload(
    uid: string,
    sample: { path: string; filename: string; mimetype: string },
    data: any
): Promise<SeiyuSampleDocument[]> {
  const docRef = await findProfile(uid);
  if (!docRef.exists) {
    throw UnknownError;
  }
  const querySnapshot = await db.collection("samples")
      .where("uid", "==", uid)
      .withConverter(seiyuSampleDocConverter)
      .get().catch((reason: FirestoreError) => {
        throw new CFirestoreError(reason);
      });
  if (querySnapshot.size >= 8) {
    throw new CustomError(
        "sample_count_over_limit",
        "You can not upload more then 8 samples"
    );
  }
  await getStorage()
      .bucket()
      .upload(sample.path, {
        resumable: false,
        metadata: {
          contentType: sample.mimetype,
        },
      })
      .catch((reason) => {
        console.error(reason);
        throw reason;
      });
  data.pid = uid;
  data.url = getUrlFromStorageBucket(sample.filename);
  data.filename = sample.filename;
  const doc = SeiyuSampleDocument.fromObject(data);
  console.log(doc);
  await db
      .collection("samples")
      .withConverter(seiyuSampleDocConverter)
      .add(doc)
      .catch((reason: FirestoreError) => {
        throw new CFirestoreError(reason);
      });
  return querySnapshot.docs.map((ss) => ss.data());
}

async function sampleDelete(uuid: string, uid: string): Promise<boolean> {
  const snapshot = await db
      .collection("samples")
      .doc(uid)
      .withConverter(seiyuSampleDocConverter)
      .get().catch((reason: FirestoreError) => {
        throw new CFirestoreError(reason);
      });
  if (!snapshot.exists) {
    throw new CustomError("sample_not_exist", "Sample not found.");
  }
  const doc = snapshot.data();
  if (doc != undefined) {
    if (doc.pid !== uuid) {
      throw PermissionDeniedError;
    }
    const file = getStorage().bucket().file(doc.filename);
    if ((await file.exists())[0]) {
      await file.delete().catch((reason) => {
        console.error(reason);
        throw reason;
      });
    }
    await db
        .collection("samples")
        .doc(uid)
        .delete()
        .catch((reason: FirestoreError) => {
          throw new CFirestoreError(reason);
        });
  }
  return true;
}

export default {
  register,
  informationRetrieve,
  detailInformationRetrieve,
  samplesRetrieve,
  informationUpdate,
  detailInformationUpdate,
  sampleUpload,
  sampleDelete,
};
