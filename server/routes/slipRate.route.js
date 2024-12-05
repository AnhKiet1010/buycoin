const express = require("express");
const router = express.Router();

const {
  getSlipRates,
  // createInitialSlipRate,
  updateSlipRate,
} = require("../controllers/slipRate.controller");

router.get("/", getSlipRates);
// router.post("/create", createInitialSlipRate);
router.post("/:id", updateSlipRate);

module.exports = router;
