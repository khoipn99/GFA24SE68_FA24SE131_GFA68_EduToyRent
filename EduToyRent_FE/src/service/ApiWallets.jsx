import axios from "axios";
import Cookies from "js-cookie";

const apiWallets = axios.create({
  baseURL: "https://localhost:44350/api/v1/Wallets",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiWallets;
