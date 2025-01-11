import axios from "axios";
import Cookies from "js-cookie";

const apiRatingImage = axios.create({
  baseURL:
    "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/RatingImages",

  // baseURL: "https://localhost:44350/api/RatingImages",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiRatingImage;
