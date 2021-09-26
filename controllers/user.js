const common = require("../util/common");

const {
  BodyEmptyError,
} = require("../util/error_message");
const { CODE_SUCCESS } = require("../util/message_string");
const UserModel = require("../models/user_model");

//auth
module.exports.signUp = async (req, res, next) => {
  try {
    if (common.isEmptyObj(req.body)) throw new BodyEmptyError();
    let authCredential = await UserModel.signUp(
      {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      },
      req.body.role
    );
    return res.status(201).json({
      code: CODE_SUCCESS,
      msg: `Signed up successfully`,
      token: authCredential.token,
      uid: authCredential.uid,
    });
  } catch (e) {
    return next(e);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    if (common.isEmptyObj(req.body)) throw new BodyEmptyError();
    let authCredential = await UserModel.login({
      email: req.body.email,
      password: req.body.password,
    });
    return res.json({
      code: CODE_SUCCESS,
      token: authCredential.token,
      uid: authCredential.uid,
    });
  } catch (e) {
    return next(e);
  }
};

module.exports.logout = (req, res) => {};
//basic information
module.exports.updateUserBasicInformation = async (req, res, next) => {
  try {
    if (common.isEmptyObj(req.body)) throw new BodyEmptyError();
    let result = await UserModel.updateBasicInformation({
      uid: req.user.uid,
      public: req.body.public,
      name: req.body.name,
      gender: req.body.gender,
      intro: req.body.intro,
      twitter: req.body.twitter,
      email: req.body.email,
      page: req.body.page,
    });
    return res.json({ code: CODE_SUCCESS, msg: "Update successfully" });
  } catch (e) {
    return next(e);
  }
};

module.exports.updateUserDetailInformation = async (req, res, next) => {
  // let userProfile;
  try {
    if (common.isEmptyObj(req.body)) throw new BodyEmptyError();
    await UserModel.updateDetailInformation(
      { uid: req.user.uid },
      {
        jozu: req.body.jozu,
        wish: req.body.wish,
        able: req.body.able,
        statusDetail: req.body.statusDetail,
        precaution: req.body.precaution,
        feeDetail: req.body.feeDetail,
        equip: req.body.equip,
        otherDetail: req.body.otherDetail,
        experiences: req.body.experiences,
        hires: req.body.hires,
      }
    );
    return res.json({ code: CODE_SUCCESS, msg: "Update successfully" });
  } catch (e) {
    return next(e);
  }
};

module.exports.updateDLsiteScript = async (req, res, next) => {
  try {
    if (common.isEmptyObj(req.body)) throw new BodyEmptyError();
    let result = await UserModel.updateDLSiteScript({
      uid: req.user.uid,
      script: req.body.script,
    });
    return res.json({ code: CODE_SUCCESS, msg: "Update successfully" });
  } catch (e) {
    return next(e);
  }
};

module.exports.uploadAvatar = async (req, res, next) => {
  try {
    let doc = await UserModel.uploadAvatar(req.user.uid, req.uploaded);
    return res.json({
      code: CODE_SUCCESS,
      msg: "Image uploaded successfully",
      data: doc,
    });
  } catch (err) {
    return next(e);
  }
};

/**Seiyu samples' management*/
module.exports.browseSamples = async (req, res, next) => {
  try {
    return res.json(await UserModel.getSamples(req.params.uid));
  } catch (e) {
    return next(e);
  }
};
module.exports.uploadSample = async (req, res, next) => {
  try {
    let result = await UserModel.uploadSample({
      uid: req.user.id,
      type: res.locals.fields.type,
      uploaded: req.uploaded,
    });
    return res.json({
      code: CODE_SUCCESS,
      msg: "Audio uploaded successfully",
      payload: result,
    });
  } catch (e) {
    return next(e);
  }
};

module.exports.deleteSample = async (req, res, next) => {
  console.log({
    uid: req.user.uid,
    sid: req.params.sid,
  });
  try {
    await UserModel.deleteSample({
      uid: req.user.uid,
      sid: req.params.sid,
    });
    return res.json({ code: CODE_SUCCESS, msg: "Audio deleted" });
  } catch (e) {
    return next(e);
  }
};

