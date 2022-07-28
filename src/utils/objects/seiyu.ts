/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DocumentData,
} from "firebase/firestore";
import {isStringEmpty} from "../common";
// import {getUrlFromStorageBucket} from "../common";

class SeiyuDocument {
  uid = "";
  name = "";
  gender: "f" | "m" | "o" | "NA" | string = "NA";
  avatar = "no_img.jpg";
  intro = "";
  email = "";
  hires = false;
  restric: { r: boolean; r15: boolean; r18: boolean } = {
    r: false,
    r15: false,
    r18: false,
  };
  possible: Array<string> = [];
  wish: Array<string> = [];
  social: Array<SeiyuSocialLinkDocument> = [];
  publish = false;
  personal = "";
  twitter = "";

  toObject() {
    return {
      uid: this.uid,
      name: this.name,
      gender: this.gender,
      avatar: this.avatar,
      intro: this.intro,
      email: this.email,
      hires: this.hires,
      restric: this.restric,
      possible: this.possible,
      wish: this.wish,
      social: this.social.map((s) => s.toObject()),
      publish: this.publish,
      personal: this.personal,
      twitter: this.twitter,
    };
  }
}

const seiyuDocConverter: FirebaseFirestore.FirestoreDataConverter<SeiyuDocument> =
  {
    toFirestore: (doc: SeiyuDocument) => {
      return doc.toObject();
    },
    fromFirestore: (
        snapshot: FirebaseFirestore.QueryDocumentSnapshot<DocumentData>
    ): SeiyuDocument => {
      const data = snapshot.data();
      const doc = new SeiyuDocument();
      doc.uid = snapshot.id;
      doc.name = data.name;
      doc.gender = data.gender;
      doc.avatar = data.avatar;
      doc.intro = data.intro;
      doc.email = data.email;
      doc.hires = data.hires;
      doc.restric = data.restric;
      doc.possible = data.possible;
      doc.wish = data.wish;
      doc.social = (data.social as Array<any>).map((s) => {
        const socialDoc = new SeiyuSocialLinkDocument();
        socialDoc.platform = s.platform;
        socialDoc.url = s.url;
        socialDoc.display = s.display;
        return socialDoc;
      });
      doc.publish = data.publish;
      doc.personal = data.personal;
      doc.twitter = data.twitter;
      return doc;
    },
  };

class SeiyuDetailDocument {
  uid = "";
  reception: { type: "txt" | "tweet"; content: string } = {
    type: "txt",
    content: "",
  };
  precaution = "";
  fee = "";
  equip = "";
  exp: { type: "txt" | "dlsite"; content: string } = {
    type: "txt",
    content: "",
  };
  other = "";

  toObject() {
    return {
      uid: this.uid,
      reception: this.reception,
      precaution: this.precaution,
      fee: this.fee,
      equip: this.equip,
      exp: this.exp,
      other: this.other,
    };
  }
}

const seiyuDetailDocConverter: FirebaseFirestore.FirestoreDataConverter<SeiyuDetailDocument> =
  {
    toFirestore: (doc: SeiyuDetailDocument) => {
      return doc.toObject();
    },
    fromFirestore: (
        snapshot: FirebaseFirestore.QueryDocumentSnapshot<DocumentData>
    ): SeiyuDetailDocument => {
      const data = snapshot.data();
      const doc = new SeiyuDetailDocument();
      doc.uid = data.uid;
      doc.reception = data.reception;
      doc.precaution = data.precaution;
      doc.fee = data.fee;
      doc.equip = data.equip;
      doc.exp = data.exp;
      doc.other = data.other;
      return doc;
    },
  };

class SeiyuSampleDocument {
  uid = "";
  cat = "";
  restric: "r" | "r15" | "r18" | string = "r";
  url = "";
  filename = "";
  pid = "";

  toObject(): any {
    const obj: any = {
      cat: this.cat,
      restric: this.restric,
      url: this.url,
      filename: this.filename,
      pid: this.pid,
    };
    if (!isStringEmpty(this.uid)) {
      obj.uid = this.uid;
    }
    return obj;
  }

  static fromObject(obj: {
    cat: string;
    restric: string;
    url: string;
    filename: string;
    pid: string;
  }): SeiyuSampleDocument {
    const doc = new SeiyuSampleDocument();
    doc.cat = obj.cat;
    doc.restric = obj.restric;
    doc.url = obj.url;
    doc.filename = obj.filename;
    doc.pid = obj.pid;
    return doc;
  }
}

const seiyuSampleDocConverter: FirebaseFirestore.FirestoreDataConverter<SeiyuSampleDocument> = {
  toFirestore: (doc: SeiyuSampleDocument) => {
    return doc.toObject();
  },
  fromFirestore: (
      snapshot: FirebaseFirestore.QueryDocumentSnapshot<DocumentData>
  ): SeiyuSampleDocument => {
    const data = snapshot.data();
    console.log(`id: ${snapshot.id}`);
    const doc = new SeiyuSampleDocument();
    doc.uid = snapshot.id;
    doc.cat = data.cat;
    doc.restric = data.restric;
    doc.url = data.url;
    doc.filename = data.filename;
    doc.pid = data.pid;
    return doc;
  },
};

class SeiyuSocialLinkDocument {
  platform = "";
  url = "";
  display = false;

  toObject() {
    return {
      platform: this.platform,
      url: this.url,
      display: this.display,
    };
  }
}

export {
  SeiyuDocument,
  seiyuDocConverter,
  SeiyuDetailDocument,
  seiyuDetailDocConverter,
  SeiyuSampleDocument,
  seiyuSampleDocConverter,
  SeiyuSocialLinkDocument,
};
