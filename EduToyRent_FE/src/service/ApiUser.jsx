import axios from "axios";

const apiUser = axios.create({
  baseURL: "http://localhost:44350/api/Auth/login",
});

export default apiUser;
