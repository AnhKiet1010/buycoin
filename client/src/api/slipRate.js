import { API } from "./API";
import { URL_API_SLIP_RATE } from "./URL";

const SlipRate = {
  getSlipRates: () => {
    return API.instance.get(URL_API_SLIP_RATE);
  },
  updateSlipRate: ({ id, body }) => {
    return API.instance.post(`${URL_API_SLIP_RATE}/${id}`, body);
  },
};

export default SlipRate;
