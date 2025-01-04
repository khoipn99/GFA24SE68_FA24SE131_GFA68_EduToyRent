import axios from "axios";
import Cookies from "js-cookie";

const apiOrderTypes = axios.create({
  // baseURL:
  //   "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/OrderType",

  baseURL: "https://localhost:44350/api/v1/OrderType",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiOrderTypes;
