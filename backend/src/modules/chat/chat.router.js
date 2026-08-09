const express = require("express");
const chatController = require("./chat.controller");

const router = express.Router();

router.get("/chat/:studentPhone/messages", chatController.getMessages);

module.exports = router;
