import axios from "axios";

const apiOrderDetail = axios.create({
  baseURL: "https://localhost:44350/api/v1/OrderDetails",
});

export default apiOrderDetail;
