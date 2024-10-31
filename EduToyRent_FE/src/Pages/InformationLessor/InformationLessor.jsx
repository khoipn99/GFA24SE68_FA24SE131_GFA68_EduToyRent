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

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Sản phẩm 1",
      price: 50000,
      status: "Đang cho thuê",
      image: "path_to_image_1.jpg",
    },
    {
      id: 2,
      name: "Sản phẩm 2",
      price: 75000,
      status: "Chờ duyệt",
      image: "path_to_image_2.jpg",
    },
    {
      id: 3,
      name: "Sản phẩm 3",
      price: 60000,
      status: "Đã duyệt",
      image: "path_to_image_3.jpg",
    },
    {
      id: 4,
      name: "Sản phẩm 4",
      price: 80000,
      status: "Bị cấm",
      image: "path_to_image_4.jpg",
    },
    {
      id: 5,
      name: "Sản phẩm 5",
      price: 90000,
      status: "Đang cho thuê",
      image: "path_to_image_5.jpg",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [productFilter, setProductFilter] = useState("all");

  const handleProductFilterChange = (filter) => {
    setProductFilter(filter);
  };

  const filteredProducts = products.filter((product) => {
    switch (productFilter) {
      case "all":
        return true;
      case "rented":
        return product.status === "Đang cho thuê";
      case "pending":
        return product.status === "Chờ duyệt";
      case "approved":
        return product.status === "Đã duyệt";
      case "banned":
        return product.status === "Bị cấm";
      default:
        return true;
    }
  });

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
                      Người đặt hàng: {order.store}
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
                  {order.status === "Chờ xác nhận" && (
                    <div className="flex space-x-2 mt-2">
                      <button className="p-2 bg-green-500 text-white rounded">
                        Xác nhận đơn hàng
                      </button>
                      <button className="p-2 bg-red-500 text-white rounded">
                        Không nhận đơn hàng
                      </button>
                    </div>
                  )}
                  {order.status === "Đang vận chuyển" && (
                    <div className="flex space-x-2 mt-2">
                      <button className="p-2 bg-green-500 text-white rounded">
                        Đã giao hàng
                      </button>
                    </div>
                  )}
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
            <div className="flex mb-4">
              <button
                onClick={() => handleProductFilterChange("all")}
                className={`p-2 rounded ${
                  productFilter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Tất cả sản phẩm
              </button>
              <button
                onClick={() => handleProductFilterChange("rented")}
                className={`p-2 rounded ${
                  productFilter === "rented"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang cho thuê
              </button>
              <button
                onClick={() => handleProductFilterChange("pending")}
                className={`p-2 rounded ${
                  productFilter === "pending"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Chờ duyệt
              </button>
              <button
                onClick={() => handleProductFilterChange("approved")}
                className={`p-2 rounded ${
                  productFilter === "approved"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => handleProductFilterChange("banned")}
                className={`p-2 rounded ${
                  productFilter === "banned"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Bị cấm
              </button>
            </div>
            <ul className="space-y-4">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  className="p-4 border border-gray-300 rounded-lg"
                >
                  <h4 className="font-semibold">{product.name}</h4>
                  <p>Giá: {product.price.toLocaleString()} VNĐ</p>
                  <p>Trạng thái: {product.status}</p>
                </li>
              ))}
            </ul>
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
                  <h4 className="font-semibold">{item.status}</h4>
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
