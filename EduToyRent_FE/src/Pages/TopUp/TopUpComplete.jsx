import React, { useState, useEffect } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { useNavigate, useLocation } from "react-router-dom";
import apiWallets from "../../service/ApiWallets";
import apiWalletTransaction from "../../service/ApiWalletTransaction";
import apiUser from "../../service/ApiUser";
import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie

const TopUpComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({});

  const handleGoHome = () => {
    navigate("/");
  };

  const handleTopUpAgain = () => {
    navigate("/top-up");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 p-9">
      <header>
        <HeaderForCustomer />
      </header>

      <main className="flex-grow flex flex-col justify-center items-center space-y-6">
        {/* Biểu tượng chữ V thành công */}
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            width="40"
            height="40"
          >
            <path d="M16 2l-8 8-4-4 1.41-1.42L8 7.17 14.59 0.59 16 2z" />
          </svg>
        </div>

        {/* Dòng cảm ơn */}
        <p className="text-xl font-semibold text-gray-800 text-center">
          Bạn đã thanh toán thành công!
        </p>

        {/* Các nút điều hướng */}
        <div className="flex space-x-4">
          <button
            onClick={handleGoHome}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
          >
            Về trang chủ
          </button>
          <button
            onClick={handleTopUpAgain}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
          >
            Nạp tiền thêm
          </button>
        </div>
      </main>

      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default TopUpComplete;
