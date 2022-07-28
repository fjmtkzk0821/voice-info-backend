class UserDocument {
    uid: string;
    email: string;
    twitter: string;

    constructor(uid:string, email: string, twitter = "") {
      this.uid = uid;
      this.email = email;
      this.twitter = twitter;
    }

    toObject() {
      return {
        uid: this.uid,
        email: this.email,
        twitter: this.twitter,
      };
    }

    serialize(): string {
      return JSON.stringify(this.toObject());
    }

    static fromSerialized(serialized: string): UserDocument {
      const userObj: ReturnType<UserDocument["toObject"]> =
        JSON.parse(serialized);
      const userDoc = new UserDocument(
          userObj.uid,
          userObj.email,
          userObj.twitter
      );

      return userDoc;
    }
}

export default UserDocument;
