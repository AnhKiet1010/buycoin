const Transaction = require("../models/transaction.model");
const { sendHewe } = require("../services/sendHewe");
const { sendAmc } = require("../services/sendAmc");

exports.createTransaction = async (req, res) => {
  try {
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

    res.status(201).json({
      message: "Payment successful",
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

exports.getList = async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const perPageNumber = parseInt(perPage, 10);

    const skip = (pageNumber - 1) * perPageNumber;

    const list = await Transaction.find({}).skip(skip).limit(perPageNumber);

    const total = await Transaction.countDocuments();

    res.json({
      data: list,
      pagination: {
        currentPage: pageNumber,
        perPage: perPageNumber,
        total,
        totalPages: Math.ceil(total / perPageNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching transaction list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
