import {Request, Response, NextFunction} from "express";
// import {SeiyuSearchCriteria} from "../utils/objects/public";
import publicModel from "../models/public";
import {FieldMissingError} from "../utils/custom_error";
import {ReturnCode} from "../utils/localization/common";

async function indexQueryRequest(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    const [newsDocs, promoDocs, linkDocs, seiyuDocs, sampleDocs] =
      await Promise.all([
        publicModel.newsQuery(),
        publicModel.promotionQuery(),
        publicModel.linkQuery(),
        publicModel.seiyuQuery(),
        publicModel.seiyuSampleQuery(),
      ]);
    // const newsDocs = await publicModel.newsQuery();
    // const promoDocs = await publicModel.promotionQuery();
    // const linkDocs = await publicModel.linkQuery();
    // const seiyuDocs = await publicModel.seiyuQuery();
    // const sampleDocs = await publicModel.seiyuSampleQuery();
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message: "Seiyu query request success",
      data: {
        news: newsDocs.map((doc) => doc.toObject()),
        promo: promoDocs.map((doc) => doc.toObject()),
        link: linkDocs.map((doc) => doc.toObject()),
        seiyu: seiyuDocs.map((doc) => {
          return {
            ...doc.toObject(),
            samples: sampleDocs
                .filter((sDoc) => doc.uid === sDoc.pid)
                .map((sDoc) => sDoc.toObject()),
          };
        }),
      },
    });
  } catch (e: any) {
    return next(e);
  }
}

async function seiyuQueryRequest(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    // const data = req.body;
    // const criteria = SeiyuSearchCriteria.fromObj(data.criteria);
    const docs = await publicModel.seiyuQuery();
    const sampleDocs = await publicModel.seiyuSampleQuery();
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message: "Seiyu query request success",
      data: {
        docs: docs.map((doc) => {
          return {
            ...doc.toObject(),
            samples: sampleDocs
                .filter((sDoc) => doc.uid === sDoc.pid)
                .map((sDoc) => sDoc.toObject()),
          };
        }),
      },
    });
  } catch (e: any) {
    return next(e);
  }
}

async function informationNewsQuery(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    // const data = req.body;
    // const criteria = SeiyuSearchCriteria.fromObj(data.criteria);
    const docs = await publicModel.newsQuery();
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message: "news query request success",
      data: {
        news: docs.map((item) => item.toObject()),
      },
    });
  } catch (e: any) {
    return next(e);
  }
}

async function seiyuProfileQuery(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    if (!req.params.uid) {
      throw FieldMissingError;
    }
    const profile = await publicModel.seiyuProfileQuery(req.params.uid);
    if (profile.detail && profile.detail.exp.type !== "txt") {
      profile.detail.exp.content = req.params.uid;
    }
    return res.status(200).json({
      code: ReturnCode.SUCCESS,
      message: "seiyu request success",
      data: {
        profile: {
          basic: profile.basic?.toObject(),
          detail: profile.detail?.toObject(),
          samples: profile.samples.map((s) => s.toObject()),
        },
      },
    });
  } catch (e: any) {
    return next(e);
  }
}

async function renderSeiyuDLsite(
    req: Request,
    res: Response,
    next: NextFunction
) {
  try {
    if (!req.params.uid) {
      throw FieldMissingError;
    }
    const content = await publicModel.seiyuDLsiteQuery(req.params.uid);
    return res.render("dlsiteBlogParts", {
      script: content,
    });
  } catch (e: any) {
    return next(e);
  }
}

export default {
  indexQueryRequest,
  seiyuQueryRequest,
  informationNewsQuery,
  seiyuProfileQuery,
  renderSeiyuDLsite,
};
