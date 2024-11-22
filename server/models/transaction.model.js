const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  wallet_address: {
    type: String,
    required: true,
  },
  cardholder_name: {
    type: String,
    required: true,
  },
  card_number: {
    type: String,
    required: true,
  },
  base_price: {
    type: String,
    required: true,
  },
  transaction_id: {
    type: String,
    required: true,
    unique: true,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  coin_symbol: {
    type: String,
    enum: ["HEWE", "AMC"],
  },
  coin_amount: {
    type: Number,
  },
  slip_rate: {
    type: Number,
    required: true,
  },
  block_hash: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Approved", "Error", "Not Processed", "Pending"],
    default: "pending",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
