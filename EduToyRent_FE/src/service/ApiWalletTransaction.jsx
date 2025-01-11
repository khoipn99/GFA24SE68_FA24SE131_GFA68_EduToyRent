import axios from "axios";
import Cookies from "js-cookie";

const apiWalletTransaction = axios.create({
  baseURL:
    "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/WalletTransaction",
  //baseURL: "https://localhost:44350/api/v1/WalletTransaction",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiWalletTransaction;
