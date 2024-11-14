import axios from "axios";
import Cookies from "js-cookie";

const apiPayment = axios.create({
  baseURL: "https://localhost:44350/api/Payment",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiPayment;
