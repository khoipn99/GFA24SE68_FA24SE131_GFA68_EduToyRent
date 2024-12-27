import axios from "axios";
import Cookies from "js-cookie";

const apiTransactionDetail = axios.create({
  // baseURL:
  //   "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/TransactionDetails",
  baseURL: "https://localhost:44350/api/TransactionDetails",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiTransactionDetail;
