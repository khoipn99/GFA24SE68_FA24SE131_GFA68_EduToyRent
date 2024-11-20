import axios from "axios";
import Cookies from "js-cookie";

const apiWalletTransaction = axios.create({
  baseURL: "https://localhost:44350/api/v1/WalletTransaction",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiWalletTransaction;
