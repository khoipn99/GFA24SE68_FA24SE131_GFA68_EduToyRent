import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginBG from "../../assets/bg.png";
import apiUser from "../../service/ApiUser";
import Cookies from "js-cookie";
import apiLogin from "../../service/ApiLogin";
import apiWallets from "../../service/ApiWallets";
import apiCart from "../../service/ApiCart";
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
  const [showTooltip, setShowTooltip] = useState(false);
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
    // Lấy ngày tạo từ client
    const createDate = new Date().toISOString();
    const fullName = document.getElementById("name").value || "string";
    const email = document.getElementById("email").value || "string";
    const phone = document.getElementById("phone").value || "string";
    const passwordInput = password || "";
    const dobInput = document.getElementById("dob").value; // Lấy ngày sinh từ input
    const withdrawalMethod = document.getElementById("withdrawalMethod").value;
    const withdrawInfo = document.getElementById("withdrawInfo").value;
    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log("Password:", passwordInput);
    console.log("Date of Birth (dob):", dobInput);

    // Kiểm tra các trường nhập vào
    if (!fullName || !email || !phone || !passwordInput || !dobInput) {
      alert("Vui lòng nhập đầy đủ tất cả các trường!");
      return;
    }

    // Kiểm tra email phải có đuôi @gmail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      alert("Email phải có đuôi @gmail.com");
      return;
    }

    // Kiểm tra số điện thoại phải là 10 số và bắt đầu bằng số 0
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại phải là 10 số và bắt đầu bằng số 0");
      return;
    }

    // Kiểm tra ngày sinh phải lớn hơn 15 tuổi
    const dob = new Date(dobInput);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const isOver15Years =
      age > 15 ||
      (age === 15 &&
        today >= new Date(dob.setFullYear(dob.getFullYear() + 15)));
    if (!isOver15Years) {
      alert("Người dùng phải lớn hơn 15 tuổi.");
      return;
    }

    // Kiểm tra độ mạnh mật khẩu
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
      return;
    }

    // Tiếp tục xử lý sau khi kiểm tra thành công
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", passwordInput);
    formData.append("phone", phone);
    formData.append("dob", dobInput);
    formData.append("address", "string");
    formData.append("avatarUrl", null);
    formData.append("status", "Active");
    formData.append("walletId", "");
    formData.append("roleId", 3);
    formData.append("createDate", createDate);

    console.log("Form Data trước khi gửi:", Object.fromEntries(formData));

    // Kiểm tra dữ liệu đã chuẩn bị
    const formDataObj = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    console.log("Form Data trước khi gửi:", formDataObj);

    try {
      // Gửi yêu cầu đăng ký
      const response = await apiUser.post("", formData, {
        headers: {
          // Authorization: `Bearer ${Cookies.get("userToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      const dataOld = response.data;
      console.log("Wallet Id old:", dataOld);
      // Kiểm tra trạng thái thành công
      if (response.status === 201) {
        alert("Đăng ký thành công!");

        // Đăng nhập và lấy token
        const loginResponse = await apiLogin.post("", {
          email: email,
          password: passwordInput,
        });

        // Kiểm tra nếu login thành công và nhận token
        if (loginResponse.data && loginResponse.data.token) {
          const token = loginResponse.data.token;
          Cookies.set("userToken", token, { expires: 7, path: "/" });
          console.log("Token đã lưu:", Cookies.get("userToken"));

          // Tạo ví người dùng
          const tokenFromCookie = Cookies.get("userToken");
          if (tokenFromCookie) {
            const decodedToken = jwtDecode(tokenFromCookie);
            console.log("Decoded Token:", decodedToken);
            const userId =
              decodedToken[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ];
            console.log("UserId:", userId); // Kết quả: "32"
            const walletData = {
              balance: 0,
              withdrawMethod: withdrawalMethod,
              withdrawInfo: withdrawInfo,
              status: "Active",
              userId: userId, // Gắn userId vào đây
            };

            console.log("Wallet Data:", walletData);

            try {
              // Tạo ví cho người dùng
              const walletResponse = await apiWallets.post("", walletData, {
                headers: {
                  Authorization: `Bearer ${tokenFromCookie}`,
                },
              });

              if (walletResponse.status === 201) {
                console.log("Tạo ví thành công:", walletResponse.data);
                const walletId = walletResponse.data.id; // Giả sử id là walletId
                console.log("Wallet Id:", walletId);
                console.log("Wallet Id old2:", dataOld);
                // Cập nhật walletId vào người dùng
                const dateSend = {
                  fullName: dataOld.fullName,
                  email: dataOld.email,
                  password: dataOld.password,
                  createDate: dataOld.createDate,
                  phone: dataOld.phone,
                  dob: dataOld.dob,
                  address: dataOld.address,
                  roleId: 3,
                  status: dataOld.status,
                  walletId: walletId, // Thêm walletId vào request
                };
                console.log("Data send:", dateSend);
                const formData = new FormData();
                Object.entries(dateSend).forEach(([key, value]) => {
                  formData.append(key, value);
                });
                const updateUserResponse = await apiUser.put(
                  `/${userId}`,
                  formData,
                  {
                    headers: {
                      Authorization: `Bearer ${tokenFromCookie}`,
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );

                if (updateUserResponse.status === 204) {
                  console.log(
                    "Cập nhật người dùng thành công:",
                    updateUserResponse.data
                  );
                  const dataCart = {
                    userId: userId,
                    status: "Active",
                    totalPrice: 0,
                  };
                  console.log("Data Cart trước khi gửi:", dataCart);

                  const createCartResponse = await apiCart.post("", dataCart, {
                    Authorization: `Bearer ${tokenFromCookie}`,
                    "Content-Type": "application/json",
                  });

                  if (createCartResponse.status === 201) {
                    console.log("Cart Response đã tạo :", createCartResponse);
                  } else {
                    console.error(
                      "Lỗi khi tạo giỏ hàng:",
                      createCartResponse.data
                    );
                  }
                } else {
                  console.error(
                    "Lỗi khi cập nhật người dùng:",
                    updateUserResponse.data
                  );
                }
              } else {
                console.error("Lỗi khi tạo ví:", walletResponse.data);
              }
            } catch (walletError) {
              console.error("Lỗi khi gọi API tạo ví:", walletError);
            }
          }

          // Sau khi thành công, xóa token và chuyển hướng
          Cookies.remove("userToken");
          navigate("/login");
        } else {
          console.error("Lỗi: Không nhận được token từ API login");
          alert(
            "Đăng ký thành công nhưng không thể đăng nhập. Vui lòng thử lại."
          );
        }
      } else {
        console.error("Lỗi khi đăng ký:", response.data);
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
      <div className="relative z-10 bg-gray-100 bg-opacity-90 flex flex-col items-center justify-center h-full w-full max-w-lg p-4 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold  text-blue-600">
          Đăng ký tài khoản
        </h1>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Full Name Input */}
          <div className=" col-span-2">
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
          {/* Email Input */}
          <div className="col-span-2">
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
          <div className="col-span-2">
            <label htmlFor="address" className="block text-gray-600">
              Địa chỉ
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
              placeholder="Nhập địa chỉ"
            />
          </div>
          {/* Phone Input */}
          <div className="">
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

          {/* Date of Birth Input */}
          <div className="">
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
          {/* Bank Name */}
          <div className="">
            <label htmlFor="withdrawalMethod" className="block text-gray-600">
              Tên ngân hàng
            </label>
            <input
              type="text"
              id="withdrawalMethod"
              name="withdrawalMethod"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
              placeholder="Nhập tên ngân hàng"
            />
          </div>
          {/* Bank Account */}
          <div className="">
            <label htmlFor="withdrawInfo" className="block text-gray-600">
              Số tài khoản ngân hàng
            </label>
            <input
              type="number"
              id="withdrawInfo"
              name="withdrawInfo"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
              placeholder="Nhập số tài khoản ngân hàng"
            />
          </div>
          {/* Password Input */}
          <div className="col-span-2 relative">
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
              onFocus={() => setShowTooltip(true)} // Hiển thị tooltip khi người dùng nhấp vào
              onBlur={() => setShowTooltip(false)} // Ẩn tooltip khi người dùng rời khỏi trường nhập
            />
            {showTooltip && (
              <div className="absolute top-0 left-full ml-2 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-64 z-10">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Mật khẩu của bạn cần:
                </p>
                <ul className="text-sm">
                  <li
                    className={
                      passwordValidations.length
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {passwordValidations.length ? "✔" : "✖"} Có ít nhất 8 kí tự
                  </li>
                  <li
                    className={
                      passwordValidations.letter
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {passwordValidations.letter ? "✔" : "✖"} Có ít nhất 1 ký tự
                    chữ
                  </li>
                  <li
                    className={
                      passwordValidations.number
                        ? "text-green-500"
                        : "text-red-500"
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
                    {passwordValidations.specialChar ? "✔" : "✖"} Có ít nhất 1
                    kí tự đặc biệt
                  </li>
                </ul>
              </div>
            )}
          </div>
          {/* Confirm Password */}
          <div className="col-span-2">
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
        </div>

        {/* Submit Button */}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full mt-4"
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
        <div className="flex justify-center items-end h-full mt-4">
          <p className="text-center text-gray-500">
            Bản quyền &copy; 2024 EduToyRent Competition
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
