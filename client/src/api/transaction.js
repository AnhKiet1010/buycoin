import { API } from "./API";
import { URL_API_TRANSACTION } from "./URL";

const Transaction = {
  transfer: (body) => {
    return API.instance.post(`${URL_API_TRANSACTION}/pay`, body);
  },
  getList: ({ currentPage, perPage }) => {
    return API.instance.get(`${URL_API_TRANSACTION}/list?page=${currentPage}&perPage=${perPage}`);
  },
};

export default Transaction;
