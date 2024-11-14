import axios from "axios";
import Cookies from "js-cookie";

const apiOrder = axios.create({
  baseURL: "https://localhost:44350/api/v1/Orders",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiOrder;
