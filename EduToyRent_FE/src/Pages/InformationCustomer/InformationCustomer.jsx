import React, { useState, useEffect } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie

const InformationCustomer = () => {
  const [selectedTab, setSelectedTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({});

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = () => {
    const userDataCookie = Cookies.get("userDataReal");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);
      setCustomerInfo(parsedUserData[0]);
      console.log(parsedUserData[0]);
    }
  };

  // Dữ liệu mẫu cho đơn hàng
  const [orders, setOrders] = useState([
    {
      id: 1,
      product: "Người dùng A",
      store: "Người dùng A",
      price: 100000,
      quantity: 2,
      total: 200000,
      status: "Chờ xác nhận",
      address: "Quận 9",
      date: "2024-01-01",
      numbers: "1234567890",
      items: [
        {
          id: 1,
          name: "Sản phẩm 1",
          price: 50000,
          quantity: 2,
          image: "path_to_image_1.jpg",
          status: "Chờ xác nhận",
        },
        {
          id: 2,
          name: "Sản phẩm 2",
          price: 50000,
          quantity: 1,
          image: "path_to_image_2.jpg",
          status: "Chờ xác nhận",
        },
      ],
    },
    {
      id: 2,
      product: "Người dùng B",
      store: "Người dùng B",
      price: 150000,
      quantity: 1,
      total: 150000,
      status: "Đang vận chuyển",
      address: "Quận 1",
      date: "2024-01-02",
      numbers: "1234567890",
      items: [
        {
          id: 3,
          name: "Sản phẩm 3",
          price: 150000,
          quantity: 1,
          image: "path_to_image_3.jpg",
          status: "Đang vận chuyển",
        },
      ],
    },

    {
      id: 4,
      product: "Người dùng D",
      store: "Người dùng D",
      price: 150000,
      quantity: 1,
      total: 150000,
      status: "Đang thực hiện",
      address: "Quận 1",
      date: "2024-01-02",
      numbers: "1234567890",
      items: [
        {
          id: 5,
          name: "Sản phẩm 3",
          price: 150000,
          quantity: 1,
          image: "path_to_image_3.jpg",
          status: "Đang trả hàng",
        },
        {
          id: 6,
          name: "Sản phẩm 6",
          price: 1500000,
          quantity: 1,
          image: "path_to_image_3.jpg",
          status: "Chờ trả hàng",
        },
        {
          id: 6,
          name: "Sản phẩm 7",
          price: 1700000,
          quantity: 1,
          image: "path_to_image_3.jpg",
          status: "Hoàn thành",
        },
      ],
    },

    {
      id: 5,
      product: "Người dùng E",
      store: "Người dùng E",
      price: 150000,
      quantity: 1,
      total: 150000,
      status: "Hoàn thành",
      address: "Quận 1",
      date: "2024-01-02",
      numbers: "1234567890",
      items: [
        {
          id: 5,
          name: "Sản phẩm 3",
          price: 150000,
          quantity: 1,
          image: "path_to_image_3.jpg",
          status: "Hoàn thành",
        },
      ],
    },

    {
      id: 6,
      product: "Người dùng F",
      store: "Người dùng F",
      price: 150000,
      quantity: 1,
      total: 150000,
      status: "Đã hủy",
      address: "Quận 1",
      date: "2024-01-02",
      numbers: "1234567890",
      items: [
        {
          id: 5,
          name: "Sản phẩm 3",
          price: 150000,
          quantity: 1,
          image: "path_to_image_3.jpg",
          status: "Đã hủy",
        },
      ],
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    console.log("Thông tin đã lưu:", customerInfo);
  };

  const handleCancel = () => {
    getUserInfo();
    setIsEditing(false);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeDetails = () => {
    setSelectedOrder(null);
  };

  const handleEditAvatar = () => {};

  const filteredOrders = orders.filter((order) => {
    return filterStatus === "all" || order.status === filterStatus;
  });

  const handleExtendRental = (order) => {};
  const handleReturnOrder = (order) => {};
  const handleReBuy = (order) => {};

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // Hiển thị ảnh hiện tại ban đầu
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Tạo preview hình ảnh đã chọn
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setPreviewImage(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Handle image upload to server (simulated here)
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    // Simulate image upload (replace with actual upload logic)
    const uploadedImageUrl = await uploadImage(selectedFile);

    // Call the function to update the image URL in the database

    setIsUploading(false);
    setPreviewImage(uploadedImageUrl); // Update the preview with the uploaded image
  };

  // Simulated image upload function (replace with actual upload logic)
  const uploadImage = async (file) => {
    // Simulate uploading the file and returning a URL (replace with actual upload logic)
    return URL.createObjectURL(file); // For demo purposes, just return a URL
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "info":
        return (
          <div>
            <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
            {isEditing ? (
              <div className="flex justify-between items-center">
                <div>
                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">Tên:</p>
                    <input
                      type="text"
                      name="fullName"
                      value={customerInfo.fullName}
                      onChange={handleInputChange}
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>
                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">Địa chỉ:</p>
                    <input
                      type="text"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>
                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">Điện thoại:</p>
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>
                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">Ngày sinh:</p>
                    <input
                      type="date"
                      name="dob"
                      value={
                        customerInfo.dob
                          ? new Date(customerInfo.dob)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={handleInputChange}
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>

                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">Email:</p>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>
                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">Mật khẩu:</p>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>
                  <button
                    onClick={handleSaveChanges}
                    className="mt-4 p-2 bg-blue-500 text-white rounded"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={handleCancel}
                    className="mt-4 p-2 bg-red-500 text-white rounded"
                  >
                    Hủy
                  </button>
                </div>
                <div className="relative group w-40 h-40 ml-auto">
                  {" "}
                  {/* Increased size */}
                  <img
                    src={customerInfo.avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <button
                    onClick={handleEditAvatar}
                    className="absolute inset-0 bg-black bg-opacity-50 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  >
                    Chỉnh sửa hình ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                {/* Left Side: User Info */}
                <div>
                  <div className="flex justify-between items-center space-x-12">
                    <p className="font-semibold w-4/10">Tên:</p>
                    <p className="w-6/10">{customerInfo.fullName}</p>
                  </div>

                  <div className="flex justify-between items-center space-x-12">
                    <p className="font-semibold w-4/10">Địa chỉ:</p>
                    <p className="w-6/10">{customerInfo.address}</p>
                  </div>

                  <div className="flex justify-between items-center space-x-12">
                    <p className="font-semibold w-4/10">Điện thoại:</p>
                    <p className="w-6/10">{customerInfo.phone}</p>
                  </div>

                  <div className="flex justify-between items-center space-x-12">
                    <p className="font-semibold w-4/10">Ngày sinh:</p>
                    <p className="w-6/10">
                      {customerInfo.dob
                        ? new Date(customerInfo.dob).toISOString().split("T")[0]
                        : ""}
                    </p>
                  </div>

                  <div className="flex justify-between items-center space-x-12">
                    <p className="font-semibold w-4/10">Email:</p>
                    <p className="w-6/10">{customerInfo.email}</p>
                  </div>

                  <div className="flex justify-between items-center space-x-12">
                    <p className="font-semibold w-4/10">Mật khẩu:</p>
                    <p className="w-6/10">{customerInfo.password}</p>
                  </div>

                  <button
                    onClick={handleEditToggle}
                    className="mt-4 p-2 bg-yellow-500 text-white rounded w-full"
                  >
                    Sửa thông tin
                  </button>
                </div>

                {/* Right Side: Larger User Avatar with Edit Button */}
                <div className="relative group w-40 h-40 ml-auto">
                  {" "}
                  {/* Increased size */}
                  <img
                    src={customerInfo.avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <button
                    onClick={handleEditAvatar}
                    className="absolute inset-0 bg-black bg-opacity-50 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  >
                    Chỉnh sửa hình ảnh
                  </button>
                  <div className="relative">
                    {/* Current Avatar */}
                    <div className="flex justify-center items-center mb-4">
                      <img
                        src={previewImage}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    </div>

                    {/* Button to trigger file selection */}
                    <label
                      htmlFor="avatar-upload"
                      className="p-2 bg-blue-500 text-white rounded cursor-pointer"
                    >
                      Tải hình ảnh mới
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {selectedFile && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          Hình ảnh đã chọn: {selectedFile.name}
                        </p>
                        <button
                          onClick={handleUpload}
                          className="mt-2 p-2 bg-green-500 text-white rounded"
                          disabled={isUploading}
                        >
                          {isUploading ? "Đang tải..." : "Lưu hình ảnh"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "orders":
        return (
          <div>
            <h3 className="text-lg font-semibold">Danh sách đơn hàng</h3>
            <div className="flex mb-4">
              <button
                onClick={() => handleFilterChange("all")}
                className={`p-2 rounded ${
                  filterStatus === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => handleFilterChange("Chờ xác nhận")}
                className={`p-2 rounded ${
                  filterStatus === "Chờ xác nhận"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Chờ xác nhận
              </button>
              <button
                onClick={() => handleFilterChange("Đang vận chuyển")}
                className={`p-2 rounded ${
                  filterStatus === "Đang vận chuyển"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang vận chuyển
              </button>
              <button
                onClick={() => handleFilterChange("Đang thực hiện")}
                className={`p-2 rounded ${
                  filterStatus === "Đang thực hiện"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang thực hiện
              </button>

              <button
                onClick={() => handleFilterChange("Hoàn thành")}
                className={`p-2 rounded ${
                  filterStatus === "Hoàn thành"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Hoàn thành
              </button>
              <button
                onClick={() => handleFilterChange("Đã hủy")}
                className={`p-2 rounded ${
                  filterStatus === "Đã hủy"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đã hủy
              </button>
            </div>
            <ul className="space-y-4">
              {filteredOrders.map((order) => (
                <li
                  key={order.id}
                  className="p-4 border border-gray-300 rounded-lg"
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">
                      Đặt hàng từ: {order.store}
                    </h4>
                    <span className="font-medium">{order.status}</span>
                  </div>
                  <hr className="border-gray-300 mb-2" />
                  <div className="flex items-center mb-2">
                    <div className="flex-grow">
                      <p className="font-semibold">
                        Ngày đặt hàng: {order.date}
                      </p>
                      <p>Địa chỉ giao hàng: {order.address}</p>
                      <p>Tên người nhận: {order.store}</p>
                      <p>Số điện thoại: {order.numbers}</p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="ml-4 p-2 bg-blue-500 text-white rounded"
                    >
                      Xem chi tiết đơn hàng
                    </button>
                  </div>
                  <hr className="border-gray-300 mb-2" />
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">
                      Tổng tiền: {order.total.toLocaleString()} VNĐ
                    </p>

                    {order.status === "Đã hủy" && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleReBuy(order)}
                          className="p-2 bg-green-500 text-white rounded"
                        >
                          Đặt hàng lại
                        </button>
                      </div>
                    )}
                    {order.status === "Chờ xác nhận" && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          //onClick={() => handleReBuy(order)}
                          className="p-2 bg-red-500 text-white rounded"
                        >
                          Hủy đơn hàng
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    const stages = ["Chờ trả hàng", "Đang trả hàng", "Hoàn thành"];

    // Determine the current stage index based on status
    const getStatusIndex = (status) => stages.indexOf(status);

    const handleStageClick = (item, stage) => {
      // Function to handle status change
      item.status = stage;
      setSelectedOrder({ ...selectedOrder }); // Update state to trigger re-render
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-lg relative w-3/4 flex">
          {/* Left side: Order information */}
          <div className="w-1/2 p-4 border-r border-gray-300">
            <button
              onClick={closeDetails}
              className="absolute top-2 right-2 text-red-500"
            >
              Đóng
            </button>
            <h3 className="text-lg font-semibold">Thông tin đơn hàng</h3>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Mã đơn hàng:</strong> {selectedOrder.id}
              </p>
              <p>
                <strong>Ngày đặt:</strong> {selectedOrder.orderDate}
              </p>
              <p>
                <strong>Tình trạng:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Tổng tiền:</strong>{" "}
                {(selectedOrder.totalAmount || 0).toLocaleString()} VNĐ
              </p>
              <p>
                <strong>Địa chỉ giao hàng:</strong>{" "}
                {selectedOrder.shippingAddress}
              </p>
            </div>
          </div>

          {/* Right side: OrderDetails */}
          <div className="w-1/2 p-4">
            <h3 className="text-lg font-semibold">Chi tiết sản phẩm</h3>
            <ul className="space-y-4 mt-4">
              {selectedOrder.items.map((item) => {
                const currentIndex = getStatusIndex(item.status);

                return (
                  <li
                    key={item.id}
                    className="p-4 border border-gray-300 rounded-lg flex flex-col"
                  >
                    <div className="flex items-center mb-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover mr-4"
                      />
                      <div className="flex-grow">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p>Giá: {(item.price || 0).toLocaleString()} VNĐ</p>
                        <p>Số lượng: {item.quantity}</p>
                        <p>
                          Tổng:{" "}
                          {(item.price * item.quantity || 0).toLocaleString()}{" "}
                          VNĐ
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gray-300"></div>
                      <div className="flex justify-between relative z-10">
                        {stages.map((stage, index) => (
                          <div
                            key={stage}
                            className="flex items-center justify-center space-x-2"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index <= currentIndex
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-300 text-gray-600"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="text-sm">{stage}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 p-9">
      <header>
        <HeaderForCustomer />
      </header>
      <main className="flex flex-grow justify-center py-4">
        <div className="flex w-3/4 bg-white shadow-md rounded-lg">
          <div className="w-1/4 p-4">
            <h2 className="text-lg font-semibold mb-4">Tài khoản</h2>
            <button
              onClick={() => setSelectedTab("info")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "info" ? "bg-gray-300" : ""
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setSelectedTab("orders")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "orders" ? "bg-gray-300" : ""
              }`}
            >
              Đơn hàng đã đặt
            </button>
          </div>
          <div className="w-3/4 p-4 border-l">{renderContent()}</div>
        </div>
      </main>
      {renderOrderDetails()} {/* Render order details modal  a*/}
      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default InformationCustomer;
