import {Request, Response, NextFunction} from "express";
import {ReturnCode} from "../utils/localization/common";
import seiyuModel from "../models/seiyu";
import {validImageTypes} from "../utils/common";
import {CustomError, UnknownError} from "../utils/custom_error";
import {SeiyuSampleDocument} from "../utils/objects/seiyu";

async function register(req: Request, res: Response, next: NextFunction) {
  try {
    await seiyuModel.register(res.locals.token.uid);
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message: "Seiyu register successfully",
    });
  } catch (e: any) {
    return next(e);
  }
}

async function informationRetrieve(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    const uid = res.locals.token.uid;
    const doc = await seiyuModel.informationRetrieve(uid);
    if (doc !== undefined) {
      return res.status(200).json({
        code: ReturnCode.SUCCESS,
        message: "Retrieve successfully",
        data: {
          basic: doc.toObject(),
          user: res.locals.user,
        },
      });
    } else {
      throw UnknownError;
    }
  } catch (e: any) {
    return next(e);
  }
}

async function detailInformationRetrieve(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    const uid = res.locals.token.uid;
    const doc = await seiyuModel.detailInformationRetrieve(uid);
    if (doc !== undefined) {
      return res.status(200).json({
        code: ReturnCode.SUCCESS,
        message: "Retrieve successfully",
        data: {
          detail: doc.toObject(),
          user: res.locals.user,
        },
      });
    } else {
      throw UnknownError;
    }
  } catch (e: any) {
    return next(e);
  }
}

async function samplesRetrieve(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    const uid = res.locals.token.uid;
    const docs = await seiyuModel.samplesRetrieve(uid);
    if (docs !== undefined) {
      return res.status(200).json({
        code: ReturnCode.SUCCESS,
        message: "Retrieve successfully",
        data: {
          samples: docs.map((doc) => doc.toObject()),
          user: res.locals.user,
        },
      });
    } else {
      throw UnknownError;
    }
  } catch (e: any) {
    return next(e);
  }
}

async function informationUpdate(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    const fields = res.locals.fields;
    // if (fields == undefined || fields.files.avatar == undefined) {
    //   throw new CustomError("field_missing", "Field missing [avatar]");
    // }
    if (
      fields.files.avatar &&
      !validImageTypes.includes(fields.files.avatar.mimetype)
    ) {
      throw new CustomError(
          "mimetype_not_supported",
          "Only support image type JPG/PNG"
      );
    }
    await seiyuModel.informationUpdate(
        res.locals.token.uid,
        JSON.parse(fields.data),
        fields.files.avatar,
    );
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message: "Seiyu information update successfully",
    });
  } catch (e: any) {
    return next(e);
  }
}

async function detailInformationUpdate(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    const data = req.body;
    await seiyuModel.detailInformationUpdate(res.locals.token.uid, data);
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message: "Seiyu information update successfully",
    });
  } catch (e: any) {
    return next(e);
  }
}

async function sampleUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const fields = res.locals.fields;
    if (fields == undefined || fields.files.sample == undefined) {
      throw new CustomError("field_missing", "Field missing [sample]");
    }
    if (!fields.files.sample.mimetype.includes("audio")) {
      throw new CustomError(
          "mimetype_not_supported",
          "Only support audio type file"
      );
    }
    await seiyuModel.sampleUpload(
        res.locals.token.uid,
        fields.files.sample,
      JSON.parse(fields.data) as SeiyuSampleDocument
    );
    const docs = await seiyuModel.samplesRetrieve(res.locals.token.uid);
    if (docs !== undefined) {
      return res.status(200).json({
        code: ReturnCode.SUCCESS,
        message: "Sample upload successfully",
        data: {
          samples: docs.map((doc) => doc.toObject()),
          user: res.locals.user,
        },
      });
    } else {
      throw UnknownError;
    }
  } catch (e: any) {
    return next(e);
  }
}

async function sampleDelete(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.params;
    await seiyuModel.sampleDelete(res.locals.token.uid, data.uid);
    const docs = await seiyuModel.samplesRetrieve(res.locals.token.uid);
    if (docs !== undefined) {
      return res.status(200).json({
        code: ReturnCode.SUCCESS,
        message: "Sample delete successfully",
        data: {
          samples: docs.map((doc) => doc.toObject()),
          user: res.locals.user,
        },
      });
    }
  } catch (e: any) {
    return next(e);
  }
}

export default {
  register,
  informationRetrieve,
  detailInformationRetrieve,
  samplesRetrieve,
  informationUpdate,
  detailInformationUpdate,
  sampleUpload,
  sampleDelete,
};
