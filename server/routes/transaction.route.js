const express = require("express");
const router = express.Router();

const { createTransaction } = require("../controllers/transaction.controller");

router.post("/pay", createTransaction);

module.exports = router;
