import axios from "axios";
import Cookies from "js-cookie";

const apiCartItem = axios.create({
  baseURL: "https://localhost:44350/api/v1/CartItems",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiCartItem;
