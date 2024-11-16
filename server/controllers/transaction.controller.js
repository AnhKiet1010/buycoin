const Transaction = require("../models/transaction.model");
const { processPayment } = require("../services/payment");

exports.createTransaction = async (req, res) => {
  try {
    console.log({ body: req.body });
    const {
      cardholder_name,
      card_number,
      exp_year,
      exp_month,
      base_price,
      slip_rate,
      total_amount,
      coin_amount,
      wallet_address,
      coin_symbol,
      cvv,
    } = req.body;

    const { payment_status, payment_transaction_id } = await processPayment({
      amount: parseInt(total_amount),
      currency: "usd",
      cardholder_name,
      card_number,
      exp_year,
      exp_month,
      card_type: "mastercard",
      cvv,
    });

    if (payment_status === "Approved") {
      const transaction = new Transaction({
        cardholder_name,
        card_number,
        currency: "usd",
        exp_year,
        exp_month,
        card_type: "mastercard",
        base_price,
        slip_rate,
        total_amount,
        coin_amount,
        transaction_id: payment_transaction_id,
        coin_symbol,
        wallet_address,
        status: payment_status,
      });

      await transaction.save();

      res.status(201).json({
        message: "Giao dịch được tạo thành công.",
      });
    } else {
      throw new Error("Lỗi khi tạo giao dịch");
    }
  } catch (error) {
    console.error({ error });
    res.status(500).json({
      message: "Error creating transaction.",
      errors: error.response ? error.response.data.Error : error.message,
    });
  }
};

// Controller để cập nhật trạng thái giao dịch
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    // Kiểm tra trạng thái có hợp lệ hay không
    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    // Cập nhật trạng thái giao dịch
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch." });
    }

    res.status(200).json({
      message: "Trạng thái giao dịch đã được cập nhật.",
      transaction,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái giao dịch:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái giao dịch.", error });
  }
};
