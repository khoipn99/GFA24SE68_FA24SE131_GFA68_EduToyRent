import axios from "axios";
import Cookies from "js-cookie";

const apiOrderCheckImages = axios.create({
  baseURL:
    "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/OrderCheckImages",

  // baseURL: "https://localhost:44350/api/OrderCheckImages",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiOrderCheckImages;
