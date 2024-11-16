import axios from "axios";
import queryString from "query-string";

const getInstance = () => {
  const instance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    paramsSerializer: (params) => queryString.stringify(params),
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
  });
  return instance;
};

export const API = { instance: getInstance() };
