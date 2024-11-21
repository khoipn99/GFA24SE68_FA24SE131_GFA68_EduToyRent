import axios from "axios";
import Cookies from "js-cookie";

const apiTransaction = axios.create({
  baseURL: "https://localhost:44350/api/v1/Transactions",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiTransaction;
