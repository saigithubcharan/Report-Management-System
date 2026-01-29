import axios from "axios";
import { config } from "../config";
import { getAccountDetails } from "../Components/Services/localStorage";

const instance = axios.create()

instance.interceptors.request.use(
  function (config) {
    const { accessToken } = getAccountDetails();
    config.headers.authorization = `Bearer ${accessToken}`;
    return config
  },
  function (error) {
    return error;
  }
);



export default instance;
