import {Request, Response, NextFunction} from "express";
import userModel from "../models/user";
import {FieldMissingError} from "../utils/custom_error";
import {ReturnCode} from "../utils/localization/common";

async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    if (!(req.body.email && req.body.password)) {
      throw FieldMissingError;
    }
    const result = await userModel.signUpByEmail(
        req.body.email,
        req.body.password
    );
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message:
        "A verification email was sent."+
        "Please check the email to activate your account",
      data: result,
    });
  } catch (e: any) {
    return next(e);
  }
}

async function signIn(req: Request, res: Response, next: NextFunction) {
  try {
    if (!(req.body.email && req.body.password)) {
      throw FieldMissingError;
    }
    const result = await userModel.signInWithEmail(
        req.body.email,
        req.body.password
    );
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message: "Sign in successfully",
      data: {
        ...result,
        ...(await userModel.getUserInformation(result.uid)),
      },
    });
  } catch (e: any) {
    console.error("errorHandler");
    return next(e);
  }
}

async function retrieveUserInformation(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    res.locals.user = {
      ...await userModel.getUserInformation(res.locals.token.uid),
      uid: res.locals.token.uid,
      email: res.locals.token.email,
    };
    return next();
  } catch (e: any) {
    console.error("errorHandler");
    return next(e);
  }
}

async function getUserInformation(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message: "Retrieve successfully",
      data: {
        user: res.locals.user,
      },
    });
  } catch (e: any) {
    console.error("errorHandler");
    return next(e);
  }
}

async function sendResetPasswordRequest(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    if (!(req.body.email)) {
      throw FieldMissingError;
    }
    const result = await userModel.sendResetPasswordRequest(req.body.email);
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message: "Pending for reset",
      data: result,
    });
  } catch (e: any) {
    console.error("errorHandler");
    return next(e);
  }
}

// async function resetPassword(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {}

// async function closeAccount(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {}

export default {
  signUp,
  signIn,
  retrieveUserInformation,
  getUserInformation,
  sendResetPasswordRequest,
};
