import axios from "axios";
import Cookies from "js-cookie";

const apiTransactionDetail = axios.create({
  baseURL: "https://localhost:44350/api/v1/TransactionDetails",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiTransactionDetail;
