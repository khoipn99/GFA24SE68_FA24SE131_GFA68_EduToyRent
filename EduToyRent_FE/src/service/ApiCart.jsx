import axios from "axios";
import Cookies from "js-cookie";

const apiCart = axios.create({
  baseURL: "https://localhost:44350/api/v1/Carts",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiCart;
