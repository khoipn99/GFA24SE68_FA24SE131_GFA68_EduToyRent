import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginBG from "../../assets/bg.png";
import apiUser from "../../service/ApiUser";
import Cookies from "js-cookie";
import apiLogin from "../../service/ApiLogin";
import apiWallets from "../../service/ApiWallets";
import { jwtDecode } from "jwt-decode";
const RegisterPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    letter: false,
    number: false,
    specialChar: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const navigate = useNavigate();

  // Function to check password rules
  const validatePassword = (password) => {
    const lengthValid = password.length >= 8;
    const letterValid = /[a-zA-Z]/.test(password);
    const numberValid = /\d/.test(password);
    const specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordValidations({
      length: lengthValid,
      letter: letterValid,
      number: numberValid,
      specialChar: specialCharValid,
    });
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    setPasswordsMatch(newPassword === confirmPassword);
  };

  // Handle confirm password input change
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordsMatch(password === newConfirmPassword);
  };
  const handleRegister = async () => {
    const createDate = new Date().toISOString(); // ISO format cho chuẩn API
    console.log("Create Date:", createDate);

    const fullName = document.getElementById("name").value || "string";
    const email = document.getElementById("email").value || "string";
    const phone = document.getElementById("phone").value || "string";
    const passwordInput = password || "";

    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log("Password:", passwordInput);

    if (!fullName || !email || !phone || !passwordInput) {
      alert("Vui lòng nhập đầy đủ tất cả các trường!");
      console.log("Validation failed: Missing required fields");
      return;
    }

    if (
      !passwordsMatch ||
      !passwordValidations.length ||
      !passwordValidations.letter ||
      !passwordValidations.number ||
      !passwordValidations.specialChar
    ) {
      alert(
        "Vui lòng kiểm tra lại mật khẩu và các yêu cầu về độ mạnh mật khẩu!"
      );
      console.log("Password validation failed:", passwordValidations);
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", passwordInput);
    formData.append("phone", phone);
    formData.append("dob", "2024-01-01T00:00:00Z");
    formData.append("address", "string");
    formData.append("avatarUrl", null);
    formData.append("status", "Active");
    formData.append("walletId", null);
    formData.append("roleid", 3);
    formData.append("createDate", createDate);

    const formDataObj = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    console.log("Form Data:", formDataObj);

    try {
      // Bước 1: Đăng ký người dùng
      const response = await apiUser.post("", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      if (response.status === 201) {
        alert("Đăng ký thành công!");

        // Bước 2: Gọi API login để lấy token
        const loginResponse = await apiLogin.post("", {
          email: email,
          password: passwordInput,
        });

        if (loginResponse.data && loginResponse.data.token) {
          const token = loginResponse.data.token;
          // Lưu token vào cookie
          Cookies.set("userToken", token, { expires: 7, path: "/" });
          console.log("Token saved in cookie:", Cookies.get("userToken"));

          // Sau khi đăng nhập thành công, gọi API tạo ví (ví dụ: api tạo ví)
          const tokenFromCookie = Cookies.get("userToken");

          if (tokenFromCookie) {
            const decodedToken = jwtDecode(tokenFromCookie); // Giải mã token JWT
            const userId = decodedToken.userId;

            const walletData = {
              balance: 0,
              withdrawMethod: "string",
              withdrawInfo: "string",
              status: "Active",
              userId: userId,
            };

            try {
              const walletResponse = await apiWallets.post("", walletData, {
                headers: {
                  Authorization: `Bearer ${tokenFromCookie}`,
                },
              });

              if (walletResponse.status === 201) {
                console.log("Tạo ví thành công:", walletResponse.data);
              } else {
                console.error("Lỗi khi tạo ví:", walletResponse.data);
              }
            } catch (walletError) {
              console.error("Lỗi khi gọi API tạo ví:", walletError);
            }
          }
          // Xóa cookie chứa token trước khi chuyển trang
          Cookies.remove("userToken");
          // Chuyển hướng tới trang đăng nhập hoặc trang chính sau khi đăng ký và đăng nhập thành công
          navigate("/login");
        } else {
          console.error("Lỗi: Không nhận được token từ API login");
          alert(
            "Đăng ký thành công nhưng không thể đăng nhập. Vui lòng thử lại."
          );
        }
      } else {
        console.error("Error:", response.data);
        alert(`Đăng ký thất bại: ${response.data.message || "Có lỗi xảy ra"}`);
      }
    } catch (error) {
      console.error("Lỗi hệ thống:", error);
      alert("Không thể kết nối đến server. Vui lòng thử lại sau!");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Background */}
      <img
        src={LoginBG}
        alt="Background"
        className="absolute inset-0 object-cover w-full h-full"
      />
      {/* Form Container */}
      <div className="relative z-10 bg-gray-100 bg-opacity-90 flex flex-col items-center justify-center h-full w-full max-w-md p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-blue-600">
          Đăng ký tài khoản
        </h1>

        {/* Full Name Input */}
        <div className="mb-4 w-full">
          <label htmlFor="name" className="block text-gray-600">
            Họ và tên
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
            placeholder="Nhập họ và tên"
          />
        </div>

        {/* Phone Input */}
        <div className="mb-4 w-full">
          <label htmlFor="phone" className="block text-gray-600">
            Số điện thoại
          </label>
          <input
            type="number"
            id="phone"
            name="phone"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
            placeholder="Nhập số điện thoại"
          />
        </div>

        {/* Email Input */}
        <div className="mb-4 w-full">
          <label htmlFor="email" className="block text-gray-600">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
            placeholder="Nhập email"
          />
        </div>

        {/* Address Input */}
        <div className="mb-4 w-full">
          <label htmlFor="address" className="block text-gray-600">
            Địa chỉ
          </label>
          <input
            type="text"
            id="address"
            name="address"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
            placeholder="Nhập địa chỉ (không bắt buộc)"
          />
        </div>

        {/* Date of Birth Input */}
        <div className="mb-4 w-full">
          <label htmlFor="dob" className="block text-gray-600">
            Ngày sinh
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
          />
        </div>

        {/* Password Input */}
        <div className="mb-4 w-full">
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
            onChange={handlePasswordChange}
          />
          <ul className="text-sm">
            <li
              className={
                passwordValidations.length ? "text-green-500" : "text-red-500"
              }
            >
              {passwordValidations.length ? "✔" : "✖"} Có ít nhất 8 kí tự
            </li>
            <li
              className={
                passwordValidations.letter ? "text-green-500" : "text-red-500"
              }
            >
              {passwordValidations.letter ? "✔" : "✖"} Có ít nhất 1 ký tự chữ
            </li>
            <li
              className={
                passwordValidations.number ? "text-green-500" : "text-red-500"
              }
            >
              {passwordValidations.number ? "✔" : "✖"} Có ít nhất 1 chữ số
            </li>
            <li
              className={
                passwordValidations.specialChar
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {passwordValidations.specialChar ? "✔" : "✖"} Có ít nhất 1 kí tự
              đặc biệt
            </li>
          </ul>
        </div>

        {/* Confirm Password Input */}
        <div className="mb-4 w-full">
          <label htmlFor="confirmPassword" className="block text-gray-600">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          {!passwordsMatch && (
            <p className="text-red-500 text-sm mt-1">Mật khẩu không khớp!</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
          onClick={handleRegister}
        >
          Đăng ký
        </button>

        {/* Login Link */}
        <div className="flex justify-center items-center mt-4">
          <p className="text-gray-600">
            Đã có tài khoản?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Đăng nhập tại đây
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-1 justify-center items-end h-100 mt-4">
          <p className="text-center text-gray-500">
            Bản quyền &copy; 2024 EduToyRent Competition
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
