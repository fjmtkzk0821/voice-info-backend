const { db } = require("../util/admin.js");
const { CODE_ERROR_GENERAL } = require("../util/message_string");
const { CustomError } = require("../util/error_message");

const PublicModel = require("../models/public_model");
const SeiyuModel = require("../models/seiyu_model");
const { Seiyu } = require("../objects/users");

module.exports.getHomeInformation = async (req, res, next) => {
  try {
    let [notices, seiyuList] = await Promise.all([
      PublicModel.getRecentNotices(),
      SeiyuModel.getRandomSeiyu(3),
    ]);
    return res.json({
      notices: notices.map((n) => n.toStandardObject()),
      seiyuList: seiyuList.map((e) => e.toSimpleObject()),
    });
  } catch (e) {
    next(e);
  }
};

// module.exports.searchSeiyuData = async (req, res, next) => {
//   let seiyuList = [];
//   try {
//     let reqPage = req.query.page;
//     if (reqPage == undefined) reqPage = 1;
//     let size = await SeiyuModel.getSize();
//     let totalPage = Math.ceil(size / 15);
//     totalPage = totalPage == 0 ? 1 : totalPage;

//     if (reqPage > totalPage) reqPage = totalPage;
//     if (reqPage < 1) reqPage = 1;

//     let basicDocs = await SeiyuModel.getBasicInfoByPaginate(reqPage);
//     for (let basic of basicDocs) {
//       let [samples, detail] = await Promise.all([
//         SeiyuModel.getUserSamples(basic.uid),
//         PublicModel.getDetailInformation(basic.uid),
//       ]);
//       let seiyu = new Seiyu(basic, detail);
//       seiyu.setSamples(samples);
//       seiyuList.push(seiyu);
//     }
//     // let [basicDocs, samples] = await Promise.all([
//     //   SeiyuModel.getAllBasicInformation(),
//     //   SeiyuModel.getAllSamples(),
//     // ]);
//     // for (let basic of basicDocs) {
//     //   let detail = await PublicModel.getDetailInformation(basic.uid);
//     //   let seiyu = new Seiyu(basic, detail);
//     //   seiyu.setSamples(
//     //     samples.filter((sample) => sample.data().uid == basic.uid)
//     //   );
//     //   seiyuList.push(seiyu);
//     // }

//     return res.json({
//       list: seiyuList.map((element) => element.toStandardObject()),
//       config: {
//         currentPage: reqPage,
//         totalPage: totalPage,
//         pageSize: 15,
//       },
//     });
//   } catch (e) {
//     return next(e);
//   }
// };

module.exports.getSeiyuList = async (req, res, next) => {
  let seiyuList = [];
  try {
    let [basicDocs, samples] = await Promise.all([
      SeiyuModel.getAllBasicInformation(),
      SeiyuModel.getAllSamples(),
    ]);
    for (let basic of basicDocs) {
      let detail = await PublicModel.getDetailInformation(basic.uid);
      let seiyu = new Seiyu(basic, detail);
      seiyu.setSamples(
        samples.filter((sample) => sample.uid == basic.uid)
      );
      seiyuList.push(seiyu);
    }

    return res.json(seiyuList.map((element) => element.toStandardObject()));
  } catch (e) {
    console.log(e);
    return next(e);
  }
};

module.exports.getSeiyuInformation = async (req, res, next) => {
  try {
    let basicData = await PublicModel.getBasicInformation(req.params.uid);
    if (basicData != null) {
      if (basicData.role != "seiyu") {
        throw new CustomError(CODE_ERROR_GENERAL, "Seiyu not found");
      }
      let [detailData, samples, dlSiteScript] = await Promise.all([
        PublicModel.getDetailInformation(basicData.id),
        SeiyuModel.getUserSamples(req.params.uid),
        PublicModel.getDLSiteScript(req.params.uid),
      ]);
      let seiyu = new Seiyu(basicData, detailData);
      seiyu.setSamples(samples);
      seiyu.setDLSiteScript(dlSiteScript.script);
      return res.json(seiyu.toStandardObject());
    }
  } catch (e) {
    return next(e);
  }
};

module.exports.getCircleList = (req, res) => {
  db.collection("users_basic")
    .where("role", "==", "circle")
    .where("name", "!=", "")
    .get()
    .then(async (data) => {
      let users = [];
      for (let doc of data.docs) {
        //console.log(doc.id);
        let detail = await db
          .collection("users_detail")
          .doc(doc.id)
          .get()
          .then((doc) => {
            return doc.data();
          });
        users.push({
          uid: doc.id,
          avatar: doc.data().avatar,
          email: doc.data().email,
          equip: doc.data().equip,
          experiences: doc.data().experiences,
          name: doc.data().name,
          page: doc.data().page,
          twitter: doc.data().twitter,
          role: doc.data().role,
          intro: doc.data().intro,
        });
      }

      return res.json(users);
    })
    .catch((err) => console.error(err));
};

module.exports.getCircleInfo = (req, res) => {
  //console.log("ID:", req.params.uid);
  let user = [];
  db.collection("users_basic")
    .doc(req.params.uid)
    .get()
    .then(async (doc) => {
      let detail = await db
        .collection("users_detail")
        .doc(doc.id)
        .get()
        .then((doc) => {
          return doc.data();
        });
      user.push({
        uid: doc.id,
        avatar: doc.data().avatar,
        email: doc.data().email,
        equip: doc.data().equip,
        experiences: doc.data().experiences,
        name: doc.data().name,
        page: doc.data().page,
        twitter: doc.data().twitter,
        role: doc.data().role,
        intro: doc.data().intro,
      });
      return res.json(user);
    })
    .catch((err) => console.error(err));
};

module.exports.getEventList = (req, res) => {
  db.collection("events")
    .where("public", "!=", false)
    .get()
    .then((data) => {
      let events = [];
      data.forEach((doc) => {
        let expiredDate = Date(doc.data().date.endDate);
        let expired = expiredDate.getTime() - Date.now().getTime() >= 0;
        events.push({
          expired: expired,

          period: doc.data().period,
          cover: doc.data().cover,
          date: doc.data().date,
          detail: doc.data().detail,
          title: doc.data().title,
          link: doc.data().link,
          organizer: doc.data().organizer,
        });
      });
      return res.json(events);
    })
    .catch((err) => console.error(err));
};

module.exports.getDlsiteScript = async (req, res) => {
  try {
    let data = await PublicModel.getDLSiteScript(req.params.uid);
    res.render("dlsite_link", {
      script: data.script,
    });
  } catch (e) {
    console.error(e);
    res.raw("script not found");
  }
};
