const Transaction = require("../models/transaction.model");
const { sendHewe } = require("../services/sendHewe");
const { sendAmc } = require("../services/sendAmc");
const { performSale, afsPayment } = require("../utils/payment");
const { splitCardholderName, parseQueryString } = require("../utils");

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
      expiry_month,
      expiry_year,
      address,
      cvv,
      city,
      state,
      zip,
    } = req.body;

    const { first_name, last_name } = splitCardholderName(cardholder_name);

    const transaction = new Transaction({
      cardholder_name,
      card_number,
      currency: "usd",
      card_type,
      base_price,
      slip_rate,
      total_amount,
      coin_amount,
      coin_symbol,
      wallet_address,
      status: "Pending",
    });

    const billingInfo = {
      first_name,
      last_name,
      address1: address,
      city,
      state,
      zip,
    };

    const shippingInfo = {
      // shipping_first_name: "Jane",
      // shipping_last_name: "Smith",
      // shipping_address1: "456 Oak St",
      // shipping_city: "Los Angeles",
      // shipping_state: "CA",
      // shipping_zip: "90001",

      shipping_first_name: "",
      shipping_last_name: "",
      shipping_address1: "",
      shipping_city: "",
      shipping_state: "",
      shipping_zip: "",
    };

    const saleDetails = {
      type: "sale",
      amount: total_amount, // Amount in USD
      ccnumber: card_number, // Test card number
      ccexp: `${expiry_month}${expiry_year}`, // MMYY format
      cvv, // Card CVV code
    };

    const responseObj = await afsPayment(billingInfo, shippingInfo, saleDetails);
    if (responseObj) {
      const { responsetext, transactionid, response_code } = responseObj;
      if (response_code === "100") {
        transaction.transaction_id = transactionid;
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
      } else {
        res.status(400).json({
          message: responsetext,
        });
      }
    } else {
      throw new Error("Internal error");
    }
  } catch (error) {
    console.error({ error });
    res.status(400).json({
      message: "Error creating transaction.",
      errors: error.response ? error.response.data.Error : error.message,
    });
  }
};

// exports.send = async (req, res) => {
//   const securityKey = "6457Thfj624V5r7WUwc5v6a68Zsd6YEm";

//   const billingInfo = {
//     first_name: "Anh",
//     last_name: "Phuong",
//     address1: "123 Elm St",
//     city: "New York",
//     state: "NY",
//     zip: "10001",
//   };

//   const shippingInfo = {
//     shipping_first_name: "Jane",
//     shipping_last_name: "Smooth",
//     shipping_address1: "456 Oak St",
//     shipping_city: "Los Angeles",
//     shipping_state: "CA",
//     shipping_zip: "90001",
//   };

//   const saleDetails = {
//     type: "sale",
//     amount: "100.00", // Amount in USD
//     ccnumber: "4111111111111111", // Test card number
//     ccexp: "1225", // MMYY format
//     cvv: "123", // Card CVV code
//   };

//   try {
//     const payment = await performSale(securityKey, billingInfo, shippingInfo, saleDetails);
//     console.log("Transaction successful!");
//     console.log("Response:", payment);
//   } catch (error) {
//     console.error("Transaction failed:", error.message);
//   }
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
