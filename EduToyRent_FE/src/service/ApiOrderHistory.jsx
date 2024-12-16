import axios from "axios";
import Cookies from "js-cookie";

const apiOrderHistory = axios.create({
  baseURL:
    "http://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/OrderHistory",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiOrderHistory;
