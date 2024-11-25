import React, { useState, useEffect } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { useNavigate, useLocation } from "react-router-dom";
import apiWallets from "../../service/ApiWallets";
import apiWalletTransaction from "../../service/ApiWalletTransaction";
import apiUser from "../../service/ApiUser";
import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie

const TopUpSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({});

  const handleGoHome = () => {
    navigate("/");
  };

  const handleTopUpAgain = () => {
    navigate("/top-up");
  };

  useEffect(() => {
    // Parse query parameters
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const id = searchParams.get("id");
    const cancel = searchParams.get("cancel");
    const status = searchParams.get("status");
    const orderCode = searchParams.get("orderCode");

    const userDataCookie = Cookies.get("userDataReal");
    var parsedUserData;
    if (userDataCookie) {
      try {
        parsedUserData = JSON.parse(userDataCookie);
        setCustomerInfo(parsedUserData); // Adjust based on your app's logic
        console.log("Parsed user data:", parsedUserData);
      } catch (error) {
        console.error("Error parsing userDataCookie:", error);
      }
    } else {
      console.warn("Cookie 'userDataReal' is missing or undefined.");
    }
    apiWallets
      .get("/" + parsedUserData.walletId, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response2) => {
        console.log(
          response2.data.balance + parseFloat(Cookies.get("PaymentPrice"))
        );
      });

    if (cancel == "false") {
      apiWallets
        .get("/" + parsedUserData.walletId, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        })
        .then((response2) => {
          const walletTmp = response2.data;
          console.log(walletTmp.id);
          apiWallets.put(
            "/" + walletTmp.id,
            {
              balance:
                walletTmp.balance + parseFloat(Cookies.get("PaymentPrice")),
              withdrawMethod: walletTmp.withdrawMethod,
              withdrawInfo: walletTmp.withdrawInfo,
              status: walletTmp.status,
              userId: walletTmp.userId,
            },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );
          apiWalletTransaction.post(
            "",
            {
              transactionType: "Nạp tiền",
              amount: parseFloat(Cookies.get("PaymentPrice")),
              date: new Date().toISOString(),
              walletId: walletTmp.id,
              paymentTypeId: 5,
              orderId: null,
            },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );
        });

      navigate("/topup-complete");
    }
  }, []);

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

export default TopUpSuccess;
