import { API } from "./API";
import { URL_API_AUTH } from "./URL";

const Auth = {
  login: (body) => {
    return API.instance.post(`${URL_API_AUTH}/login`, body);
  },
};

export default Auth;
