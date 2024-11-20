import axios from "axios";
import Cookies from "js-cookie";

const apiRatings = axios.create({
  baseURL: "https://localhost:44350/api/v1/Ratings",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiRatings;
