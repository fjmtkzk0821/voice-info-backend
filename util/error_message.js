const { CODE_ERROR_GENERAL, CODE_SUCCESS } = require("../util/message_string");

errorCodeMap = {
  "auth/email-already-in-use": "Email is already in use.",
  "auth/user-not-found": "Account not exist.",
  "auth/wrong-password": "Password is not correct.",
  "storage/object-not-found": "Object not found",
};

class BaseError extends Error {
  constructor(name, description, statusCode, isOperational) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }

  getError() {
    return {
      code: this.name,
      msg: this.message,
    };
  }
}

class FirebaseError extends BaseError {
  constructor(reason, statusCode = 400, isOperational = true) {
    super(reason.code, reason.message, statusCode, isOperational);
  }
}

class CustomError extends BaseError {
  constructor(name, description, statusCode = 400, isOperational = true) {
    super(name, description, statusCode, isOperational);
  }
}

class BodyEmptyError extends BaseError {
  constructor() {
    super(CODE_ERROR_GENERAL, "Request body is empty.", 400, true);
  }
}

module.exports.BaseError = BaseError;
module.exports.BodyEmptyError = BodyEmptyError;
module.exports.FirebaseError = FirebaseError;
module.exports.CustomError = CustomError;

module.exports.getErrStr = (key) => {
  try {
    return errorCodeMap[key];
  } catch (ex) {
    return null;
  }
};