///Event management
module.exports.browseEvents = async (req, res) => {
  try {
    let events = await UserModel.browseOwnEvents(req.user.uid);
    return res.json(events);
  } catch(e) {
    next(e);
  }
  // db.collection("events")
  //   .where("organizer", "==", req.user.uid)
  //   .get()
  //   .then((data) => {
  //     let events = [];
  //     data.forEach((doc) => {
  //       //console.log(doc.data());
  //       let expired = false;
  //       let expiredDate;
  //       switch (doc.data().period) {
  //         case "once":
  //           expiredDate = new Date(doc.data().date);
  //           expired = expiredDate.getTime() - Date.now() < 0;
  //           console.log(expiredDate.getTime() - Date.now());
  //           break;
  //         case "limited":
  //           expiredDate = new Date(doc.data().date.end);
  //           expired = expiredDate.getTime() - Date.now() < 0;
  //           break;
  //         default:
  //           expired = false;
  //       }
  //       console.log(expired);
  //       events.push({
  //         eId: doc.id,
  //         expired: expired,
  //         public: doc.data().public,
  //         period: doc.data().period,
  //         cover: doc.data().cover,
  //         date: doc.data().date,
  //         detail: doc.data().detail,
  //         title: doc.data().title,
  //         type: doc.data().type,
  //         storage: doc.data().storage,
  //         organizer: doc.data().organizer,
  //       });
  //     });
  //     return res.json(events);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     let msgStr = errMsg.getErrStr(err.code);
  //     if (msgStr != null) {
  //       return res
  //         .status(400)
  //         .json({ code: err.code, msg: errMsg.getErrStr(err.code) });
  //     } else {
  //       return res
  //         .status(500)
  //         .json({ code: err.code, msg: errMsg.getErrStr(err.code) });
  //     }
  //   });
};

module.exports.addEvent = async (req, res) => {
  try {
    if (common.isEmptyObj(req.body)) throw BodyEmptyError();

    let data = JSON.parse(res.locals.fields.data);
    console.log(res.locals.fields);
    let doc = await UserModel.createEvent({
      data: {
        cover: {
          name: "no_img.jpg",
          link: common.getBucketUrl("no_img.jpg"),
        },
        date: data.date,
        detail: data.detail,
        organizer: req.user.uid,
        public: data.public,
        period: data.period,
        title: data.title,
        type: data.type, //link, lottery
        link: data.link,
      },
      file: res.locals.fields.file,
      uploaded: req.uploaded
    });
    return res.json({
      msg: "Event created",
      data: doc
    });
    // let ev = {
    //   cover: {
    //     name: "no_img.jpg",
    //     link: common.getBucketUrl("no_img.jpg"),
    //   },
    //   date: data.date,
    //   detail: data.detail,
    //   organizer: req.user.uid,
    //   public: data.public,
    //   period: data.period,
    //   title: data.title,
    //   type: data.type, //link, lottery
    //   storage: data.storage,
    // };

    // if (res.locals.fields.file !== "undefined") {
    //   if (!common.validImageTypes.includes(req.uploaded.detail.mimetype))
    //     throw new CustomError(
    //       CODE_ERROR_GENERAL,
    //       "Only support image type JPG/PNG"
    //     );
    //   await admin
    //     .storage()
    //     .bucket()
    //     .upload(req.uploaded.detail.filepath, {
    //       resumable: false,
    //       metadata: {
    //         contentType: req.uploaded.detail.mimetype,
    //       },
    //     })
    //     .catch((reason) => {
    //       throw new FirebaseError(reason);
    //     });
    //   ev.cover = {
    //     file: req.uploaded.filename,
    //     url: common.getBucketUrl(req.uploaded.filename),
    //   };
    // }
    // let docRef = await db
    //   .collection("events")
    //   .add(ev)
    //   .catch((reason) => {
    //     throw new FirebaseError(reason);
    //   });
    // console.log(`docRef: ${docRef}`);
    // return res.json({
    //   msg: "Event created",
    //   data: {
    //     eId: docRef.id,
    //     ...ev,
    //   },
    // });
    // let event = {
    //   cover: {
    //     name: "no_img.jpg",
    //     link: `https://firebasestorage.googleapis.com/v0/b/${fbConfig.storageBucket}/o/no_img.jpg?alt=media`,
    //   },
    //   date: data.date,
    //   detail: data.detail,
    //   organizer: req.user.uid,
    //   public: data.public,
    //   period: data.period,
    //   title: data.title,
    //   type: data.type, //link, lottery
    //   storage: data.storage,
    // };

    // if (res.locals.fields["file"] !== "undefined") {
    //   if (!acceptedImageTypes.includes(req.uploaded.detail.mimetype))
    //     return res.status(400).json({
    //       code: CODE_ERROR_GENERAL,
    //       msg: "Only support image type JPG/PNG",
    //     });
    //   await admin
    //     .storage()
    //     .bucket()
    //     .upload(req.uploaded.detail.filepath, {
    //       resumable: false,
    //       metadata: {
    //         contentType: req.uploaded.detail.mimetype,
    //       },
    //     });
    //   event.cover.file = req.uploaded.filename;
    //   event.cover.url = `https://firebasestorage.googleapis.com/v0/b/${fbConfig.storageBucket}/o/${req.uploaded.filename}?alt=media`;
    // }
    // let docRef = await db.collection("events").add(event);
    // console.log(`docRef: ${docRef}`);
    // return res.json({
    //   msg: "Event created",
    //   data: {
    //     eId: docRef.id,
    //     ...event,
    //   },
    // });
  } catch (e) {
    next(e);
  }

  // admin
  //   .storage()
  //   .bucket()
  //   .upload(req.uploaded.detail.filepath, {
  //     resumable: false,
  //     metadata: {
  //       contentType: req.uploaded.detail.mimetype,
  //     },
  //   })
  //   .then(() => {
  //     event.cover.file = req.uploaded.filename;
  //     event.cover.url = `https://firebasestorage.googleapis.com/v0/b/${fbConfig.storageBucket}/o/${req.uploaded.filename}?alt=media`;
  //     return db.collection("events").add(event);
  //   })
  //   .then(() => {
  //     return res.json({ msg: "Event created" });
  //   })
  //   .catch((err) => {
  //     let msgStr = errMsg.getErrStr(err.code);
  //     if (msgStr != null) {
  //       return res
  //         .status(400)
  //         .json({ code: err.code, msg: errMsg.getErrStr(err.code) });
  //     } else {
  //       return res
  //         .status(500)
  //         .json({ code: err.code, msg: errMsg.getErrStr(err.code) });
  //     }
  //   });
};

