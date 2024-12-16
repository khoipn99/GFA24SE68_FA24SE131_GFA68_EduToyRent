import axios from "axios";
import Cookies from "js-cookie";

const apiTransactionDetail = axios.create({
  baseURL:
    "http://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/TransactionDetails",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiTransactionDetail;
