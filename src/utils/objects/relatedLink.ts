import {DocumentData} from "@firebase/firestore";

class RelatedLink {
    url: string;
    cover: string;

    toObject() {
      return {
        url: this.url,
        cover: this.cover,
      };
    }

    constructor(url: string, cover: string) {
      this.url = url;
      this.cover = cover;
    }
}

const linkDocConverter: FirebaseFirestore.FirestoreDataConverter<RelatedLink> =
  {
    toFirestore: (doc: RelatedLink) => {
      return doc.toObject();
    },
    fromFirestore: (
        snapshot: FirebaseFirestore.QueryDocumentSnapshot<DocumentData>
    ): RelatedLink => {
      const data = snapshot.data();
      return new RelatedLink(data.url, data.cover);
    },
  };

export {RelatedLink, linkDocConverter};
