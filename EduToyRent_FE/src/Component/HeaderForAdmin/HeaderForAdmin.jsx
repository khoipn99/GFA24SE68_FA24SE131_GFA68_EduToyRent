import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie
import Logo from "../../assets/logoETR.png";
import apiUser from "../../service/ApiUser";

const HeaderForAdmin = () => {
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

  const handleMouseEnter = () => setIsDropdownOpen(true);
  const handleMouseLeave = () => setIsDropdownOpen(false);

  const navigateTo = (url) => {
    navigate(url);
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
          Cookies.set("userDataReal", JSON.stringify(response.data), {
            expires: 7,
          });
          if (response.data && response.data.length > 0) {
            const user = response.data[0];
            setUserData(user);
            setUserId(user.id);
            setEditedData(user);
          } else {
            console.error("Không tìm thấy thông tin người dùng.");
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
      };
      fetchUserData();
    } else {
      console.error("Không tìm thấy thông tin người dùng trong cookie.");
      navigate("/Login");
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
    navigate("/Login");
  };

  return (
    <>
      {Cookies.get("userData") ? (
        <div className="bg-white shadow-md">
          <div className="flex items-center justify-between gap-8 p-6">
            <div className="flex items-center gap-4 text-[#0e161b]">
              {/* Nội dung cho người dùng đã đăng nhập a*/}
              <Link to="#">
                <div className="size-4">
                  <img src={Logo} alt="App Store" className="w-32" />
                </div>
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
        <div></div>
      )}
    </>
  );
};

export default HeaderForAdmin;
