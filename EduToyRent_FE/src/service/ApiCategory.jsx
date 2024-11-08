import axios from "axios";

const apiCategory = axios.create({
  baseURL: "https://localhost:44350/api/v1/Categories",
});

export default apiCategory;
