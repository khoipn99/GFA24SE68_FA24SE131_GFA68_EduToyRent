import axios from "axios";
import Cookies from "js-cookie";

const apiMedia = axios.create({
  baseURL: "https://localhost:44350/api/Media",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiMedia;
