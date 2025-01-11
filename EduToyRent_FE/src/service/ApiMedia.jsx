import axios from "axios";
import Cookies from "js-cookie";

const apiMedia = axios.create({
  baseURL:
    "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/Media",
  // baseURL: "https://localhost:44350/api/Media",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiMedia;
