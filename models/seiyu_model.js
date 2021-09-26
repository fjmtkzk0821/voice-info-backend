const { db } = require("../util/admin");
const { CODE_ERROR_GENERAL } = require("../util/message_string");
const { CustomError, FirebaseError } = require("../util/error_message");
const { getRandomIndices } = require("../util/common");

const PublicModel = require("./public_model");
const { Seiyu } = require("../objects/users");

module.exports.getSize = async () => {
  let snapshot = await db.collection("users_basic").get();
  return snapshot.size;
};

module.exports.getAllBasicInformation = async () => {
  let list = [];
  let querySnapshot = await PublicModel.getAllBasicInformation([
    ["role", "==", "seiyu"],
    ["public", "==", true],
  ]);
  for (let doc of querySnapshot.docs) {
    list.push({
      uid: doc.id,
      ...doc.data(),
    });
  }
  return list;
};

// module.exports.getBasicInfoByPaginate = async (page) => {
//   let collRef = db.collection("users_basic");
//   collRef
//     .where("role", "==", "seiyu")
//     .where("public", "==", true)
//     .orderBy("order")
//     .startAfter((page - 1) * 15 - 1)
//     .limit(15);

//   let snapshot = await collRef.get().catch((reason) => {
//     throw new FirebaseError(reason);
//   });

//   return snapshot.docs.map((doc) => ({
//     uid: doc.id,
//     ...doc.data()
//   }));
// };

module.exports.getRandomSeiyu = async (count, withSample = false) => {
  let docs = [];
  let querySnapshot = await PublicModel.getAllBasicInformation([
    ["role", "==", "seiyu"],
    ["public", "==", true],
  ]);
  if (querySnapshot.empty) return docs;
  let indices = getRandomIndices(querySnapshot.size, count);
  for (let index of indices) {
    let basic = {
      uid: querySnapshot.docs[index].id,
      ...querySnapshot.docs[index].data(),
    };
    let seiyu = new Seiyu(basic, {});
    if (withSample) {
      let samples = await this.getUserSamples(basic.uid, 4);
      seiyu.setSamples(samples);
    }
    docs.push(seiyu);
  }
  return docs;
};

module.exports.getAllSamples = async () => {
  let samples = [];
  let querySnapshot = await db.collection("samples").get();
  for (let doc of querySnapshot.docs) {
    samples.push({
      sid: doc.id,
      ...doc.data()
    });
  }
  return samples;
};

module.exports.getUserSamples = async (uid, count = -1) => {
  let samples = [];
  let query = db.collection("samples").where("uid", "==", uid);
  if (count > 0) query.limit(count);
  let querySnapshot = await query.get();
  for (let doc of querySnapshot.docs) {
    samples.push({
      sid: doc.id,
      ...doc.data()
    });
  }
  console.log(samples);
  return samples;
};
