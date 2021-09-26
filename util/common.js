const fbConfig = require("../config.json");

module.exports.validImageTypes = ["image/jpeg", "image/png"];

module.exports.validEmail = (str) => {
    let reg = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
    return reg.test(str);
}

module.exports.isEmptyObj = (obj) => {
    return !Object.keys(obj).length;
}

module.exports.getBucketUrl = (filename, type = "media") => {
    return `https://firebasestorage.googleapis.com/v0/b/${fbConfig.storageBucket}/o/${filename}?alt=${type}`;
}

module.exports.getRandomIndices = (amount, count) => {
    let indices = [];
    if(amount <= count) {
        return Array.from(Array(amount).keys());
    }
    while (indices.length < count) {
        let index = Math.floor(Math.random() * amount);
        if(!indices.includes(index)) indices.push(index);
    }
    return indices;
}

//next to duplicate
module.exports.isErrOccur = (obj) => {
    if(obj != null)
        return true;
    else
        return false;
}