import React, { useState } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";

const InformationCustomer = () => {
  const [selectedTab, setSelectedTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
  });

  // Dữ liệu mẫu cho đơn hàng
  const [orders, setOrders] = useState([
    {
      id: 1,
      product: "Sản phẩm A",
      store: "Cửa hàng A",
      price: 100000,
      quantity: 2,
      total: 200000,
      status: "Đang xử lý",
      imageUrl: "https://via.placeholder.com/150", // Hình ảnh sản phẩm
      date: "2024-01-01",
    },
    {
      id: 2,
      product: "Sản phẩm B",
      store: "Cửa hàng B",
      price: 150000,
      quantity: 1,
      total: 150000,
      status: "Đã giao",
      imageUrl: "https://via.placeholder.com/150", // Hình ảnh sản phẩm
      date: "2024-01-02",
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

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const filteredOrders = orders.filter((order) => {
    return filterStatus === "all" || order.status === filterStatus;
  });

  const renderContent = () => {
    switch (selectedTab) {
      case "info":
        return (
          <div>
            <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
            {isEditing ? (
              <div>
                <label className="block">
                  Tên:
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded p-1"
                  />
                </label>
                <label className="block">
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded p-1"
                  />
                </label>
                <label className="block">
                  Điện thoại:
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded p-1"
                  />
                </label>
                <button
                  onClick={handleSaveChanges}
                  className="mt-4 p-2 bg-blue-500 text-white rounded"
                >
                  Lưu thay đổi
                </button>
              </div>
            ) : (
              <div>
                <p>Tên: {customerInfo.name}</p>
                <p>Email: {customerInfo.email}</p>
                <p>Điện thoại: {customerInfo.phone}</p>
                <button
                  onClick={handleEditToggle}
                  className="mt-4 p-2 bg-yellow-500 text-white rounded"
                >
                  Sửa thông tin
                </button>
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
                onClick={() => handleFilterChange("Đang xử lý")}
                className={`p-2 rounded ${
                  filterStatus === "Đang xử lý"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang xử lý
              </button>
              <button
                onClick={() => handleFilterChange("Đã giao")}
                className={`p-2 rounded ${
                  filterStatus === "Đã giao"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đã giao
              </button>
            </div>
            <ul className="space-y-4">
              {filteredOrders.map((order) => (
                <li
                  key={order.id}
                  className="p-4 border border-gray-300 rounded-lg"
                >
                  {/* Phần đầu - Tên cửa hàng và trạng thái */}
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">{order.store}</h4>
                    <span className="font-medium">{order.status}</span>
                  </div>
                  <hr className="border-gray-300 mb-2" />{" "}
                  {/* Đường kẻ ngăn cách */}
                  {/* Phần giữa - Hình ảnh, tên sản phẩm, số lượng và giá */}
                  <div className="flex items-center mb-2">
                    <img
                      src={order.imageUrl}
                      alt={order.product}
                      className="w-24 h-24 object-cover mr-4"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold">{order.product}</p>
                      <p>Số lượng: {order.quantity}</p>
                      <p>Giá: {order.price.toLocaleString()} VNĐ</p>
                    </div>
                  </div>
                  <hr className="border-gray-300 mb-2" />{" "}
                  {/* Đường kẻ ngăn cách */}
                  {/* Phần cuối - Tổng tiền */}
                  <p className="font-semibold">
                    Tổng tiền: {order.total.toLocaleString()} VNĐ
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 p-9">
      <header>
        <HeaderForCustomer />
      </header>

      <main className="flex flex-grow justify-center py-4">
        <div className="flex w-3/4 bg-white shadow-md rounded-lg">
          {/* Phần bên trái - danh mục thông tin */}
          <div className="w-1/4 p-4">
            <h2 className="text-lg font-semibold mb-4">Tài khoản</h2>
            <button
              onClick={() => setSelectedTab("info")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "info" ? "bg-gray-300" : ""
              }`}
            >
              Thông tin khách hàng
            </button>
            <button
              onClick={() => setSelectedTab("orders")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "orders" ? "bg-gray-300" : ""
              }`}
            >
              Đơn hàng đã mua
            </button>
          </div>

          {/* Phần bên phải - thông tin chi tiết */}
          <div className="w-3/4 p-4 border-l">{renderContent()}</div>
        </div>
      </main>

      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default InformationCustomer;
