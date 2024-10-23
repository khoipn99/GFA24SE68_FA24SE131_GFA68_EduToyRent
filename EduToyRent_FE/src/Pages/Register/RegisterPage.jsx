import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginBG from "../../assets/bg.png";

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

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <img
        src={LoginBG}
        alt="Background"
        className="absolute inset-0 object-cover w-full h-full"
      />
      <div className="relative z-10 bg-gray-100 bg-opacity-80 flex flex-col items-center justify-center h-full w-full max-w-md p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-4">Đăng ký tài khoản</h1>

        <div className="mb-4 w-full">
          <label htmlFor="lastname" className="block text-gray-600">
            Tên
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autoComplete="off"
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
          />
        </div>
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
          {/* Password Validation */}
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
              (a-z hoặc A-Z)
            </li>
            <li
              className={
                passwordValidations.number ? "text-green-500" : "text-red-500"
              }
            >
              {passwordValidations.number ? "✔" : "✖"} Có ít nhất 1 chữ số (0-9)
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
            <p className="text-red-500">Mật khẩu không khớp!</p>
          )}
        </div>

        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full">
          Đăng ký
        </button>

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
