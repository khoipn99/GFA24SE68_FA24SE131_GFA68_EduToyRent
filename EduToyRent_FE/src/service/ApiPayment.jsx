import axios from "axios";

const apiPayment = axios.create({
  baseURL: "https://localhost:44350/api/Payment",
});

export default apiPayment;
