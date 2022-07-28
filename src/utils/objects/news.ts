import {DocumentData, Timestamp} from "firebase/firestore";

class News {
  uid: string;
  type: string;
  title: string;
  content: string;
  author: string;
  date: Date;

  constructor(
      type: string,
      title: string,
      content: string,
      author: string,
      uid = "",
      date = new Date()
  ) {
    this.uid = uid;
    this.type = type;
    this.title = title;
    this.content = content;
    this.author = author;
    this.date = new Date(date);
  }

  toObject() {
    return {
      uid: this.uid,
      type: this.type,
      title: this.title,
      content: this.content,
      author: this.author,
      date: this.date.getTime(),
    };
  }
}

const newsDocConverter: FirebaseFirestore.FirestoreDataConverter<News> = {
  toFirestore: (doc: News) => {
    return {
      ...doc.toObject(),
      date: Timestamp.now(),
    };
  },
  fromFirestore: (
      snapshot: FirebaseFirestore.QueryDocumentSnapshot<DocumentData>
  ): News => {
    const data = snapshot.data();
    return new News(
        data.type,
        data.title,
        data.content,
        data.author,
        snapshot.id,
        data.date.toMillis()
    );
  },
};

export {News, newsDocConverter};
