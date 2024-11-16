import axios from "axios";

export const getApexTokenId = async ({ card_number, expiry_month, expiry_year }) => {
  try {
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
  } catch (error) {
    console.error("Error fetching apex token id:", error);
  }
};
