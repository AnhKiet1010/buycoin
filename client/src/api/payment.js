import axios from "axios";

export const getApexTokenId = async ({ card_number, expiry_month, expiry_year }) => {
  const response = await axios.post(
    "https://apexapi.sandbox.go-afs.com/tokens/v1/cards",
    {
      cardNumber: card_number,
      expiryMonth: expiry_month,
      expiryYear: expiry_year,
    },
    {
      headers: {
        "Content-Type": "application/json",
        apiKey: import.meta.env.VITE_APEX_API_KEY,
      },
    }
  );
  if (response) {
    return response.data;
  }
};

export const purchase = async ({ amount, type, cardholder_name, token_id }) => {
  const response = await axios.post(
    "https://apexapi.sandbox.go-afs.com/v1/transactions/Purchase?api-version=1.0",
    {
      amount,
      currency: "USD",
      payment_details: {
        method: "credit_card",
        credit_card: {
          type,
          cardholder_name,
          token_id,
        },
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        apiKey: import.meta.env.VITE_APEX_API_KEY,
      },
    }
  );
  return response.data;
};
