const express = require("express");
const router = express.Router();

const { getSlipRates, createInitialSlipRate } = require("../controllers/slipRate.controller");

router.get("/", getSlipRates);
router.post("/create", createInitialSlipRate);

module.exports = router;
