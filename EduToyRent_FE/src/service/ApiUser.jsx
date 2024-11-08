import axios from "axios";

const apiUser = axios.create({
  baseURL: "https://localhost:44350/api/v1/Users",
});

export default apiUser;
