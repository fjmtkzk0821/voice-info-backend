class Banner {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }

    static fromSeiyu(seiyu) {
        return new Banner("seiyu", seiyu.toStandardObject());
    }

    static fromEvent(event) {

    }

    static fromLink(url) {
        return new Banner("link", url);
    }
}

module.exports.Banner = Banner;

