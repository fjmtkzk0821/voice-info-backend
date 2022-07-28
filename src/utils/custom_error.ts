import {FirebaseError} from "firebase/app";
import {FirestoreError} from "firebase/firestore";

// const errorCodeMap = {
//   "auth/email-already-in-use": "Email is already in use.",
//   "auth/user-not-found": "Account not exist.",
//   "auth/wrong-password": "Password is not correct.",
//   "storage/object-not-found": "Object not found",
// };

class BaseError extends Error {
  name: string;
  description: string;
  statusCode: number;
  isOperational: boolean;

  constructor(
      name: string,
      description: string,
      statusCode: number,
      isOperational: boolean
  ) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.description = description;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }

  getError() {
    return {
      code: this.name,
      message: this.message,
    };
  }
}

class CFirebaseError extends BaseError {
  constructor(reason: FirebaseError, statusCode = 400, isOperational = true) {
    super(reason.code, reason.message, statusCode, isOperational);
  }
}

class CFirestoreError extends BaseError {
  constructor(reason: FirestoreError, statusCode = 400, isOperational = true) {
    super(reason.code, reason.message, statusCode, isOperational);
  }
}

class CustomError extends BaseError {
  constructor(
      code: string,
      description: string,
      statusCode = 400,
      isOperational = true
  ) {
    super(code, description, statusCode, isOperational);
  }
}

const FieldMissingError = new CustomError(
    "fields_missing",
    "Missing field in request body",
    400,
    true
);

const PermissionDeniedError = new CustomError(
    "permission_denied",
    "Permission denied.",
    403,
    true
);

const UnknownError = new CustomError(
    "unknown_error",
    "Unknown error occour.",
    500,
    true
);


export {
  BaseError,
  CFirebaseError,
  CFirestoreError,
  FieldMissingError,
  PermissionDeniedError,
  UnknownError,
  CustomError,
};
