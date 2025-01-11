import axios from "axios";
import Cookies from "js-cookie";

const apiPayment = axios.create({
  baseURL:
    "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/Payment",
  // baseURL: "https://localhost:44350/api/Payment",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiPayment;
