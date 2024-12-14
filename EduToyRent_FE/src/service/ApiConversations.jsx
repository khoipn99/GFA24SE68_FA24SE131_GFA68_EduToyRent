import axios from "axios";
import Cookies from "js-cookie";

const apiConversations = axios.create({
  baseURL: "https://localhost:44350/api/v1/Conversations",
  headers: {
    Authorization: `Bearer ${Cookies.get("userToken")}`,
  },
});

export default apiConversations;
