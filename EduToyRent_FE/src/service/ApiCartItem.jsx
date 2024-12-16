import axios from "axios";
import Cookies from "js-cookie";

const apiCartItem = axios.create({
  //baseURL: "http://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/CartItems",
  baseURL: "https://localhost:44350/api/v1/CartItems",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiCartItem;
