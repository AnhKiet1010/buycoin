const Transaction = require("../models/transaction.model");
const { sendHewe } = require("../services/sendHewe");
const { sendAmc } = require("../services/sendAmc");

exports.createTransaction = async (req, res) => {
  try {
    console.log({ body: req.body });
    const {
      cardholder_name,
      card_number,
      base_price,
      slip_rate,
      total_amount,
      coin_amount,
      wallet_address,
      coin_symbol,
      card_type,
      payment_transaction_id,
    } = req.body;

    const transaction = new Transaction({
      cardholder_name,
      card_number,
      currency: "usd",
      card_type,
      base_price,
      slip_rate,
      total_amount,
      coin_amount,
      transaction_id: payment_transaction_id,
      coin_symbol,
      wallet_address,
      status: "Pending",
    });

    await transaction.save();

    let blockHash = "";

    if (coin_symbol === "HEWE") {
      const receipt = await sendHewe({
        amount: coin_amount,
        receiverAddress: wallet_address,
      });
      blockHash = receipt.blockHash;
    } else if (coin_symbol === "AMC") {
      const receipt = await sendAmc({
        amount: coin_amount,
        receiverAddress: wallet_address,
      });
      blockHash = receipt.blockHash;
    }

    transaction.status = "Approved";
    transaction.block_hash = blockHash;
    await transaction.save();

    console.log({ blockHash });

    res.status(201).json({
      message: "Giao dịch được tạo thành công.",
      blockHash,
    });
  } catch (error) {
    console.error({ error });
    res.status(500).json({
      message: "Error creating transaction.",
      errors: error.response ? error.response.data.Error : error.message,
    });
  }
};

// exports.send = async (req, res) => {
//   const response = await sendToken();
//   console.log({ response });
// };
