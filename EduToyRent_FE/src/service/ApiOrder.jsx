import axios from "axios";

const apiOrder = axios.create({
  baseURL: "https://localhost:44350/api/v1/Orders",
});

export default apiOrder;
