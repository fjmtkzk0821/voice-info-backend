import {Response, NextFunction} from "express";
import path from "path";
import os from "os";
import fs from "fs";
import busboy from "busboy";
import {CustomError} from "../utils/custom_error";

async function multipartFormDataHandler(
    req: any,
    res: Response,
    next: NextFunction
) {
  const config: busboy.BusboyConfig = {
    headers: req.headers,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  };
  const bb = busboy(config);
  const tmpdir = os.tmpdir();

  const fields: any = {};
  const uploads: any = {};

  bb.on("field", (fieldname, val) => {
    console.log(`Processed field ${fieldname}: ${val}.`);
    fields[fieldname] = val;
  });

  const fileWrites: Array<Promise<any>> = [];
  bb.on("file", (fieldname, file, fileInfo) => {
    file.on("limit", (data) => {
      console.log("LIMIT");
      bb.emit(
          "error",
          new CustomError("file_size_over", "The file's size cannot over 5MB")
      );
      return;
    });
    console.log(`Processed file ${fileInfo.filename}`);
    const originName = fileInfo.filename.split(".");
    const uniName = `${res.locals.token.uid}-${Date.now()}.${
      originName[originName.length - 1]
    }`;
    const filepath = path.join(tmpdir, uniName);
    // uploads[fieldname] = filepath;
    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    const promise = new Promise((resolve, reject) => {
      file.on("end", () => {
        writeStream.end();
      });
      uploads[fieldname] = {
        path: filepath,
        filename: uniName,
        mimetype: fileInfo.mimeType,
      };
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });
    fileWrites.push(promise);
  });

  bb.on("error", (err) => {
    req.unpipe(bb);
    bb.removeAllListeners();
    return next(err);
  });

  bb.on("finish", async () => {
    await Promise.all(fileWrites);
    fields["files"] = uploads;
    res.locals.fields = fields;

    // eslint-disable-next-line guard-for-in
    // for (const file in uploads) {
    //   console.log(uploads[file]["path"]);
    //   fs.unlinkSync(uploads[file]["path"]);
    // }
    return next();
  });

  bb.end(req.rawBody);
}

export {multipartFormDataHandler};
