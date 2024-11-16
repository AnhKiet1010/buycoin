import axios from "axios";

export const getPriceHewe = async () => {
  return axios.get("https://api.lbkex.com/v1/ticker.do?symbol=hewe_usdt");
};
