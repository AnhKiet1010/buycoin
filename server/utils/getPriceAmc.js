const axios = require("axios");

exports.getPriceAmc = async () => {
  return axios.get("https://sapi.xt.com/v4/public/ticker/price?symbol=amc_usdt");
};
