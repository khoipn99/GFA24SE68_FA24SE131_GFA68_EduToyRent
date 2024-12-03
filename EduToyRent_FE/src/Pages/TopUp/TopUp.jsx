import React, { useState } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import apiPayment from "../../service/ApiPayment";
import Cookies from "js-cookie";

const TopUp = () => {
  const [amount, setAmount] = useState("");

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");

    if (rawValue) {
      setAmount(new Intl.NumberFormat("vi-VN").format(rawValue));
    } else {
      setAmount("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const numericAmount = parseInt(amount.replace(/\./g, ""), 10);

    apiPayment
      .post(
        "/create-payment-link?totalAmount=" + numericAmount + "&orderId=6368"
      )
      .then((response) => {
        Cookies.set("TopUpMoney", numericAmount, { expires: 1 });
        window.location.href = response.data.url;
      });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 p-9">
      <header>
        <HeaderForCustomer />
      </header>

      <main className="flex-grow flex justify-center items-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Nạp tiền vào tài khoản
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label
                htmlFor="amount"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Nhập số tiền cần nạp (VNĐ):
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                placeholder="10.000"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Nạp tiền
            </button>
          </form>
        </div>
      </main>

      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default TopUp;
