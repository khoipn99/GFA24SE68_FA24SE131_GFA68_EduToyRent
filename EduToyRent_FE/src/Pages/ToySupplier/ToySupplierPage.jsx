import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import thư viện Cookies
import HeaderForToySupplier from "../../Component/HeaderForToySupplier/HeaderForToySupplier";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";
import apiOrderDetail from "../../service/ApiOrderDetail";
import apiOrder from "../../service/ApiOrder";
import apiToys from "../../service/ApiToys";
import apiCategory from "../../service/ApiCategory";
import apiMedia from "../../service/ApiMedia";
import apiUser from "../../service/ApiUser";
const ToySupplierPage = () => {
  const [userData, setUserData] = useState("");
  const [selectedTab, setSelectedTab] = useState("info");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toys, setToys] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [toyId, setToyId] = useState(null); // Lưu URL ảnh để hiển thị
  const [toyData, setToyData] = useState(null);
  const [toysData, setToysData] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [selectedToy, setSelectedToy] = useState(null);
  useEffect(() => {
    const userDataCookie = Cookies.get("userDataReal");
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

          //  Lấy thông tin người dùng dựa trên email
          const userResponse = await apiUser.get(
            `/ByEmail?email=${encodeURIComponent(
              email
            )}&pageIndex=1&pageSize=5`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("Dữ liệu người dùng:", userResponse.data);

          if (userResponse.data && userResponse.data.length > 0) {
            const user = userResponse.data[0]; // Lấy đối tượng người dùng đầu tiên trong mảng
            setUserData(user);
            setUserId(user.id);
            setEditedData(user); // Cập nhật dữ liệu chỉnh sửa với thông tin của người dùng
            setImageUrl(user.avatarUrl); // Đặt URL ảnh nếu có
            // Lấy danh sách đồ chơi của người dùng
            const toyResponse = await apiToys.get(
              `/user/${user.id}?pageIndex=1&pageSize=20000`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log("Dữ liệu đồ chơi:", toyResponse.data);

            // Cập nhật dữ liệu đồ chơi (nếu cần thiết)
            setToysData(toyResponse.data);
          } else {
            console.error("Không tìm thấy thông tin người dùng.");
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu:", error);
        }
      };

      fetchUserData();
    } else {
      console.error("Không tìm thấy thông tin người dùng trong cookie.");
    }
  }, []);
  const handleUpdate = async () => {
    if (userId) {
      try {
        const formData = new FormData();

        // Thêm các trường dữ liệu vào formData
        formData.append("fullName", editedData.fullName || "Default Name");
        formData.append("email", editedData.email || "default@example.com");
        formData.append("password", editedData.password || "defaultPassword");
        formData.append(
          "createDate",
          editedData.createDate || new Date().toISOString()
        );
        formData.append("phone", editedData.phone || "0000000000");
        formData.append("dob", editedData.dob || new Date().toISOString());
        formData.append("address", editedData.address || "Default Address");
        formData.append("status", editedData.status || "Active");
        formData.append("roleId", editedData.role.id || "");
        formData.append("avatarUrl", editedData.avatarUrl || "");
        const response = await apiUser.put(`/${userId}`, formData, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Cập nhật thành công:", response.data);
        setUserData(response.data);
        setIsEditing(false);
        window.location.reload();
      } catch (error) {
        console.error("Lỗi khi cập nhật thông tin người dùng:", error);
        console.log("Chi tiết lỗi:", error.response?.data);
      }
    } else {
      console.error("Không tìm thấy ID người dùng.");
    }
  };
  const handleUpdatePassword = async () => {
    // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
    if (editedData.newPassword !== editedData.confirmPassword) {
      alert(
        "Mật khẩu mới và xác nhận mật khẩu không khớp. Vui lòng kiểm tra lại."
      );
      return;
    }
    try {
      // Bước 1: Lấy thông tin người dùng bao gồm mật khẩu cũ
      const userResponse = await apiUser.get(`/${userId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      // Kiểm tra mật khẩu cũ có khớp không
      if (userResponse.data.password !== editedData.currentPassword) {
        alert("Mật khẩu cũ không đúng. Vui lòng thử lại.");
        return;
      }
      // Kiểm tra độ mạnh của mật khẩu mới
      if (passwordStrength !== "Mạnh") {
        alert("Mật khẩu mới phải đủ mạnh. Vui lòng thử lại.");
        return;
      }

      // Tạo formData để gửi các dữ liệu cập nhật
      const formData = new FormData();
      formData.append("fullName", editedData.fullName || "Default Name");
      formData.append("email", editedData.email || "default@example.com");
      formData.append("password", editedData.newPassword || "defaultPassword");
      formData.append(
        "createDate",
        editedData.createDate || new Date().toISOString()
      );
      formData.append("phone", editedData.phone || "0000000000");
      formData.append("dob", editedData.dob || new Date().toISOString());
      formData.append("address", editedData.address || "Default Address");
      formData.append("status", editedData.status || "Active");
      formData.append("roleId", editedData.role.id || "");
      formData.append("avatarUrl", editedData.avatarUrl || "");

      // Bước 2: Gửi yêu cầu PUT để cập nhật thông tin người dùng
      const response = await apiUser.put(`/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Xử lý phản hồi thành công
      console.log("Cập nhật thành công:", response.data);
      setUserData(response.data);
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      // Xử lý lỗi khi gọi API
      console.error("Lỗi khi đổi mật khẩu:", error);
      alert("Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại.");
    }
  };
  // Hàm xử lý thay đổi tệp ảnh
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile)); // Hiển thị ảnh ngay lập tức

      // Gửi ảnh lên API ngay khi người dùng chọn ảnh
      if (userId) {
        const formData = new FormData();
        formData.append("userImage", selectedFile);

        try {
          const response = await apiUser.put(
            `/update-user-image/${userId}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );

          console.log("Cập nhật ảnh thành công:", response.data);
          setImageUrl(response.data.avatarUrl); // Cập nhật lại URL ảnh mới từ API
          window.location.reload();
        } catch (error) {
          console.error("Lỗi khi cập nhật ảnh:", error);
        }
      } else {
        console.error("Không có userId.");
      }
    }
  };
  // Hàm để gửi ảnh lên API

  const handleEditClick = () => {
    setEditedData(userData);
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(userData); // Đặt lại dữ liệu về ban đầu
  };

  const checkPasswordStrength = (password) => {
    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&]/.test(password)
    ) {
      setPasswordStrength("Mạnh");
    } else if (password.length >= 6) {
      setPasswordStrength("Trung bình");
    } else {
      setPasswordStrength("Yếu");
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "info":
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Hồ Sơ Của Tôi
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý thông tin hồ sơ để bảo mật tài khoản
            </p>

            <div className="flex mt-6">
              <div className="w-2/3 pr-6">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Xin chào {userData.fullName || userData.name}</p>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Email: {userData.email}</p>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Số điện thoại: {userData.phone}</p>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Ngày sinh: {userData.dob}</p>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Địa chỉ: {userData.address}</p>
                  </label>
                </div>

                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none"
                >
                  Chỉnh sửa
                </button>
              </div>
              {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">
                      Chỉnh sửa thông tin
                    </h2>

                    {/* Form chỉnh sửa */}
                    <div className="mb-4">
                      <label className="block text-gray-700">Họ và tên</label>
                      <input
                        type="text"
                        value={editedData.fullName || ""}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Email</label>
                      <input
                        type="email"
                        value={editedData.email || ""}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Số điện thoại
                      </label>
                      <input
                        type="number"
                        value={editedData.phone || ""}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Địa chỉ</label>
                      <input
                        type="text"
                        value={editedData.address || ""}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            address: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>

                    {/* Trường chọn ảnh
                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Ảnh đại diện
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            avatarUrl: e.target.files[0], // Lưu file đã chọn vào state
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div> */}

                    {/* Nút lưu và hủy */}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="w-1/3 flex flex-col items-center mr-52">
                <div className="w-36 h-36 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 text-2xl font-semibold">
                  {/* Hiển thị ảnh nếu có */}
                  {imageUrl ? (
                    <img
                      src={imageUrl} // Hiển thị ảnh từ URL tạm thời
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : file ? (
                    <img
                      src={URL.createObjectURL(file)} // Hiển thị ảnh từ file được chọn tạm thời
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : userData && userData.avatarUrl ? (
                    <img
                      src={userData.avatarUrl} // Hiển thị ảnh từ URL trong userData
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : userData && userData.fullName ? (
                    userData.fullName.charAt(0) // Hiển thị chữ cái đầu tiên từ fullName nếu không có ảnh
                  ) : (
                    ""
                  )}
                </div>

                {/* Input ẩn để chọn ảnh */}
                <input
                  type="file"
                  accept=".jpeg, .png"
                  onChange={handleFileChange} // Gọi hàm xử lý khi người dùng chọn file
                  className="hidden"
                  id="fileInput"
                />

                <button
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                  onClick={() => document.getElementById("fileInput").click()} // Mở input file khi click nút này
                >
                  Chọn Ảnh
                </button>

                <p className="text-sm text-gray-500 mt-2 text-center">
                  Dung lượng file tối đa 1 MB
                  <br />
                  Định dạng: .JPEG, .PNG
                </p>
              </div>
            </div>
          </div>
        );
      case "password":
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Đổi Mật Khẩu
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Thay đổi mật khẩu để bảo mật tài khoản của bạn
            </p>

            <div className="flex mt-6">
              <div className="w-2/3 pr-6">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Xin chào {userData.fullName || userData.name}</p>
                  </label>
                </div>

                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none"
                >
                  Đổi mật khẩu
                </button>
              </div>
              {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>

                    {/* Form đổi mật khẩu */}
                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                        {/* Input mật khẩu */}
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={editedData.currentPassword || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded pr-10" // padding-left để tạo không gian cho icon bên trái
                        />
                        {/* Biểu tượng con mắt */}
                        <button
                          type="button"
                          onClick={() => toggleShowPassword("current")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.current ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        {/* Input mật khẩu */}
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={editedData.newPassword || ""}
                          onChange={(e) => {
                            setEditedData({
                              ...editedData,
                              newPassword: e.target.value,
                            });
                            checkPasswordStrength(e.target.value);
                          }}
                          className="w-full p-2 border border-gray-300 rounded pr-10" // padding-left để tạo không gian cho icon bên trái
                        />
                        {/* Biểu tượng con mắt */}
                        <button
                          type="button"
                          onClick={() => toggleShowPassword("new")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.new ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Mật khẩu nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
                        thường, số và ký tự đặc biệt như @, $, hoặc !
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        {/* Input mật khẩu */}
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={editedData.confirmPassword || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded pr-10" // padding-left để tạo không gian cho icon bên trái
                        />
                        {/* Biểu tượng con mắt */}
                        <button
                          type="button"
                          onClick={() => toggleShowPassword("confirm")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.confirm ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdatePassword}
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              )}
              ;
            </div>
          </div>
        );
      case "orders":
        return (
          <div>
            <h3 className="text-lg font-semibold">Danh sách sản phẩm</h3>
          </div>
        );
      case "products":
        return (
          <div>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
              <div className="w-full mb-1">
                <div className="items-center justify-between block sm:flex md:divide-x md:divide-gray-100 dark:divide-gray-700">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <form className="sm:pr-3" action="#" method="GET">
                      <label htmlFor="products-search" className="sr-only">
                        Search
                      </label>
                      <div className="relative w-48 mt-1 sm:w-64 xl:w-96">
                        <input
                          type="text"
                          name="email"
                          id="products-search"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Search for products"
                        />
                      </div>
                    </form>
                  </div>
                  <div className="flex items-center mt-4 sm:mt-0 sm:ml-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-700"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Thêm sản phẩm
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="p-4">
                            <div className="flex items-center">
                              <input
                                id="checkbox-all"
                                aria-describedby="checkbox-1"
                                type="checkbox"
                                className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <label htmlFor="checkbox-all" className="sr-only">
                                checkbox
                              </label>
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Toy Name
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Price
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Origin
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Age
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Brand
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            CreateDate
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            RentTime
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Status
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {toysData &&
                        Array.isArray(toysData) &&
                        toysData.length > 0 ? (
                          toysData.map((toy) => (
                            <tr
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              key={toy.id}
                              onClick={() => setSelectedToy(toy)} // Cập nhật selectedToy khi bấm vào dòng
                            >
                              <td className="w-4 p-4">
                                <div className="flex items-center">
                                  <input
                                    id={`checkbox-${toy.id}`}
                                    aria-describedby="checkbox-1"
                                    type="checkbox"
                                    className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <label
                                    htmlFor={`checkbox-${toy.id}`}
                                    className="sr-only"
                                  >
                                    checkbox
                                  </label>
                                </div>
                              </td>
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                  {toy.name}
                                </div>
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.price}
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.origin}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.age}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.brand}
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {new Date(toy.createDate).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.rentTime}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.status}
                              </td>

                              <td className="p-4 space-x-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  // onClick={() => handleUpdate(toy)} // Gọi hàm update khi nhấn nút
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  // onClick={() => handleDelete(toy.id)} // Gọi hàm delete khi nhấn nút
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="13" className="p-4 text-center">
                              No toys found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center mb-4 sm:mb-0"></div>
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-red-500 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  <svg
                    className="w-5 h-5 mr-1 -ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Previous
                </button>
                <button className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-red-500 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  Next
                  <svg
                    className="w-5 h-5 ml-1 -mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            {selectedToy && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                  <h2 className="text-xl font-bold mb-4">Toy Details</h2>
                  <div>
                    <p>
                      <strong>Name:</strong> {selectedToy.name}
                    </p>
                    <p>
                      <strong>Price:</strong> {selectedToy.price}
                    </p>
                    <p>
                      <strong>Origin:</strong> {selectedToy.origin}
                    </p>
                    <p>
                      <strong>Age:</strong> {selectedToy.age}
                    </p>
                    <p>
                      <strong>Brand:</strong> {selectedToy.brand}
                    </p>
                    <p>
                      <strong>Create Date:</strong>{" "}
                      {new Date(selectedToy.createDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Rent Time:</strong> {selectedToy.rentTime}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedToy.status}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedToy(null)} // Đóng card khi bấm nút
                    className="mt-4 bg-red-500 text-white p-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case "dashboard":
        return (
          <div>
            <h3 className="text-lg font-semibold">Doanh Thu</h3>
            <p>Thông tin thống kê sẽ được hiển thị ở đây.</p>
          </div>
        );
      case "Edit":
        return <div>hi</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <HeaderForToySupplier />
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-1/5 bg-white p-6 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <button
              onClick={() => setSelectedTab("info")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "info" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">👤</span> Thông tin cửa hàng
            </button>
            <button
              onClick={() => setSelectedTab("password")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "password" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🔒</span> Đổi mật khẩu
            </button>
            <button
              onClick={() => setSelectedTab("products")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "products" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">📦</span> Danh sách sản phẩm
              đang bán
            </button>

            <button
              onClick={() => setSelectedTab("order")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "order" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">👥</span> Danh sách đơn hàng
            </button>

            <button
              onClick={() => setSelectedTab("Edit")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "Edit" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🏢</span> Chỉnh sửa cửa hàng
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow w-4/5 bg-gray-50 p-6">
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <div className=" p-4 border-l">{renderContent()}</div>
          </div>
        </main>
      </div>
      <footer className="bg-white shadow-md p-4">
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default ToySupplierPage;
