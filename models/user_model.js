const firebase = require("firebase");

const { db, admin } = require("../util/admin");
const { CODE_ERROR_GENERAL } = require("../util/message_string");
const { FirebaseError, CustomError } = require("../util/error_message");
const { Seiyu, Circle, UserCredential, User } = require("../objects/users");
const { getBucketUrl, validImageTypes } = require("../util/common");

module.exports.signUp = async (credential, role) => {
  let userCredential = new UserCredential(
    credential.email,
    credential.password,
    credential.confirmPassword
  );
  userCredential.checkRegisterValid();
  let user = getSignUpRoleObject(role);
  let authCredential = await firebase.default
    .auth()
    .createUserWithEmailAndPassword(
      userCredential.email,
      userCredential.password
    )
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  user.avatar = {
    name: "no_img.jpg",
    link: getBucketUrl("no_img.jpg"),
  };
  await Promise.all([
    db
      .collection("users_basic")
      .get()
      .then((snapshot) => {
        return db.doc(`/users_basic/${authCredential.user.uid}`).set({
          ...user.getBasicObject(),
          order: snapshot.size + 1,
        });
      })
      .catch((reason) => {
        throw new FirebaseError(reason);
      }),
    db
      .doc(`/users_detail/${authCredential.user.uid}`)
      .set(user.getDetailObject())
      .catch((reason) => {
        throw new FirebaseError(reason);
      }),
    db
      .doc(`/dlsite_script/${authCredential.user.uid}`)
      .set({
        script: "",
      })
      .catch((reason) => {
        throw new FirebaseError(reason);
      }),
  ]);
  return {
    token: await authCredential.user.getIdToken(),
    uid: authCredential.user.uid,
  };
};

module.exports.login = async (credential) => {
  let userCredential = new UserCredential(
    credential.email,
    credential.password,
    null
  );
  userCredential.checkLoginValid();
  let authCredential = await firebase.default
    .auth()
    .signInWithEmailAndPassword(userCredential.email, userCredential.password)
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  return {
    token: await authCredential.user.getIdToken(),
    uid: authCredential.user.uid,
  };
};

module.exports.updateBasicInformation = async (data) => {
  let user = new User(data);
  let result = await db
    .doc(`/users_basic/${user.uid}`)
    .update(user.toFirestore())
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  return result;
};

module.exports.updateDetailInformation = async (basic, data) => {
  let user = new Seiyu(basic, data);
  let result = await db
    .doc(`/users_detail/${user.uid}`)
    .update(user.getDetailObject())
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  return result;
};

module.exports.updateDLSiteScript = async (data) => {
  let result = await db
    .doc(`/dlsite_script/${data.uid}`)
    .update({ script: data.script })
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  return result;
};

module.exports.uploadAvatar = async (uid, uploaded) => {
  if (!validImageTypes.includes(uploaded.detail.mimetype)) {
    throw new CustomError(
      CODE_ERROR_GENERAL,
      "Only support image type JPG/PNG"
    );
  }
  let snapshot = await db.doc(`/users_basic/${uid}`).get();
  if (!snapshot.exists)
    throw new CustomError(CODE_ERROR_GENERAL, "User not found.");
  let data = snapshot.data();
  if (
    data.avatar.name != null &&
    data.avatar.name.length != 0 &&
    !data.avatar.name.includes("no_img.jpg")
  ) {
    await admin
      .storage()
      .bucket()
      .file(data.avatar.name)
      .delete()
      .catch((reason) => {
        throw new FirebaseError(reason);
      });
  }
  await admin
    .storage()
    .bucket()
    .upload(uploaded.detail.filepath, {
      resumable: false,
      metadata: {
        contentType: uploaded.detail.mimetype,
      },
    })
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  const url = getBucketUrl(uploaded.filename);
  let doc = {
    avatar: {
      name: uploaded.filename,
      link: url,
    },
  };
  await db
    .doc(`/users_basic/${uid}`)
    .update(doc)
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  return doc;
};

module.exports.getSamples = async (uid) => {
  let samples = [];
  const snapshot = await db.collection("samples").where("uid", "==", uid).get();
  if (!snapshot.empty) {
    snapshot.forEach((doc) => {
      samples.push({
        sId: doc.id,
        ...doc.data(),
      });
    });
  }
  return samples;
};

