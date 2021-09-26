const fbConfig = require("./config.json");
const { admin, db } = require("./util/admin.js");
const firebase = require("firebase");
const functions = require("firebase-functions");

const cors = require("cors")();

const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(cors);
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(
  express.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);

const runtimeOpts = {
  timeoutSeconds: 60,
  memory: "512MB",
};
firebase.initializeApp(fbConfig);
//cbp
firebase.auth().useEmulator("http://localhost:9099/");

const userController = require("./controllers/user");
const publicController = require("./controllers/public");
const utilController = require("./controllers/util");
const { BaseError } = require("./util/error_message");

const firebaseAuth = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return res.status(403).json({ code: "general", msg: "Unathorized" });
  }
  admin
    .auth()
    .verifyIdToken(token)
    .then((decodeToken) => {
      req.user = decodeToken;
      //console.log(req.user);
      return db.doc(`/users_basic/${req.user.uid}`).get();
    })
    .then((doc) => {
      if (!doc.exists) {
        return res.status(403).json({ code: "general", msg: "forbidden" });
      }
      //console.log(doc);
      req.user.name = doc.data().name;
      req.user.id = doc.id;
      return next();
    })
    .catch((err) => {
      console.error(err);
      return res.status(403).json({ code: "general", msg: "" });
    });
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json(err.getError());
  }
  console.error(err);
  functions.logger.error("Some Error existed than I can't even catch", err);
  return res.status(500).json({});
};

app.options("*", cors);
app.get("/home", publicController.getHomeInformation, errorHandler);
// app.get("/seiyu/search", publicController.searchSeiyuData, errorHandler);
app.get("/seiyu", publicController.getSeiyuList, errorHandler);
app.get("/seiyu/:uid", publicController.getSeiyuInformation, errorHandler);
app.get("/circle", publicController.getCircleList);
app.get("/circle/:uid", publicController.getCircleInfo, errorHandler);
// app.get('/event', publicController.getEventList);
// app.get('/event/:eId', publicController.getEventList);

app.get("/dlsiteLink/:uid", publicController.getDlsiteScript);

app.post("/signup", userController.signUp, errorHandler);
app.post("/login", userController.login, errorHandler);
app.post(
  "/user/image",
  firebaseAuth,
  utilController.uploadFile,
  userController.uploadAvatar,
  errorHandler
);
app.post(
  "/user/basic",
  firebaseAuth,
  userController.updateUserBasicInformation,
  errorHandler
);
app.post(
  "/user/detail",
  firebaseAuth,
  userController.updateUserDetailInformation,
  errorHandler
);
app.post(
  "/user/dlsiteScript",
  firebaseAuth,
  userController.updateDLsiteScript,
  errorHandler
);
app.post(
  "/user/sample",
  firebaseAuth,
  utilController.uploadFormData,
  utilController.uploadFile,
  userController.uploadSample,
  errorHandler
);
app.post(
  "/user/sample/:sid",
  firebaseAuth,
  userController.deleteSample,
  errorHandler
);
// app.post(
//   "/user/event",
//   firebaseAuth,
//   utilController.uploadFormData,
//   utilController.uploadFile,
//   userController.addEvent
// );
// app.post('/user/event_cover', firebaseAuth, utilController.uploadFile, userController.uploadEventImage);
// app.post("/user/event/:eId", firebaseAuth, userController.rmEvent);

app.get(
  "/user/sample/:uid",
  firebaseAuth,
  userController.browseSamples,
  errorHandler
);
// app.get("/user/events", firebaseAuth, userController.browseEvents);

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

exports.api = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onRequest(app);
