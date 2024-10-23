import axios from "axios";

const apiToys = axios.create({
  baseURL: "https://localhost:44350/api/v1/Toys",
});

export default apiToys;
