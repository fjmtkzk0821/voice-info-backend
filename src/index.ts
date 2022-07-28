import * as functions from "firebase-functions";
// import {initializeApp} from "firebase/app";
// import {getAuth, connectAuthEmulator} from "firebase/auth";
import express from "express";
import cors from "cors";
import {errorHandler} from "./middlewares/error_handler";
import userController from "./controllers/user";
import seiyuController from "./controllers/seiyu";
import publicController from "./controllers/public";
import {authHeaderValidate} from "./controllers/valid";
import {multipartFormDataHandler} from "./middlewares/form_handler";
// import {getStorage, connectStorageEmulator} from "firebase/storage";

const app = express();
app.use(cors());
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
app.set("view engine", "ejs");

// const auth = getAuth();
// connectAuthEmulator(auth, "http://localhost:9099/");
// connectStorageEmulator(getStorage(), "localhost", 9199);

app.options("*", cors);

app.post("/auth/signupVerify");
app.post("/auth/signup", userController.signUp); // pass
app.post("/auth/login", userController.signIn); // pass
app.post("/auth/reset", userController.sendResetPasswordRequest);

app.get("/public/index", publicController.indexQueryRequest);
app.get("/public/news");
app.get("/public/seiyu", publicController.seiyuQueryRequest);
app.get("/public/seiyu/:uid", publicController.seiyuProfileQuery);
app.get("/public/seiyu/:uid/dlsite", publicController.renderSeiyuDLsite);

// eslint-disable-next-line max-len
app.post("/auth/seiyu/register", authHeaderValidate, seiyuController.register); // pass
app.get(
    "/auth/account",
    authHeaderValidate,
    userController.retrieveUserInformation,
    userController.getUserInformation
);
app.get(
    "/auth/seiyu/basic",
    authHeaderValidate,
    userController.retrieveUserInformation,
    seiyuController.informationRetrieve
);
app.get(
    "/auth/seiyu/detail",
    authHeaderValidate,
    userController.retrieveUserInformation,
    seiyuController.detailInformationRetrieve
);
app.get(
    "/auth/seiyu/samples",
    authHeaderValidate,
    userController.retrieveUserInformation,
    seiyuController.samplesRetrieve
);
app.post(
    "/auth/seiyu/basic",
    authHeaderValidate,
    multipartFormDataHandler,
    seiyuController.informationUpdate
); // pass
app.post(
    "/auth/seiyu/detail",
    authHeaderValidate,
    seiyuController.detailInformationUpdate
); // pass
app.post(
    "/auth/seiyu/sample",
    authHeaderValidate,
    multipartFormDataHandler,
    seiyuController.sampleUpload
);
app.delete(
    "/auth/seiyu/sample/:uid",
    authHeaderValidate,
    seiyuController.sampleDelete
);

app.use(errorHandler);

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at:", p, "reason:", reason);
});

export const api = functions
    .region("asia-northeast1")
    .runWith({
      timeoutSeconds: 60,
      memory: "512MB",
    })
    .https.onRequest(app);

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
