import { API } from "./API";
import { URL_API_TRANSACTION } from "./URL";

const Transaction = {
  transfer: (body) => {
    return API.instance.post(`${URL_API_TRANSACTION}/pay`, body);
  },
};

export default Transaction;