// module.exports.uploadEventImage = (req, res, next) => {
//   let errorObj = null;
//   var previousImg = "";
//   const acceptedImageTypes = ["image/jpeg", "image/png"];
//   if (!acceptedImageTypes.includes(req.uploaded.detail.mimetype)) {
//     errorObj = {
//       code: 400,
//       result: {
//         code: CODE_ERROR_GENERAL,
//         msg: "Only support image type JPG/PNG",
//       },
//     };
//   }
//   //console.log(req, req.uploaded);
//   //res.send("testing");
//   if (common.isErrOccur(errorObj))
//     res.status(errorObj.code).json(errorObj.result);
//   /**
//    *
//    *  this code only while update func included
//    *
//    */
//   // db.doc(`/events/${req.field.eid}`)
//   //   .get()
//   //   .then((doc) => {
//   //     previousImg = doc.data().cover.file;
//   //     console.log(
//   //       `previousImg: ${
//   //         previousImg != null &&
//   //         previousImg != "" &&
//   //         !previousImg.includes("no_img.jpg")
//   //       }`
//   //     );
//   //     if (
//   //       previousImg != null &&
//   //       previousImg != "" &&
//   //       !previousImg.includes("no_img.jpg")
//   //     ) {
//   //       return admin.storage().bucket().file(previousImg).delete();
//   //     }
//   //   })
//   //   .then((result) => {
//   //     console.log("file delete");
//   //   })
//   //   .catch((err) => {
//   //     let msgStr = errMsg.getErrStr(err.code);
//   //     if (msgStr != null) {
//   //       if (err.code != "storage/object-not-found")
//   //         errorObj = {
//   //           code: 400,
//   //           result: { code: err.code, msg: errMsg.getErrStr(err.code) },
//   //         };
//   //     } else {
//   //       errorObj = {
//   //         code: 500,
//   //         result: { code: err, msg: "" },
//   //       };
//   //     }
//   //   });
//   // if (common.isErrOccur(errorObj))
//   //   res.status(errorObj.code).json(errorObj.result);
//   admin
//     .storage()
//     .bucket()
//     .upload(req.uploaded.detail.filepath, {
//       resumable: false,
//       metadata: {
//         contentType: req.uploaded.detail.mimetype,
//       },
//     })
//     .then(() => {
//       const url = `https://firebasestorage.googleapis.com/v0/b/${fbConfig.storageBucket}/o/${req.uploaded.filename}?alt=media`;
//       return db.doc(`/events/${res.locals.fields.eid}`).update({
//         cover: {
//           file: req.uploaded.filename,
//           url: url,
//         },
//       });
//     })
//     .then(() => {
//       return res.json({ msg: "Image uploaded successfully" });
//     })
//     .catch((err) => {
//       let msgStr = errMsg.getErrStr(err.code);
//       if (msgStr != null) {
//         errorObj = {
//           code: 400,
//           result: { code: err.code, msg: errMsg.getErrStr(err.code) },
//         };
//       } else {
//         errorObj = {
//           code: 500,
//           result: { code: err.code, msg: "" },
//         };
//       }
//     });
//   if (common.isErrOccur(errorObj))
//     res.status(errorObj.code).json(errorObj.result);
// };

