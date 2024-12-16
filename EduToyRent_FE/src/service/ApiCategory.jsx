import axios from "axios";
import Cookies from "js-cookie";

const apiCategory = axios.create({
  //baseURL: "http://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/Categories",
  baseURL: "https://localhost:44350/api/v1/Categories",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiCategory;
