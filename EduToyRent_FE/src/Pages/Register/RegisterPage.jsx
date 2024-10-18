import LoginBG from "../../assets/bg.png";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const RegisterPage = () => {
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <img
        src={LoginBG}
        alt="Background"
        className="absolute inset-0 object-cover w-full h-full"
      />
      <div className="relative z-10 bg-gray-100 bg-opacity-80 flex flex-col items-center justify-center h-full w-full max-w-md p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-6">
          {/* <img className="w-[380px]" src={Logo2} alt="Logo" /> */}
        </div>
        <h1 className="text-2xl font-semibold mb-4">Đăng ký tài khoản</h1>
        {/* Username Input */}
        <div className="mb-4 w-full">
          <label htmlFor="firstname" className="block text-gray-600">
            Họ, tên đệm
          </label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
            // value={firstname}
            // onChange={(e) => handleInputChange(e, "firstname")}
          />
        </div>
        <div className="mb-4 w-full">
          <label htmlFor="lastname" className="block text-gray-600">
            Tên
          </label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
            // value={lastname}
            // onChange={(e) => handleInputChange(e, "lastname")}
          />
        </div>
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
            // value={phone}
            // onChange={(e) => handleInputChange(e, "phone")}
          />
        </div>
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
            // value={address}
            // onChange={(e) => handleInputChange(e, "address")}
          />
        </div>
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
            // value={dob}
            // onChange={(e) => handleInputChange(e, "dob")}
          />
        </div>
        <div className="mb-4 w-full">
          <label htmlFor="gender" className="block text-gray-600">
            Giới tính
          </label>
          <input
            type="text"
            id="gender"
            name="gender"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
            // value={gender}
            // onChange={(e) => handleInputChange(e, "gender")}
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
            // value={email}
            // onChange={(e) => handleInputChange(e, "email")}
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
            // value={password}
            // onChange={(e) => handleInputChange(e, "password")}
          />
        </div>
        {/* Confirm Password Input */}
        <div className="mb-6 w-full">
          <label htmlFor="confirmPassword" className="block text-gray-600">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
            // value={confirmPassword}
            // onChange={(e) => handleInputChange(e, "confirmPassword")}
          />
        </div>
        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        {/* Register Button */}
        <button
          //   onClick={handleRegister}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
        >
          Đăng ký
        </button>
        {/* Back to Login Link */}
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
        <div className="flex flex-1 justify-center items-end h-100 mt-4">
          <p className="text-center">
            Bản quyền &copy; 2024 EduToyRent Competition
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
