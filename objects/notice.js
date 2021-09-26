class Notice {
  constructor(id, type, title, author, date, detail) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.author = author;
    this.date = date;
    this.detail = detail;
  }

  toStandardObject() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      author: this.author,
      date: this.date,
      detail: this.detail,
    };
  }

  static fromFirestore(data) {
    return new Notice(
      data.id,
      data.type,
      data.title,
      data.author,
      data.date,
      data.detail
    );
  }
}

module.exports.Notice = Notice;
module.exports.noticeConverter = {
  toFirestore: (notice) => {
    return {
      type: notice.type,
      title: notice.title,
      author: notice.author,
      date: notice.date,
      detail: notice.detail,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Notice(
      snapshot.id,
      data.type,
      data.title,
      data.author,
      data.date.toDate(),
      data.detail
    );
  },
};
