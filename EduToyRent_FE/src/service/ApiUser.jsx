import axios from "axios";

const apiUser = axios.create({
  baseURL: "http://localhost:8080/api/bracket-management",
});

export default apiUser;