module.exports.uploadSample = async (data) => {
  if (!data.uploaded.detail.mimetype.includes("audio"))
    throw new CustomError(CODE_ERROR_GENERAL, "Only support audio type file");
  let querySnapshot = await db
    .collection("samples")
    .where("uid", "==", data.uid)
    .get();
  if (querySnapshot.size >= 8) {
    throw new CustomError(
      CODE_ERROR_GENERAL,
      "You can not upload more then 8 samples"
    );
  }
  await admin
    .storage()
    .bucket()
    .upload(data.uploaded.detail.filepath, {
      resumable: false,
      metadata: {
        contentType: data.uploaded.detail.mimetype,
      },
    })
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  const url = getBucketUrl(data.uploaded.filename);
  let doc = {
    file: data.uploaded.filename,
    link: url,
    type: data.type,
    uid: data.uid,
  };
  let docRef = await db
    .collection("samples")
    .add(doc)
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  doc.sId = docRef.id;
  return doc;
};

module.exports.deleteSample = async (data) => {
  let snapshot = await db.collection("samples").doc(data.sid).get();
  if (!snapshot.exists)
    throw new CustomError(CODE_ERROR_GENERAL, "Sample not found.");
  if (data.uid !== snapshot.get("uid"))
    throw new CustomError(CODE_ERROR_GENERAL, "Permission denied.");
  let file = admin.storage().bucket().file(snapshot.get("file"));
  if ((await file.exists())[0])
    await file.delete().catch((reason) => {
      throw new FirebaseError(reason);
    });
  await db
    .doc(`/samples/${data.sid}`)
    .delete()
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  return snapshot.data;
};

module.exports.browseOwnEvents = async (uid) => {
  let events = [];
  let snapshot = await db
    .collection("events")
    .where("organizer", "==", uid)
    .get();
  snapshot.forEach((doc) => {
    let ev = new EventObject(doc.data());
    events.push(ev.toStandardObject());
  });
  return events;
};

module.exports.createEvent = async (params) => {
  let event = new EventObject(params.data);
  if (params.file !== "undefined") {
    if (!common.validImageTypes.includes(params.uploaded.detail.mimetype))
      throw new CustomError(
        CODE_ERROR_GENERAL,
        "Only support image type JPG/PNG"
      );
    await admin
      .storage()
      .bucket()
      .upload(params.uploaded.detail.filepath, {
        resumable: false,
        metadata: {
          contentType: params.uploaded.detail.mimetype,
        },
      })
      .catch((reason) => {
        throw new FirebaseError(reason);
      });
    event.cover = {
      file: params.uploaded.filename,
      url: common.getBucketUrl(params.uploaded.filename),
    };
  }
  let docRef = await db
    .collection("events")
    .add(event.toFirestore())
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  event.id = docRef.id;
  return event;
};

module.exports.deleteEvent = async (params) => {
  let snapshot = await db.doc(`/events/${params.eId}`).get();
  if (!snapshot.exists)
    throw new CustomError(CODE_ERROR_GENERAL, "Event not exist.");
  if (snapshot.get("organizer") !== params.uid)
    throw new CustomError(CODE_ERROR_GENERAL, "Permission denied.");
  let data = snapshot.data();
  await db
    .doc(`/events/${params.eId}`)
    .delete()
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  if (data.cover.name !== "no_img.jpg") {
    await admin
      .storage()
      .bucket()
      .file(data.cover.name)
      .delete()
      .catch((reason) => {
        throw new FirebaseError(reason);
      });
  }
  return data;
};

function getSignUpRoleObject(role) {
  switch (role) {
    case "seiyu":
      return Seiyu.empty();
    case "circle":
      return Circle.empty();
    default:
      throw new CustomError(CODE_ERROR_GENERAL, "Role type not correct.");
  }
  //   if (req.body.role == "seiyu") {
  //     userCredentials = userProfile.seiyu();
  //   } else if (req.body.role == "circle") {
  //     userCredentials = userProfile.circle();
  //   } else {
  //     return res
  //       .status(400)
  //       .json({ code: CODE_ERROR_GENERAL, msg: "Role type not correct." });
  //   }
}
