class EventObject {
  constructor(data) {
    this.id = data.id;
    this.cover = data.cover;
    this.date = data.date;
    this.detail = data.detail;
    this.organizer = data.organizer;
    this.public = data.public;
    this.period = data.period;
    this.title = data.title;
    this.type = data.type;
    this.link = data.link;
  }

  toFirestore() {
    return {
      cover: this.cover,
      date: this.date,
      detail: this.detail,
      organizer: this.organizer,
      public: this.public,
      period: this.period,
      title: this.title,
      type: this.type,
      link: this.link,
    };
  }

  toStandardObject() {
    let expired = false;
    let expiredDate;
    switch (doc.data().period) {
      case "once":
        expiredDate = new Date(this.date);
        expired = expiredDate.getTime() - Date.now() < 0;
        console.log(expiredDate.getTime() - Date.now());
        break;
      case "limited":
        expiredDate = new Date(this.date.end);
        expired = expiredDate.getTime() - Date.now() < 0;
        break;
      default:
        expired = false;
    }
    return {
      id: this.id,
      expired: expired,
      ...this.toFirestore(),
    };
  }
}
