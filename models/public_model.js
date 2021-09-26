const { db } = require("../util/admin");
const { CODE_ERROR_GENERAL } = require("../util/message_string");
const { CustomError, FirebaseError } = require("../util/error_message");
const { noticeConverter } = require("../objects/notice");

module.exports.getRecentNotices = async () => {
  let notices = [];
  let snapshot = await db
    .collection("notices")
    .orderBy("date", "desc")
    .limit(3)
    .withConverter(noticeConverter)
    .get()
    .catch((reason) => {
      throw new FirebaseError(reason);
    });
  for (let doc of snapshot.docs) {
    notices.push(doc.data());
  }
  return notices;
};

module.exports.getAllBasicInformation = async (condition) => {
  let list = [];
  let collRef = db.collection("users_basic");
  for (let cond of condition) {
    collRef = collRef.where(cond[0], cond[1], cond[2]);
  }
  return await collRef.get().catch((reason) => {
    throw new FirebaseError(reason);
  });
};

module.exports.getBasicInformation = async (uid) => {
  let snapshot = await db.collection("users_basic").doc(uid).get();
  if (!snapshot.exists)
    throw new CustomError(CODE_ERROR_GENERAL, "user not found.");
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

module.exports.getDetailInformation = async (uid) => {
  let snapshot = await db.collection("users_detail").doc(uid).get();
  if (!snapshot.exists)
    throw new CustomError(CODE_ERROR_GENERAL, "user not found.");
  return snapshot.data();
};

module.exports.getDLSiteScript = async (uid) => {
  let snapshot = await db.collection("dlsite_script").doc(uid).get();
  if (!snapshot.exists)
    throw new CustomError(CODE_ERROR_GENERAL, "user not found.");
  return snapshot.data();
};
