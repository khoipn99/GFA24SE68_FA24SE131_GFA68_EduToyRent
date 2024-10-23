import React, { useState } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";

const InformationLessor = () => {
  const [selectedTab, setSelectedTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState(null); // To store selected order details

  // Sample data for orders
  const [orders, setOrders] = useState([
    {
      id: 1,
      product: "Người dùng A",
      store: "Người dùng A",
      price: 100000,
      quantity: 2,
      total: 200000,
      status: "Đang xử lý",
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
        },
        {
          id: 2,
          name: "Sản phẩm 2",
          price: 50000,
          quantity: 1,
          image: "path_to_image_2.jpg",
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
      status: "Đã giao",
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
        },
      ],
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order); // Set selected order to view details
  };

  const closeDetails = () => {
    setSelectedOrder(null); // Close the order details view
  };

  const filteredOrders = orders.filter((order) => {
    return filterStatus === "all" || order.status === filterStatus;
  });

  const renderContent = () => {
    switch (selectedTab) {
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
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">{order.store}</h4>
                    <span className="font-medium">{order.status}</span>
                  </div>
                  <hr className="border-gray-300 mb-2" />
                  <div className="flex items-center mb-2">
                    <div className="flex-grow">
                      <p className="font-semibold">{order.date}</p>
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
                </li>
              ))}
            </ul>
          </div>
        );
      case "products":
        return (
          <div>
            <h3 className="text-lg font-semibold">
              Các sản phẩm trong cửa hàng
            </h3>
            <p>Danh sách các sản phẩm sẽ được hiển thị ở đây.</p>
            <button className="mt-4 p-2 bg-green-500 text-white rounded">
              Thêm sản phẩm mới
            </button>
          </div>
        );
      case "dashboard":
        return (
          <div>
            <h3 className="text-lg font-semibold">Doanh Thu</h3>
            <p>Thông tin thống kê sẽ được hiển thị ở đây.</p>
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
                </div>
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
            <h2 className="text-lg font-semibold mb-4">Cho thuê</h2>
            <button
              onClick={() => setSelectedTab("orders")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "orders" ? "bg-gray-300" : ""
              }`}
            >
              Danh sách đơn hàng
            </button>
            <button
              onClick={() => setSelectedTab("products")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "products" ? "bg-gray-300" : ""
              }`}
            >
              Các sản phẩm đang cho thuê
            </button>
            <button
              onClick={() => setSelectedTab("dashboard")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "dashboard" ? "bg-gray-300" : ""
              }`}
            >
              Dashboard
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

export default InformationLessor;
