import axios from "axios";
import Cookies from "js-cookie";

const apiWallets = axios.create({
  baseURL:
    "http://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/Wallets",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiWallets;
