import React, { useState } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";

const TopUp = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Giả lập nạp tiền thành công (cần tích hợp API thực tế ở đây)
    if (amount && paymentMethod) {
      setRechargeSuccess(true);
      console.log(`Số tiền: ${amount}, Phương thức: ${paymentMethod}`);
    }
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
                Số tiền cần nạp (VNĐ):
              </label>
              <input
                type="number"
                min="10000"
                step="10000"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="paymentMethod"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Chọn phương thức thanh toán:
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="paymentMethod"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                required
              >
                <option value="momo">Ví Momo</option>
                <option value="bank">Chuyển khoản ngân hàng</option>
                <option value="creditcard">Thẻ tín dụng/ghi nợ</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Nạp tiền
            </button>
          </form>

          {rechargeSuccess && (
            <div className="mt-6 text-center bg-green-100 text-green-700 py-3 rounded-lg">
              Bạn đã nạp thành công <strong>{amount}</strong> VNĐ vào tài khoản!
            </div>
          )}
        </div>
      </main>

      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default TopUp;
