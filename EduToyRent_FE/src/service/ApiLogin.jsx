import axios from "axios";
import Cookies from "js-cookie";

const apiLogin = axios.create({
  //baseURL:
    //"https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/Auth/login",
  baseURL: "https://localhost:44350/api/Auth/login",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiLogin;
