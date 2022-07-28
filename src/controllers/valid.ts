import {Request, Response, NextFunction} from "express";
import {FirebaseError} from "firebase/app";
import {CFirebaseError, CustomError} from "../utils/custom_error";
import {ReturnCode} from "../utils/localization/common";
import admin from "firebase-admin";

function validCheck(req: Request, res: Response, next: NextFunction) {
  // check body empty
  if (!Object.keys(req.body).length) {
    throw new CustomError(ReturnCode.GENERAL, "Request body is empty.");
  }
  return;
}

async function authHeaderValidate(
    req: Request,
    res: Response,
    next: NextFunction
) {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      throw new CustomError("unauth", "Unathorized Request.", 401);
    }
    const decoded = await admin
        .auth()
        .verifyIdToken(token)
        .catch((reason: FirebaseError) => {
          throw new CFirebaseError(reason);
        });
    res.locals.token = decoded;
    return next();
  } catch (e) {
    return next(e);
  }
}

export {validCheck, authHeaderValidate};
