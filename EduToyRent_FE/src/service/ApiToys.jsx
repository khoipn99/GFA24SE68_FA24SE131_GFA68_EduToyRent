import axios from "axios";
import Cookies from "js-cookie";

const apiToys = axios.create({
  baseURL:
    "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/Toys",
  // baseURL: "https://localhost:44350/api/v1/Toys",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiToys;
