const common = require("../util/common");
const {
  CODE_ERROR_GENERAL,
  CODE_SUCCESS,
} = require("../util/message_string.js");

module.exports.uploadFile = (req, res, next) => {
  if (common.isEmptyObj(req.body)) {
    return res
      .status(400)
      .json({ code: CODE_ERROR_GENERAL, msg: "Not proper form request" });
  }
  try {
    // let fields = {};
    let isLimit = false;
    //console.log("start upload");
    const BusBoy = require("busboy");
    const path = require("path");
    const os = require("os");
    const fs = require("fs");

    const tmpdir = os.tmpdir();

    const bb = new BusBoy({
      headers: req.headers,
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    });

    bb.on("file", (fieldname, file, filename, encoding, mimetype) => {
      file.on("limit", () => {
        isLimit = true;
      });
      //console.log("on file");
      let sepName = filename.split(".");
      let uploaded = {};

      const ext = sepName[sepName.length - 1];
      uploaded.filename = `${req.user.uid}_${sepName[0]}.${ext}`;
      const filepath = path.join(tmpdir, uploaded.filename);
      uploaded.detail = { filepath, mimetype };
      req.uploaded = uploaded;
      console.log("req.uploaded: " + req.uploaded);
      file.pipe(fs.createWriteStream(filepath));
      file.on("end", function () {
        //console.log("Finished with " + fieldname);
      });
    });
    bb.on("finish", () => {
      if (!isLimit) {
        // res.locals.fields = fields;
        //console.log("out of busboy");
        next();
      } else {
        res.status(400).json({
          code: CODE_ERROR_GENERAL,
          msg: "File size must under 5MB",
        });
      }
    });
    bb.end(req.rawBody);

    // bb.on(
    //   "field",
    //   function (
    //     fieldname,
    //     val,
    //     fieldnameTruncated,
    //     valTruncated,
    //     encoding,
    //     mimetype
    //   ) {
    //     fields[fieldname] = val;
    //     //console.log("Field [" + fieldname + "]: value: " + val);
    //   }
    // );

    // bb.on("error", function (err) {
    //   console.error(err);
    // });
  } catch (err) {
    console.log(err);
    res.status(400).json({ code: CODE_ERROR_GENERAL, msg: err });
  }
  // if (res.locals.fields["reqired"] != undefined && res.locals.fields["reqired"]) {
    
  // } else {
  //   next();
  // }
};

module.exports.uploadFormData = (req, res, next) => {
  if (common.isEmptyObj(req.body)) {
    return res
      .status(400)
      .json({ code: CODE_ERROR_GENERAL, msg: "Not proper form request" });
  }
  try {
    let fields = {};
    const BusBoy = require("busboy");
    const bb = new BusBoy({
      headers: req.headers,
    });

    bb.on(
      "field",
      function (
        fieldname,
        val,
        fieldnameTruncated,
        valTruncated,
        encoding,
        mimetype
      ) {
        // if(fieldname === "props") {

        // }
        fields[fieldname] = val;
        console.log("Field [" + fieldname + "]: value: " + val);
      }
    );

    bb.on("finish", () => {
      res.locals.fields = fields;
      next();
    });
    bb.end(req.rawBody);
  } catch (err) {
    console.log(err);
    res.status(400).json({ code: CODE_ERROR_GENERAL, msg: err });
  }
};
