import {DocumentData, Timestamp} from "firebase/firestore";

class Promotion {
  uid: string;
  title: string;
  type: string;
  data: Map<string, any>;
  date: Date;

  constructor(
      title: string,
      type: string,
      data: Map<string, any>,
      uid = "",
      date: any
  ) {
    this.uid = uid;
    this.title = title;
    this.type = type;
    this.data = data;
    this.date = new Date(date);
  }

  toObject() {
    return {
      uid: this.uid,
      title: this.title,
      type: this.type,
      data: this.data,
      date: this.date.getMilliseconds(),
    };
  }
}

const promoDocConverter: FirebaseFirestore.FirestoreDataConverter<Promotion> =
  {
    toFirestore: (doc: Promotion) => {
      return {
        ...doc.toObject(),
        date: Timestamp.now(),
      };
    },
    fromFirestore: (
        snapshot: FirebaseFirestore.QueryDocumentSnapshot<DocumentData>
    ): Promotion => {
      const data = snapshot.data();
      return new Promotion(
          data.title,
          data.type,
          data.data,
          snapshot.id,
          data.date.toMillis()
      );
    },
  };

export {Promotion, promoDocConverter};
