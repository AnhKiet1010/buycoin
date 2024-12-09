const axios = require("axios");
const querystring = require("querystring");
const https = require("https");

// exports.getApexTokenId = async ({ card_number, expiry_month, expiry_year }) => {
//   const response = await axios.post(
//     "https://apexapi.sandbox.go-afs.com/tokens/v1/cards",
//     {
//       cardNumber: card_number,
//       expiryMonth: expiry_month,
//       expiryYear: expiry_year,
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         apiKey: process.env.APEX_API_KEY,
//       },
//     }
//   );
//   if (response) {
//     return response.data;
//   }
// };

// exports.purchase = async ({ amount, type, cardholder_name, token_id }) => {
//   const response = await axios.post(
//     "https://apexapi.sandbox.go-afs.com/v1/transactions/Purchase?api-version=1.0",
//     {
//       amount,
//       currency: "USD",
//       payment_details: {
//         method: "credit_card",
//         credit_card: {
//           type,
//           cardholder_name,
//           token_id,
//         },
//       },
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         apiKey: process.env.APEX_API_KEY,
//       },
//     }
//   );
//   return response.data;
// };

// Validate keys in the provided information
const validateKeys = (info, validKeys, type) => {
  for (let key in info) {
    if (!validKeys.includes(key)) {
      throw new Error(`Invalid key provided in ${type}. '${key}' is not valid.`);
    }
  }
};

// Perform API request
const doRequest = (securityKey, requestData) => {
  const hostName = "payments.go-afs.com";
  const path = "/api/transact.php";

  // Attach security key to request data
  const postData = querystring.stringify({ ...requestData, security_key: securityKey });

  const options = {
    hostname: hostName,
    path: path,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (response) => {
      let data = "";

      // Collect response data
      response.on("data", (chunk) => {
        data += chunk;
      });

      // Resolve promise when response ends
      response.on("end", () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data,
        });
      });
    });

    // Reject promise if an error occurs
    req.on("error", (err) => reject(err));

    req.write(postData); // Write request body
    req.end();
  });
};

// Function to perform a sale transaction
exports.performSale = async (securityKey, billingInfo, shippingInfo, saleDetails) => {
  // Validate billing and shipping information
  const validBillingKeys = [
    "first_name",
    "last_name",
    "company",
    "address1",
    "address2",
    "city",
    "state",
    "zip",
    "country",
    "phone",
    "fax",
    "email",
  ];
  const validShippingKeys = [
    "shipping_first_name",
    "shipping_last_name",
    "shipping_company",
    "shipping_address1",
    "address2",
    "shipping_city",
    "shipping_state",
    "shipping_zip",
    "shipping_country",
    "shipping_email",
  ];

  validateKeys(billingInfo, validBillingKeys, "billing information");
  validateKeys(shippingInfo, validShippingKeys, "shipping information");

  // Combine all data
  const requestData = {
    ...saleDetails, // Includes: type, amount, ccnumber, ccexp, cvv
    ...billingInfo,
    ...shippingInfo,
  };

  // Perform API request
  return await doRequest(securityKey, requestData);
};

exports.afsPayment = async (billingInfo, shippingInfo, saleDetails) => {
  const response = await axios.post("https://ameritecps.com/wp-json/payment/v1/process", {
    // type: "sale",
    // amount: "100.50",
    // ccnumber: "4111111111111111",
    // ccexp: "1025",
    // cvv: "123",
    ...saleDetails,
    billing_info: billingInfo,
    // {
    //   first_name: "John",
    //   last_name: "Doe",
    //   address1: "123 Main St",
    //   city: "Los Angeles",
    //   state: "CA",
    //   zip: "90001",
    //   country: "US",
    //   phone: "1234567890",
    //   email: "john.doe@example.com",
    // },
    shipping_info: shippingInfo,
    // {
    //   shipping_first_name: "John",
    //   shipping_last_name: "Doe",
    //   shipping_address1: "456 Elm St",
    //   shipping_city: "Los Angeles",
    //   shipping_state: "CA",
    //   shipping_zip: "90001",
    //   shipping_country: "US",
    // },
  });
  return response.data;
};
