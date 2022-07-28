import {FirestoreError} from "firebase/firestore";
import {CFirestoreError, CustomError} from "../utils/custom_error";
import {db} from "../utils/firebase_admin";
import {News, newsDocConverter} from "../utils/objects/news";
import {promoDocConverter, Promotion} from "../utils/objects/promotion";
import {linkDocConverter, RelatedLink} from "../utils/objects/relatedLink";
// import {SeiyuSearchCriteria} from "../utils/objects/public";
import {
  seiyuDetailDocConverter,
  seiyuDocConverter,
  SeiyuDocument,
  seiyuSampleDocConverter,
  SeiyuSampleDocument,
} from "../utils/objects/seiyu";

async function seiyuQuery(
    limit?: number
): Promise<SeiyuDocument[]> {
  // criteria: SeiyuSearchCriteria,
  // page = 1,
  // limit = 15
  let collRef = db
      .collection("seiyu")
      .where("publish", "==", true)
      .withConverter(seiyuDocConverter);
  if (limit !== undefined) {
    collRef = collRef.limit(limit);
  }
  //   for (const arr of criteria.getDocCriteria()) {
  //     collRef.where(arr.c, arr.o, arr.v);
  //   }
  const snapshot = await collRef.get().catch((reason: FirestoreError) => {
    throw new CFirestoreError(reason);
  });
  return snapshot.docs.map((doc) => doc.data());
}

async function seiyuProfileQuery(uid: string) {
  const basicRef = db
      .collection("seiyu").doc(uid).withConverter(seiyuDocConverter);
  const detailRef = db
      .collection("seiyu_detail")
      .doc(uid)
      .withConverter(seiyuDetailDocConverter);
  const samplesRef = db
      .collection("samples")
      .where("pid", "==", uid)
      .withConverter(seiyuSampleDocConverter);
  const [bss, dss, sss] = await Promise.all([
    basicRef.get().catch((reason: FirestoreError) => {
      throw new CFirestoreError(reason);
    }),
    detailRef.get().catch((reason: FirestoreError) => {
      throw new CFirestoreError(reason);
    }),
    samplesRef.get().catch((reason: FirestoreError) => {
      throw new CFirestoreError(reason);
    }),
  ]);
  if (!bss.exists) {
    throw new CustomError("seiyu-not-found", "Seiyu does not exist.");
  }
  return {
    basic: bss.data(),
    detail: dss.data(),
    samples: sss.docs.map((doc) => doc.data()),
  };
}

async function seiyuSampleQuery(): Promise<SeiyuSampleDocument[]> {
  const collRef = db
      .collection("samples")
      .withConverter(seiyuSampleDocConverter);
  const snapshot = await collRef.get().catch((reason: FirestoreError) => {
    throw new CFirestoreError(reason);
  });
  return snapshot.docs.map((doc) => doc.data());
}

async function seiyuDLsiteQuery(uid: string): Promise<string> {
  const detailRef = db
      .collection("seiyu_detail")
      .doc(uid)
      .withConverter(seiyuDetailDocConverter);
  const snapshot = await detailRef.get();
  return snapshot.data()?.exp.content ?? "";
}

async function newsQuery(limit = 5): Promise<News[]> {
  const collRef = db
      .collection("news")
      .limit(limit)
      .withConverter(newsDocConverter);
  const snapshot = await collRef.get().catch((reason: FirestoreError) => {
    throw new CFirestoreError(reason);
  });
  return snapshot.docs.map((doc) => doc.data());
}

async function linkQuery(): Promise<RelatedLink[]> {
  const collRef = db
      .collection("link")
      .withConverter(linkDocConverter);
  const snapshot = await collRef.get().catch((reason: FirestoreError) => {
    throw new CFirestoreError(reason);
  });
  return snapshot.docs.map((doc) => doc.data());
}

async function promotionQuery(): Promise<Promotion[]> {
  const collRef = db
      .collection("promo")
      .withConverter(promoDocConverter);
  const snapshot = await collRef.get().catch((reason: FirestoreError) => {
    throw new CFirestoreError(reason);
  });
  return snapshot.docs.map((doc) => doc.data());
}

export default {
  seiyuQuery,
  seiyuSampleQuery,
  newsQuery,
  promotionQuery,
  seiyuProfileQuery,
  seiyuDLsiteQuery,
  linkQuery,
};
