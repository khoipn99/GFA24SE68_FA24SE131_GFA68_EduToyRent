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
          Cookies.set("userDataReal", JSON.stringify(response.data), {
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
  const logFormData = (formData) => {
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
  };
  // Hàm đăng nhập Google
  const handleGoogleSuccess = async (response) => {
    try {
      // Giải mã JWT từ Google
      const decoded = jwtDecode(response.credential);

      // Lấy dữ liệu từ Google
      const { email, name, picture, sub } = decoded;

      // Gán giá trị mặc định nếu thiếu dữ liệu
      const fullName = name || "Default Name";
      const avatarUrl = picture || "https://example.com/default-avatar.png";
      const userEmail = email || "default@example.com";
      const userId = sub;

      // Kiểm tra nếu email đã tồn tại
      const checkUserResponse = await apiUser.get(
        `/ByEmail?email=${userEmail}&pageIndex=1&pageSize=50`
      );

      if (
        checkUserResponse.status === 200 &&
        checkUserResponse.data.totalCount > 0
      ) {
        // Nếu người dùng đã tồn tại
        alert(
          "Tài khoản với email này đã tồn tại. Vui lòng sử dụng email khác."
        );
        return; // Dừng lại không tạo tài khoản mới
      }

      // Chuẩn bị dữ liệu người dùng mới dưới dạng FormData
      const formData = new FormData();
      formData.append("FullName", fullName);
      formData.append("Email", userEmail);
      formData.append("Password", "1"); // Nếu không cần password, có thể để trống
      formData.append("Phone", "0");
      formData.append("Dob", new Date().toISOString());
      formData.append("Address", "string");
      formData.append("AvatarUrl", avatarUrl);
      formData.append("Status", "Active");
      formData.append("WalletId", null);
      formData.append("RoleId", 3);
      formData.append("CreateDate", new Date().toISOString());

      // Kiểm tra các trường đã được thêm vào FormData
      logFormData(formData);

      // Gửi dữ liệu tạo tài khoản mới dưới dạng form-data
      const createUserResponse = await apiUser.post("", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (createUserResponse.status === 201) {
        console.log("User created successfully.");
        // Lưu JWT token và thông tin người dùng vào cookie
        Cookies.set("userToken", response.credential, { expires: 1 }); // Lưu token trong 1 ngày
        Cookies.set("userData", JSON.stringify(decoded), { expires: 1 }); // Lưu dữ liệu người dùng trong 1 ngày
        navigate("/"); // Điều hướng sau khi tạo người dùng thành công
      } else {
        console.error("Error creating user:", createUserResponse.data);
        alert("Đã có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
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
