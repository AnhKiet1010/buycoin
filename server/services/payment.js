const axios = require("axios");

async function processPayment(data) {
  // Lấy token_id
  const tokenResponse = await axios.post(
    "https://apexapi.sandbox.go-afs.com/tokens/v1/cards",
    {
      cardNumber: data.card_number,
      expiryMonth: data.exp_month,
      expiryYear: data.exp_year,
    },
    {
      headers: {
        "Content-Type": "application/json",
        apiKey: process.env.APEX_API_KEY,
      },
    }
  );

  const tokenId = tokenResponse.data.token_id;

  console.log({ tokenId });

  const response = await axios.post(
    "https://apexapi.sandbox.go-afs.com/v1/transactions/Purchase?api-version=1.0",
    {
      amount: data.amount,
      currency: "USD",
      transaction_source: "Mail",
      payment_details: {
        method: "credit_card",
        credit_card: {
          // "Card type 'credit_card' is invalid. Only American Express, Visa, Mastercard, JCB, Diners Club, and Discover are supported"
          type: "credit_card",
          cardholder_name: data.cardholder_name,
          token_id: tokenId,
          card_number: data.card_number,
          exp_year: data.exp_year,
          exp_month: data.exp_month,
          cvv: data.cvv,
        },
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        apiKey: process.env.APEX_API_KEY,
      },
    }
  );

  const { payment_status, payment_transaction_id } = response.data;
  return { payment_status, payment_transaction_id };
}

module.exports = { processPayment };
