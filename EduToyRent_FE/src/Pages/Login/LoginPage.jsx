import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import LoginBG from "../../assets/bg.png";
import apiLogin from "../../service/ApiLogin";
import apiUser from "../../service/ApiUser";
import apiWallets from "../../service/ApiWallets";
import apiCart from "../../service/ApiCart";
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
            navigate("/admin");
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
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      } else if (error.request) {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      } else {
        setError("Đã xảy ra lỗi trong quá trình đăng nhập.");
      }
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
        `/ByEmail?email=${userEmail}&pageIndex=1&pageSize=5000`
      );

      if (checkUserResponse.data != "") {
        // Người dùng đã tồn tại, tiến hành đăng nhập
        console.log("dữ liệu đã trả về:", checkUserResponse.data);
        const loginResponse = await apiLogin.post("", {
          email: userEmail,
          password: "1", // Mật khẩu mặc định là 1 khi đăng nhập qua Google
        });

        if (loginResponse.status === 200) {
          // Lưu token và thông tin người dùng vào cookie
          Cookies.set("userToken", loginResponse.data.token, { expires: 1 }); // Lưu token trong 1 ngày
          Cookies.set("userData", JSON.stringify(loginResponse.data), {
            expires: 1,
          }); // Lưu dữ liệu người dùng trong 1 ngày
          console.log("Login successful:", loginResponse.data);

          const response = await apiUser.get(`/${loginResponse.data.userId}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          });

          console.log("Dữ liệu trả về:", response.data);

          Cookies.set("userDataReal", JSON.stringify(response.data), {
            expires: 7,
          });

          // Tạo ví cho người dùng nếu chưa có ví

          const checkWalletResponse = await apiUser.get(
            `${loginResponse.data.userId}`,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );
          console.log("Wallet check.", checkWalletResponse.data);

          // Kiểm tra nếu `walletId` là null
          if (!checkWalletResponse.data.walletId) {
            console.log("WalletId is null. Tạo với id người dùng.");
            const walletData = {
              balance: 0,
              withdrawMethod: "string",
              withdrawInfo: "string",
              status: "Active",
              userId: loginResponse.data.userId, // Gắn userId vào đây
            };

            const walletResponse = await apiWallets.post("", walletData, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            });

            if (walletResponse.status === 201) {
              console.log("Wallet created successfully.", walletResponse.data);
              const dataU = checkUserResponse.data[0];
              console.log("data USer ví", dataU);
              const dataWallet = {
                fullName: loginResponse.data.fullName,
                email: loginResponse.data.email,
                password: dataU.password,
                createDate: dataU.createDate,
                phone: dataU.phone,
                dob: dataU.dob,
                address: dataU.address,
                roleId: 3,
                status: dataU.status,
                walletId: walletResponse.data.id, // Thêm walletId vào request
              };
              console.log("dữ liệu tạo ví", dataWallet);
              console.log("ID người dùng", loginResponse.data.userId);
              // Cập nhật ID ví vào thông tin người dùng
              const updateUserResponse = await apiUser.put(
                `/${loginResponse.data.userId}`,
                dataWallet,
                {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("userToken")}`,
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              if (updateUserResponse.status === 204) {
                console.log("User's wallet updated successfully.");
              } else {
                console.error(
                  "Error updating user's wallet:",
                  updateUserResponse.data
                );
              }
            } else {
              console.error("Error creating wallet:", walletResponse.data);
            }
          } else {
            // Ví đã tồn tại
            console.log(
              "Wallet already exists with ID:",
              checkWalletResponse.data.walletId
            );
          }

          const checkCartResponse = await apiCart.get(
            `?pageIndex=1&pageSize=50000`,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );
          console.log("cehck cart:", checkCartResponse.data);

          const currentUserId = loginResponse.data.userId; // userId hiện tại từ phản hồi đăng nhập
          console.log("dữ liệu userid check", currentUserId);
          const userHasCart = checkCartResponse.data.some(
            (cart) => cart.userId === currentUserId
          );
          console.log("userid đã check:", userHasCart);
          // Tạo giỏ hàng mới cho người dùng nếu chưa có
          if (userHasCart) {
            console.log(`UserId ${currentUserId} đã có giỏ hàng.`);
          } else {
            const cartData = {
              userId: loginResponse.data.userId,
              items: [], // Giỏ hàng ban đầu rỗng
              status: "Active",
              totalPrice: 0,
            };

            const cartResponse = await apiCart.post("", cartData, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            });

            if (cartResponse.status === 201) {
              console.log("Cart created successfully.");
            } else {
              console.error("Error creating cart:", cartResponse.data);
            }
          }

          navigate("/"); // Điều hướng sau khi đăng nhập thành công
        } else {
          console.error("Error during login:", loginResponse.data);
          alert("Đã có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.");
        }
      } else {
        // Người dùng chưa có tài khoản, tạo tài khoản mới
        const formData = new FormData();
        formData.append("FullName", fullName);
        formData.append("Email", userEmail);
        formData.append("Password", "1"); // Mật khẩu mặc định là 1
        formData.append("Phone", "0");
        formData.append("Dob", new Date().toISOString());
        formData.append("Address", "string");
        formData.append("AvatarUrl", avatarUrl);
        formData.append("Status", "Active");
        formData.append("WalletId", "");
        formData.append("RoleId", 3);
        formData.append("CreateDate", new Date().toISOString());

        // Gửi dữ liệu tạo tài khoản mới dưới dạng form-data
        const createUserResponse = await apiUser.post("", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (createUserResponse.status === 201) {
          console.log("User created successfully.", createUserResponse.data);

          const loginResponse = await apiLogin.post("", {
            email: userEmail,
            password: "1", // Mật khẩu mặc định là 1 khi đăng nhập qua Google
          });

          if (loginResponse.status === 200) {
            console.log("Login successful.");
            // Lưu token và thông tin người dùng vào cookie
            Cookies.set("userToken", loginResponse.data.token, { expires: 1 }); // Lưu token trong 1 ngày
            Cookies.set("userData", JSON.stringify(loginResponse.data), {
              expires: 1,
            }); // Lưu dữ liệu người dùng trong 1 ngày

            // Cookies.set("userDataReal", JSON.stringify(loginResponse.data), {
            //   expires: 7,
            // });
            console.log("Login successful:", loginResponse.data);

            const walletData = {
              balance: 0,
              withdrawMethod: "string",
              withdrawInfo: "string",
              status: "Active",
              userId: loginResponse.data.userId, // Gắn userId vào đây
            };
            const walletResponse = await apiWallets.post("", walletData, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            });

            if (walletResponse.status === 201) {
              // Cập nhật ID ví vào thông tin người dùng
              console.log("Wallet created successfully.", walletResponse.data);
              const dataUT = createUserResponse.data;
              console.log("data USer ví", dataUT);
              const dataWallet = {
                fullName: loginResponse.data.fullName,
                email: loginResponse.data.email,
                password: dataUT.password,
                createDate: dataUT.createDate,
                phone: dataUT.phone,
                dob: dataUT.dob,
                address: dataUT.address,
                roleId: 3,
                status: dataUT.status,
                walletId: walletResponse.data.id, // Thêm walletId vào request
              };

              const updateUserResponse = await apiUser.put(
                `/${loginResponse.data.userId}`,
                dataWallet,
                {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("userToken")}`,
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              if (updateUserResponse.status === 204) {
                console.log("User's wallet updated successfully.");
              } else {
                console.error(
                  "Error updating user's wallet:",
                  updateUserResponse.data
                );
              }
            }
            const response = await apiUser.get(
              `/${loginResponse.data.userId}`,
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

            const cartData = {
              userId: loginResponse.data.userId,
              items: [], // Giỏ hàng ban đầu rỗng
              status: "Active",
              totalPrice: 0,
            };
            const cartResponse = await apiCart.post("", cartData, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            });

            if (cartResponse.status === 201) {
              console.log("Cart created successfully.");
            } else {
              console.error("Error creating cart:", cartResponse.data);
            }
          } else {
            console.error("Error creating user:", createUserResponse.data);
            alert("Đã có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.");
          }

          navigate("/"); // Điều hướng sau khi tạo người dùng và ví thành công
        }
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
                placeholder="Nhập email"
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
                placeholder="Nhập mật khẩu"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4 w-full">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full mt-2 h-[50px"
              >
                Đăng Nhập
              </button>
            </div>
          </form>
          <div className="mb-4 w-full m-w-[100%]">
            <GoogleOAuthProvider clientId="695962570544-hia41gl00ujfg9hkc703jse7t3q9kpco.apps.googleusercontent.com">
              {/* Nút Google Login */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  text="signin_with"
                  theme="outline" // Tùy chỉnh giao diện
                  style={{
                    width: "100%", // Đặt nút dài bằng toàn bộ khung cha
                    maxWidth: "500px", // Chiều dài tối đa
                    height: "50px", // Đặt chiều cao nếu muốn nút lớn hơn
                  }}
                />
              </div>
            </GoogleOAuthProvider>
          </div>
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
