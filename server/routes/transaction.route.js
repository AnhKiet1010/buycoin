const express = require("express");
const router = express.Router();

const { createTransaction } = require("../controllers/transaction.controller");

router.post("/pay", createTransaction);
// router.post("/send", send);

module.exports = router;