module.exports.deleteEvent = async (req, res) => {
  try {
    let doc = await UserModel.deleteEvent({
      eId: req.params.eId,
      uid: req.user.uid,
    });
    return res.json({ msg: "Event removed." });
  } catch (e) {
    next(e);
  }

  // var tmpData;
  // try {
  //   let data = await db.doc(`/events/${req.params.eId}`).get();
  //   if (!data.exists) {
  //     return res
  //       .status(400)
  //       .json({ code: CODE_ERROR_GENERAL, msg: "Event not found" });
  //   } else {
  //     if (data.get("organizer") === req.user.uid) {
  //       tmpData = data;
  //       let result = await db.doc(`/events/${req.params.eId}`).delete();
  //       console.log(`tmpdata ${tmpData.get("cover")}`);
  //       if (tmpData.get("cover").name !== "no_img.jpg") {
  //         await admin
  //           .storage()
  //           .bucket()
  //           .file(tmpData.get("cover").name)
  //           .delete();
  //       }
  //       return res.json({ msg: "Event removed." });
  //     } else {
  //       return res
  //         .status(400)
  //         .json({ code: CODE_ERROR_GENERAL, msg: "Permission denied" });
  //     }
  //   }
  //   // db.doc(`/events/${req.params.eId}`)
  //   //   .get()
  //   //   .then((data) => {
  //   //     if (!data.exists) {
  //   //       return res
  //   //         .status(400)
  //   //         .json({ code: CODE_ERROR_GENERAL, msg: "Event not found" });
  //   //     }
  //   //     if (data.get("organizer").uid === req.user.uid) {
  //   //       tmpData = data;
  //   //       return db.doc(`/events/${req.params.eId}`).delete();
  //   //     } else {
  //   //       return res
  //   //         .status(400)
  //   //         .json({ code: CODE_ERROR_GENERAL, msg: "Permission denied" });
  //   //     }
  //   //   })
  //   //   .then((result) => {
  //   //     console.log(`tmpdata ${tmpData.get("cover")}`);
  //   //     if (tmpData.get("cover").name !== "no_img.jpg") {
  //   //       return admin
  //   //         .storage()
  //   //         .bucket()
  //   //         .file(tmpData.get("cover").name)
  //   //         .delete();
  //   //     } else return Promise.resolve();
  //   //   })
  //   //   .then(() => {
  //   //     return res.json({ msg: "Event removed." });
  //   //   })
  //   //   .catch((err) => {
  //   //     let msgStr = errMsg.getErrStr(err.code);
  //   //     if (msgStr != null)
  //   //       return res
  //   //         .status(400)
  //   //         .json({ code: err.code, msg: errMsg.getErrStr(err.code) });
  //   //     else return res.status(500).json({ code: err, msg: "" });
  //   //   });
  // } catch (err) {
  //   let msgStr = errMsg.getErrStr(err.code);
  //   if (msgStr != null)
  //     return res
  //       .status(400)
  //       .json({ code: err.code, msg: errMsg.getErrStr(err.code) });
  //   else return res.status(500).json({ code: err, msg: "" });
  // }
};
