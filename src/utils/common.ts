import {storageBucket} from "../config.json";
import nodemailer from "nodemailer";

const validImageTypes = ["image/jpeg", "image/png"];

function isStringEmpty(str: string): boolean {
  if (str !== undefined && str.length > 0) {
    return false;
  }
  return true;
}

function getUrlFromStorageBucket(filename: string, type = "media") {
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${filename}?alt=${type}`;
}

function getObjectDifferent(origin: any, compare: any): any {
  const tmpObj: any = {};
  for (const key of Object.getOwnPropertyNames(compare)) {
    if (origin[key] != undefined && origin[key] !== compare[key]) {
      tmpObj[key] = compare[key];
    }
  }
  return tmpObj;
}

const HOST_MAIL_ADDRESS = "voiceinformation.kazuki@gmail.com";

const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: HOST_MAIL_ADDRESS,
    pass: "fr8HikarOQI8!gU6Ich$",
  },
});

export {
  isStringEmpty,
  getUrlFromStorageBucket,
  validImageTypes,
  getObjectDifferent,
  mailTransporter,
  HOST_MAIL_ADDRESS,
};
