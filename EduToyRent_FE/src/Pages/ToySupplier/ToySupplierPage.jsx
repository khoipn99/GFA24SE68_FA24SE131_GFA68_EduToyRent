import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import thư viện Cookies
import axios from "axios";
import HeaderForToySupplier from "../../Component/HeaderForToySupplier/HeaderForToySupplier";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { data } from "autoprefixer";

const ToySupplierPage = () => {
  const [userData, setUserData] = useState("");
  const [selectedTab, setSelectedTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toys, setToys] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [toyId, setToyId] = useState(null); // Lưu URL ảnh để hiển thị
  const [toyData, setToyData] = useState(null);
  useEffect(() => {
    const userDataCookie = Cookies.get("userData");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);
      setUserData(parsedUserData);
      const email = parsedUserData.email;

      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Token không hợp lệ hoặc hết hạn.");
            return;
          }

          const response = await axios.get(
            `https://localhost:44350/api/v1/Users/ByEmail?email=${encodeURIComponent(
              email
            )}&pageIndex=1&pageSize=5`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("Dữ liệu trả về:", response.data);

          if (response.data && response.data.length > 0) {
            const user = response.data[0]; // Lấy đối tượng người dùng đầu tiên trong mảng
            setUserData(user);
            setUserId(user.id);
            setEditedData(user); // Cập nhật dữ liệu chỉnh sửa với thông tin của người dùng
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
    }
  }, []);

  const handleUpdate = async () => {
    // Kiểm tra nếu có userId để gửi yêu cầu PUT
    if (userId) {
      try {
        // Tạo payload với các trường thông tin cần thiết
        const payload = {
          fullName: editedData.fullName || "",
          email: editedData.email || "",
          password: editedData.password || "",
          createDate: editedData.createDate || new Date().toISOString(),
          phone: editedData.phone || "",
          dob: editedData.dob || "",
          address: editedData.address || "",
          avatarUrl: editedData.avatarUrl || "", // Giữ nguyên avatar cũ nếu không thay đổi ảnh
          status: editedData.status || "", // Thêm giá trị hợp lệ cho trường status
        };

        // Gửi yêu cầu PUT với dữ liệu đã chuẩn bị dưới dạng JSON
        const response = await axios.put(
          `https://localhost:44350/api/v1/Users/${userId}`, // Sử dụng userId đã có
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Lấy token từ localStorage
              "Content-Type": "application/json", // Đảm bảo gửi dữ liệu dạng JSON
            },
          }
        );

        // Cập nhật dữ liệu người dùng trong state sau khi thành công
        console.log("Cập nhật thành công:", response.data);
        setUserData(response.data); // Cập nhật dữ liệu người dùng trong state
        setIsEditing(false); // Tắt chế độ chỉnh sửa
        window.location.reload();
      } catch (error) {
        // Xử lý lỗi khi có vấn đề xảy ra
        console.error("Lỗi khi cập nhật thông tin người dùng:", error);
        console.log("Chi tiết lỗi:", error.response?.data);
      }
    } else {
      console.error("Không tìm thấy ID người dùng.");
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile); // Lưu tệp vào state
      const objectUrl = URL.createObjectURL(selectedFile); // Tạo URL tạm thời
      setImageUrl(objectUrl); // Cập nhật URL ảnh vào state để hiển thị
    }
  };
  const handleEditClick = () => {
    setEditedData(userData);
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(userData); // Đặt lại dữ liệu về ban đầu
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

                    {/* Các trường chỉnh sửa khác nếu cần */}

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
              <div className="w-1/3 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 text-2xl font-semibold">
                  {/* Nếu đã có URL ảnh (hoặc tệp đã chọn), hiển thị ảnh */}
                  {imageUrl ? (
                    <img
                      src={imageUrl} // Hiển thị ảnh từ URL tạm thời
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : file ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : userData && userData.avatarUrl ? (
                    <img
                      src={userData.avatarUrl} // Hiển thị ảnh từ URL lưu trong userData
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : userData && userData.fullName ? (
                    userData.fullName.charAt(0) // Hiển thị chữ cái đầu tiên từ fullName nếu không có ảnh
                  ) : (
                    ""
                  )}
                </div>

                <input
                  type="file"
                  accept=".jpeg, .png"
                  //onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />

                <button
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                  onClick={() => document.getElementById("fileInput").click()}
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
                      <label for="products-search" className="sr-only">
                        Search
                      </label>
                      <div className="relative w-48 mt-1 sm:w-64 xl:w-96">
                        <input
                          type="text"
                          name="email"
                          id="products-search"
                          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Search for products"
                        />
                      </div>
                    </form>
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
                            Star
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
                            RentCount
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            BuyQuantity
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
                            UserId
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            CategoryId
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
                        {toyData &&
                        Array.isArray(toyData) &&
                        toyData.length > 0 ? (
                          toyData.map((toy) => (
                            <tr
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              key={toy.id}
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
                                {toy.star}
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
                                {toy.rentCount}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.buyQuantity}
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
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.owner?.fullName}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.category?.name}
                              </td>
                              <td className="p-4 space-x-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  // onClick={() => handleUpdate(toy)}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                >
                                  Approver
                                </button>
                                <button
                                  type="button"
                                  // onClick={() => handleDelete(toy.id)}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="12"
                              className="text-center text-gray-500"
                            >
                              Không có đồ chơi để hiển thị
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
