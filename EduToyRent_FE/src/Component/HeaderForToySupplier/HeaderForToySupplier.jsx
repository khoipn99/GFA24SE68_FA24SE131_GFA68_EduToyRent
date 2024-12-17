import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie
import axios from "axios";
import apiWallets from "../../service/ApiWallets";
import apiUser from "../../service/ApiUser";
import apiToys from "../../service/ApiToys";

import Notifications from "../Notification/Notification";

import Logo from "../../assets/logoETR.png";

const HeaderForToySupplier = () => {
  const [cartVisible, setCartVisible] = useState(false);
  const [rentItems, setRentItems] = useState([]);
  const [buyItems, setBuyItems] = useState([]);
  const [totalRentPrice, setTotalRentPrice] = useState(0);
  const [totalBuyPrice, setTotalBuyPrice] = useState(0);
  const [userData, setUserData] = useState("");
  const [userWallets, setUserWallets] = useState();
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState({});
  const [userId, setUserId] = useState(null);
  const [userWallet, setUserWallet] = useState(""); // Thêm state này
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleMouseEnter = () => setIsDropdownOpen(true);
  const handleMouseLeave = () => setIsDropdownOpen(false);

  const navigateTo = (url) => {
    navigate(url);
  };

  const handleTopUp = () => {
    navigate("/top-up");
  };

  useEffect(() => {
    const userDataCookie = Cookies.get("userData");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);
      setUserData(parsedUserData);
      const email = parsedUserData.email;

      const fetchUserData = async () => {
        try {
          const token = Cookies.get("userToken");
          if (!token) {
            console.error("Token không hợp lệ hoặc hết hạn.");
            return;
          }

          // Gọi API lấy thông tin người dùng dựa trên email
          const response = await apiUser.get(
            `/ByEmail?email=${encodeURIComponent(
              email
            )}&pageIndex=1&pageSize=5`,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );

          console.log("Dữ liệu trả về:", response.data);

          if (response.data && response.data.length > 0) {
            const user = response.data[0];
            setUserData(user);
            setUserId(user.id);
            setEditedData(user);
            // Sau khi có walletId, gọi API ví
            if (user.walletId) {
              fetchWalletData(user.walletId);
            } else {
              console.error("Không tìm thấy walletId cho người dùng.");
            }
          } else {
            console.error("Không tìm thấy thông tin người dùng.");
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
      };

      // Hàm lấy thông tin ví của người dùng dựa trên walletId
      const fetchWalletData = async (walletId) => {
        try {
          const response = await apiWallets.get(`/${walletId}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          });

          console.log("Thông tin ví của người dùng:", response.data);
          setUserWallet(response.data); // Lưu thông tin ví vào state nếu cần
        } catch (error) {
          console.error("Lỗi khi lấy thông tin ví của người dùng:", error);
        }
      };

      fetchUserData();
    } else {
      console.error("Không tìm thấy thông tin người dùng trong cookie.");
    }

    const userWalletsCookie = Cookies.get("userData");
    if (userWalletsCookie) {
      const parsedUserWallets = JSON.parse(userWalletsCookie);
      setUserWallets(parsedUserWallets);
    } else {
      console.error("Không tìm thấy thông tin người dùng trong cookie.");
    }
  }, []);
  const logOut = () => {
    // Log cookie trước khi xóa
    console.log("Trước khi xóa:", Cookies.get("userData"));

    // Xóa cookie userData
    Cookies.remove("userData", { path: "/" });
    Cookies.remove("userToken", { path: "/" });
    Cookies.remove("userDataReal", { path: "/" });

    // Log cookie sau khi xóa
    console.log("Sau khi xóa:", Cookies.get("userData")); // Kết quả nên là undefined nếu cookie đã bị xóa

    // Chuyển hướng về trang đăng nhập
    navigate("/");
  };

  const toggleNotificationForm = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <>
      {Cookies.get("userData") ? (
        <div className="bg-white shadow-md">
          <div className="flex items-center justify-between gap-8 p-6">
            <div className="flex items-center gap-4 text-[#0e161b]">
              {/* Nội dung cho người dùng đã đăng nhập a*/}
              <Link to="#">
                <img
                  src={Logo}
                  alt="User Avatar"
                  width="50px"
                  height="50px"
                  className="rounded-full"
                />
              </Link>
              <Link to="#">
                <h2 className="text-[#0e161b] text-lg font-bold leading-tight tracking-[-0.015em]">
                  EduToyRent
                </h2>
              </Link>
            </div>
            {/* <label className="flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
              <div className="text-[#507a95] flex border-none bg-[#e8eef3] items-center justify-center pl-4 rounded-l-xl border-r-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <input
                placeholder="Search"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e161b] focus:outline-0 focus:ring-0 border-none bg-[#e8eef3] h-full placeholder:text-[#507a95] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                value=""
              />
            </div>
          </label> */}
            <div className="flex gap-2">
              <div className="flex justify-center items-center">
                <p>Số dư : {(userWallet.balance || 0).toLocaleString()} VND</p>
              </div>
              <button
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                onClick={handleTopUp} // Hàm xử lý khi nhấn vào nút
              >
                <div className="text-[#0e161b]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    {/* SVG biểu tượng phù hợp cho "Nạp tiền" */}
                    <path d="M128,8a120,120,0,1,0,120,120A120.14,120.14,0,0,0,128,8Zm56,120a8,8,0,0,1-8,8H136v40a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V80a8,8,0,0,1,16,0v40h40A8,8,0,0,1,184,128Z"></path>
                  </svg>
                </div>
                <span>Nạp tiền</span>
              </button>
              <div className="relative">
                {/* Nút Notification */}
                <button
                  className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                  onClick={toggleNotificationForm}
                >
                  <div className="text-[#0e161b]">
                  <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20px" 
                      height="20px" 
                      fill="currentColor" 
                      viewBox="0 0 24 24">
                      <path d="M12.81 46.31c.24.06.49.09.73.09 1.34 0 2.57-.91 2.91-2.27 2.78-11.12 9.4-20.97 18.63-27.71 1.34-.98 1.63-2.85.65-4.19-.98-1.34-2.85-1.63-4.19-.65-10.36 7.57-17.79 18.61-20.91 31.1C10.22 44.28 11.2 45.91 12.81 46.31zM92.93 16.42c9.23 6.74 15.84 16.58 18.63 27.71.34 1.36 1.56 2.27 2.91 2.27.24 0 .49-.03.73-.09 1.61-.4 2.58-2.03 2.18-3.64-3.12-12.48-10.55-23.53-20.91-31.1-1.34-.98-3.21-.69-4.19.65C91.3 13.57 91.59 15.44 92.93 16.42zM19.2 90.85c-.98 3.91-.12 7.98 2.37 11.15 2.48 3.18 6.22 5 10.25 5h14.46c1.43 8.5 8.83 15 17.73 15s16.29-6.5 17.73-15h14.46c4.03 0 7.77-1.82 10.25-5 2.48-3.18 3.34-7.24 2.37-11.15L97.97 47.53C94.07 31.91 80.1 21 64 21S33.93 31.91 30.03 47.53L19.2 90.85zM64 116c-5.58 0-10.27-3.83-11.61-9h23.21C74.27 112.17 69.58 116 64 116zM64 27c13.34 0 24.92 9.04 28.15 21.98l10.83 43.32c.53 2.11.06 4.29-1.27 6.01-1.34 1.71-3.35 2.69-5.52 2.69H31.81c-2.17 0-4.18-.98-5.52-2.69-1.34-1.71-1.8-3.9-1.27-6.01l10.83-43.32C39.08 36.04 50.66 27 64 27z"></path>
                    </svg>
                  </div>
                </button>

                {/* Form Notification */}
                {isNotificationOpen && (
                  <div
                    className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg w-96 h-auto p-4"
                    style={{ zIndex: 1 }}
                  >
                    <Notifications show={isNotificationOpen} />
                  </div>
                )}
              </div>
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative flex items-center space-x-2"
              >
                <div className="text-[#0e161b]">
                  <img
                    src={userData.avatarUrl}
                    alt="User Avatar"
                    width="40px"
                    height="40px"
                    className="rounded-full"
                  />
                </div>
                <div className="flex justify-center items-center">
                  <p>{userData.fullName || userData.name}</p>
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full mt-0 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                    <button
                      onClick={logOut}
                      className="block w-full text-left p-2 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>{" "}
          </div>{" "}
        </div>
      ) : (
        <div className="bg-white shadow-md">
          <div className="flex items-center justify-between gap-8 p-6">
            <div className="flex items-center gap-4 text-[#0e161b]">
              {/* Nội dung cho người dùng chưa đăng nhập */}
              <Link to="/">
                <div className="size-4">
                  <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </Link>
              <Link to="/">
                <h2 className="text-[#0e161b] text-lg font-bold leading-tight tracking-[-0.015em]">
                  Edutoys
                </h2>
              </Link>
            </div>
            {/* <label className="flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
              <div className="text-[#507a95] flex border-none bg-[#e8eef3] items-center justify-center pl-4 rounded-l-xl border-r-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <input
                placeholder="Search"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e161b] focus:outline-0 focus:ring-0 border-none bg-[#e8eef3] h-full placeholder:text-[#507a95] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                value=""
              />
            </div>
          </label> */}
            <div className="flex gap-2">
              <Link to="/login">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#47a6e6] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Đăng nhập</span>
                </button>
              </Link>
              <Link to="/register">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Đăng ký</span>
                </button>
              </Link>
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                <div className="text-[#0e161b]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                  </svg>
                </div>
              </button>
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                <div className="text-[#0e161b]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"></path>
                  </svg>
                </div>
              </button>
            </div>{" "}
          </div>{" "}
        </div>
      )}
    </>
  );
};

export default HeaderForToySupplier;
