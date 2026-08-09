const express = require("express");
const authController = require("./auth.controller");

const router = express.Router();

router.post("/createAccessCode", authController.createAccessCode);
router.post("/validateAccessCode", authController.validateAccessCode);
router.post("/LoginEmail", authController.loginEmail);
router.post("/validateEmailAccessCode", authController.validateEmailAccessCode);

module.exports = router;
