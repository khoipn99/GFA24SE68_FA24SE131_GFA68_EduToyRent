import axios from "axios";
import Cookies from "js-cookie";

const apiCart = axios.create({
  baseURL:
    "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/Carts", ////12:17
  // baseURL: "https://localhost:44350/api/v1/Carts",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiCart;
