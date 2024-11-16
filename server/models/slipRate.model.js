const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const slipRateSchema = new Schema({
  minCoins: {
    type: Number,
    required: true,
  },
  maxCoins: {
    type: Number,
    required: false,
  },
  slipRate: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("SlipRate", slipRateSchema);
