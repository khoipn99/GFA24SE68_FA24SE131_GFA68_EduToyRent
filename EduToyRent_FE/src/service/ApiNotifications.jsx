import axios from "axios";
import Cookies from "js-cookie";

const apiNotifications = axios.create({
  baseURL:
    "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/Notifications",
  // baseURL: "https://localhost:44350/api/v1/Notifications",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiNotifications;
