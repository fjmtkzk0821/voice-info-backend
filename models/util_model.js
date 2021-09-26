const firebase = require("firebase");

const { db } = require("../util/admin");
const { CODE_ERROR_GENERAL } = require("../util/message_string");
const errMsg = require("../util/error_message");
const fbConfig = require("../config.json");

