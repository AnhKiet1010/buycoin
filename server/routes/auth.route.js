const express = require("express");
const router = express.Router();

const { authUser, register } = require("../controllers/auth.controller");

router.post("/login", authUser);
router.post("/register", register);

module.exports = router;
