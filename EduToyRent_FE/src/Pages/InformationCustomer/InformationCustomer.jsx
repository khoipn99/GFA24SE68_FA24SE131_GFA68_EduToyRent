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

  const [selectedOrder, setSelectedOrder] = useState(null);

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
      id: 3,
      product: "Người dùng C",
      store: "Người dùng C",
      price: 150000,
      quantity: 1,
      total: 150000,
      status: "Đang thuê",
      address: "Quận 1",
      date: "2024-01-02",
      numbers: "1234567890",
      items: [
        {
          id: 4,
          name: "Sản phẩm 3",
          price: 150000,
          quantity: 1,
          image: "path_to_image_3.jpg",
          status: "Đang thuê",
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
      status: "Chờ trả hàng",
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

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeDetails = () => {
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter((order) => {
    return filterStatus === "all" || order.status === filterStatus;
  });

  const handleExtendRental = (order) => {};
  const handleReturnOrder = (order) => {};
  const handleReBuy = (order) => {};

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
                onClick={() => handleFilterChange("Đang thuê")}
                className={`p-2 rounded ${
                  filterStatus === "Đang thuê"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang thuê
              </button>
              <button
                onClick={() => handleFilterChange("Chờ trả hàng")}
                className={`p-2 rounded ${
                  filterStatus === "Chờ trả hàng"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Chờ trả hàng
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
                  {order.status === "Đang trả hàng" && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleReBuy(order)}
                        className="p-2 bg-green-500 text-white rounded"
                      >
                        Đã trả
                      </button>
                    </div>
                  )}
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

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-lg relative">
          <button
            onClick={closeDetails}
            className="absolute top-2 right-2 text-red-500"
          >
            Đóng
          </button>
          <h3 className="text-lg font-semibold">Chi tiết đơn hàng</h3>
          <ul className="space-y-4 mt-4">
            {selectedOrder.items.map((item) => (
              <li
                key={item.id}
                className="p-4 border border-gray-300 rounded-lg flex"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover mr-4"
                />
                <div className="flex-grow">
                  <h4 className="font-semibold">{item.name}</h4>
                  <p>Giá: {item.price.toLocaleString()} VNĐ</p>
                  <p>Số lượng: {item.quantity}</p>
                  <p>
                    Tổng: {(item.price * item.quantity).toLocaleString()} VNĐ
                  </p>
                  <h4 className="font-semibold">{item.status}</h4>
                </div>
                {item.status === "Chờ trả hàng" && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleExtendRental(item)}
                      className="p-2 bg-green-500 text-white rounded"
                    >
                      Tiếp tục thuê
                    </button>
                    <button
                      onClick={() => handleReturnOrder(item)}
                      className="p-2 bg-red-500 text-white rounded"
                    >
                      Trả hàng
                    </button>
                  </div>
                )}
                {item.status === "Đang trả hàng" && (
                  <div className="flex space-x-2 mt-2">
                    <button className="p-2 bg-green-500 text-white rounded">
                      Đã trả hàng
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
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
      {renderOrderDetails()} {/* Render order details modal */}
      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default InformationCustomer;
