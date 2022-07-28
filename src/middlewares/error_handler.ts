import {Request, Response, NextFunction, ErrorRequestHandler} from "express";
import {BaseError} from "../utils/custom_error";

function errorHandler(
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
) {
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json(err.getError());
  }
  console.error(err);
  //   functions.logger.error("Some Error
  // existed than I can't even catch", err);
  return res
      .status(500)
      .json({
        code: "unknown",
        message: "Some Error existed than I can't even catch",
      });
}

export {errorHandler};
