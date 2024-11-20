import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import LoginBG from "../../assets/bg.png";
import apiLogin from "../../service/ApiLogin";
import apiUser from "../../service/ApiUser";
const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (Cookies.get("userToken")) {
      navigate("/");
    }
  });

  // Hàm đăng nhập qua API riêng
  const handleApiLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiLogin.post("", { email, password });

      // Kiểm tra xem phản hồi có dữ liệu cần thiết hay không
      if (response.data && response.data.token) {
        // Lưu token và thông tin người dùng vào cookies
        Cookies.set("userToken", response.data.token, { expires: 7 }); // Lưu trong 1 ngày
        const userData = {
          email: response.data.email,
          roleId: response.data.roleId,
          fullName: response.data.fullName,
          userId: response.data.userId,
        };
        Cookies.set("userData", JSON.stringify(userData), { expires: 7 });
        try {
          //const token = localStorage.getItem("token");

          const token = Cookies.get("userToken");
          if (!token) {
            console.error("Token không hợp lệ hoặc hết hạn.");
            return;
          }

          // Gọi API lấy thông tin người dùng dựa trên userid
          const response = await apiUser.get(`/${userData.userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("Dữ liệu trả về:", response.data);
          Cookies.set("userDataReal", JSON.stringify(response.data[0]), {
            expires: 7,
          });
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
        // Kiểm tra vai trò và chuyển hướng đến trang tương ứngg
        switch (userData.roleId) {
          case 1:
            navigate("/AdminPolicy");
            break;
          case 2:
            navigate("/toySupplier");
            break;
          case 3:
            navigate("/");
            break;
          case 4:
            navigate("/staff");
            break;
          default:
            navigate("/"); // Chuyển hướng về trang chính nếu không khớp với vai trò
            break;
        }
        console.log(response);
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (error) {
      if (error.response) {
        setError("Lỗi từ server: " + error.response.data);
      } else if (error.request) {
        setError("Không có phản hồi từ server.");
      } else {
        setError("Đã xảy ra lỗi trong quá trình đăng nhập.");
      }
    }
  };
  // Hàm đăng nhập Google
  const handleGoogleSuccess = (response) => {
    try {
      // Giải mã JWT từ Google để lấy thông tin người dùng
      const decoded = jwtDecode(response.credential);

      // Lưu token và dữ liệu người dùng vào cookies
      Cookies.set("userToken", response.credential, { expires: 1 }); // Lưu trong 1 ngày
      Cookies.set("userData", JSON.stringify(decoded), { expires: 1 });

      navigate("/"); // Chuyển hướng đến trang chính
      console.log(decoded);
    } catch (error) {
      console.error("JWT Decode Error:", error);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("Login failed:", error);
  };

  return (
    <div className="relative">
      <img
        src={LoginBG}
        alt="Background"
        className="absolute inset-0 object-cover w-full h-full"
      />
      <div className="flex justify-center items-center min-h-screen relative z-10">
        <div className="bg-gray-100 bg-opacity-80 flex flex-col justify-center items-center w-full max-w-md mx-auto p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold mb-6">Đăng Nhập</h1>
          <form className="w-full" onSubmit={handleApiLoginSubmit}>
            <div className="mb-4 w-full">
              <label htmlFor="email" className="block text-gray-600">
                Email
              </label>
              <input
                type="text"
                id="email"
                name="email"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-6 w-full">
              <label htmlFor="password" className="block text-gray-600">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4 w-full">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full mt-2"
              >
                Đăng Nhập
              </button>
            </div>
          </form>
          <GoogleOAuthProvider clientId="695962570544-hia41gl00ujfg9hkc703jse7t3q9kpco.apps.googleusercontent.com">
            {/* Nút Google Login */}
            <div className="mb-4 w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                text="signin_with"
              />
            </div>
          </GoogleOAuthProvider>
          {/* Đăng ký tài khoản */}
          <div className="flex justify-center items-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Đăng ký tại đây
              </span>
            </p>
          </div>
          <div className="flex justify-center items-center mt-4">
            <p className="text-gray-600">
              Đăng ký làm nhà cung cấp?{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => navigate("/registerchef")}
              >
                Đăng ký tại đây
              </span>
            </p>
          </div>
          <div className="flex justify-center items-end mt-6">
            <p className="text-center text-gray-600">
              Copyright&copy; 2024 EduToyRent Competition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
