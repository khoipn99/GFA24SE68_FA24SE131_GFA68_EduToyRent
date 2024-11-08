import axios from "axios";

const apiWallets = axios.create({
  baseURL: "https://localhost:44350/api/v1/Wallets",
});

export default apiWallets;
