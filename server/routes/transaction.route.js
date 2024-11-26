const express = require("express");
const router = express.Router();

const { createTransaction, getList } = require("../controllers/transaction.controller");

router.post("/pay", createTransaction);
router.get("/list", getList);
// router.post("/send", send);

module.exports = router;
