import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import thư viện Cookies

import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";

const ToySupplierPage = () => {
  const [userData, setUserData] = useState("");
  const [selectedTab, setSelectedTab] = useState("orders");
  const [editProduct, setEditProduct] = useState(null);
  const [editProductId, setEditProductId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // To store selected order details
  const [customerInfo, setCustomerInfo] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
  });

  useEffect(() => {
    try {
      const userDataCookie = Cookies.get("userData");
      if (userDataCookie) {
        const parsedUserData = JSON.parse(userDataCookie);
        setUserData(parsedUserData);
      } else {
        console.error("User data not found in cookies");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);
  // Sample data for orders
  const [orders, setOrders] = useState([
    {
      id: 1,
      product: "Người dùng A",
      store: "Người dùng A",
      price: 100000,
      quantity: 1,
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
          image:
            "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
          status: "Chờ xác nhận",
        },
        {
          id: 2,
          name: "Sản phẩm 2",
          price: 50000,
          quantity: 1,
          image:
            "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
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
      status: "Chờ xác nhận",
      address: "Quận 1",
      date: "2024-01-02",
      numbers: "1234567890",
      items: [
        {
          id: 3,
          name: "Sản phẩm 3",
          price: 150000,
          quantity: 1,
          image:
            "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
          status: "Chờ xác nhận",
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
      status: "Hoàn thành",
      address: "Quận 1",
      date: "2024-01-02",
      numbers: "1234567890",
      items: [
        {
          id: 4,
          name: "Sản phẩm 3",
          price: 150000,
          quantity: 1,
          image:
            "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
          status: "Hoàn thành",
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
          image:
            "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
          status: "Hoàn thành",
        },
        {
          id: 6,
          name: "Sản phẩm 6",
          price: 1500000,
          quantity: 1,
          image:
            "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
          status: "Hoàn thành",
        },
        {
          id: 6,
          name: "Sản phẩm 7",
          price: 1700000,
          quantity: 1,
          image:
            "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
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
          image:
            "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
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
          image:
            "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
          status: "Đã hủy",
        },
      ],
    },
  ]);
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
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Sản phẩm 1",
      price: 50000,
      status: "Đang cho thuê",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
    },
    {
      id: 2,
      name: "Sản phẩm 2",
      price: 75000,
      status: "Chờ duyệt",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
    },
    {
      id: 3,
      name: "Sản phẩm 3",
      price: 60000,
      status: "Đã duyệt",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
    },
    {
      id: 4,
      name: "Sản phẩm 4",
      price: 80000,
      status: "Bị cấm",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
    },
    {
      id: 5,
      name: "Sản phẩm 5",
      price: 90000,
      status: "Đang cho thuê",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
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

  // Hàm khi bắt đầu chỉnh sửa sản phẩm
  const handleEditProduct = (product) => {
    setEditProductId(product.id);
    setEditProduct({ ...product });
  };

  // Lưu sản phẩm đã chỉnh sửa
  const handleSaveEdit = () => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === editProduct.id ? editProduct : product
      )
    );
    setEditProductId(null);
    setEditProduct(null);
  };

  // Xử lý thay đổi trong form chỉnh sửa
  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setEditProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  // Xóa sản phẩm
  const handleDeleteProduct = (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
      alert(`Đã xoá sản phẩm có ID: ${productId}`);
    }
  };
  const handleAddNewProduct = () => {
    const newProduct = {
      id: products.length + 1, // hoặc dùng một cơ chế tạo ID khác nếu cần
      name: "Sản phẩm mới",
      price: 0,
      status: "Chờ duyệt",
      image: "https://example.com/default-image.png", // URL mặc định
    };

    setProducts([...products, newProduct]);
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "info":
        return (
          <div>
            <h3 className="text-lg font-semibold">Thông tin cửa hàng</h3>
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

            <div className="space-y-4">
              {products.map((product) => (
                <ul
                  key={product.id}
                  className="p-4 border border-gray-300 rounded-lg"
                >
                  <img
                    src={product.image} // URL của hình ảnh từ product.image
                    alt={product.name}
                    className="w-full h-48 object-cover rounded mb-2"
                  />

                  {editProductId === product.id ? (
                    <div>
                      <h4 className="font-semibold">Chỉnh sửa sản phẩm</h4>
                      <label>
                        Tên sản phẩm:
                        <input
                          type="text"
                          name="name"
                          value={editProduct.name}
                          onChange={handleChangeEdit}
                          className="border p-1 rounded ml-2"
                        />
                      </label>
                      <br />
                      <label>
                        Giá:
                        <input
                          type="number"
                          name="price"
                          value={editProduct.price}
                          onChange={handleChangeEdit}
                          className="border p-1 rounded ml-2"
                        />
                      </label>
                      <br />
                      <label>
                        Trạng thái:
                        <input
                          type="text"
                          name="status"
                          value={editProduct.status}
                          onChange={handleChangeEdit}
                          className="border p-1 rounded ml-2"
                        />
                      </label>
                      <br />
                      <button
                        onClick={handleSaveEdit}
                        className="mt-2 p-2 bg-blue-500 text-white rounded"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditProductId(null)}
                        className="mt-2 p-2 bg-gray-500 text-white rounded ml-2"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p>Giá: {product.price.toLocaleString()} VNĐ</p>
                      <p>Trạng thái: {product.status}</p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 bg-yellow-500 text-white rounded"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 bg-red-500 text-white rounded"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  )}
                </ul>
              ))}
            </div>

            <button
              onClick={handleAddNewProduct}
              className="mt-4 p-2 bg-green-500 text-white rounded"
            >
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
      case "Edit":
        return (
          <div className="flex flex-1 justify-center py-5 bg-white shadow-md">
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-6">
                <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                  <div className="flex items-center mb-2">
                    <img
                      src="https://cdn.iconscout.com/icon/free/png-256/user-1194416-1003670.png" // Thay thế bằng đường dẫn đến ảnh đại diện của cửa hàng
                      alt="Store Icon"
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        Cửa Hàng Đồ Chơi : TCSa
                      </h3>

                      <div className="flex space-x-2 mt-2">
                        <button className="border border-blue-500 text-blue-500 font-semibold px-4 py-2 rounded">
                          Chat ngay
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-500 mr-4">
                        Sản phẩm: 608
                      </span>
                      <span className="text-sm text-gray-500 mr-4">
                        Đánh giá: 252,8k
                      </span>
                      <span className="text-sm text-gray-500">
                        Điểm đánh giá trung bình: 5.0
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between px-4 pt-5">
                    <h2 className="text-[#0e161b] text-[22px] font-bold">
                      GỢI Ý CHO BẠN
                    </h2>
                  </div>

                  <div className="grid grid-cols-6 gap-3 p-4">
                    {" "}
                    {recommendedToys.map((toy, index) => (
                      <div key={index} className="flex flex-col gap-3 pb-3">
                        <div
                          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                          style={{ backgroundImage: `url(${toy.image})` }}
                        ></div>
                        <div>
                          <p className="text-[#0e161b] text-base font-medium">
                            {toy.name}
                          </p>
                          <p className="text-[#507a95] text-sm">
                            Age group: {toy.ageGroup}
                          </p>
                          <p className="text-[#0e161b] text-lg font-bold">
                            ${toy.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <h2 className="text-[#0e161b] text-[22px] font-bold">
                  Thông tin cửa hàng
                </h2>
                <div
                  className="relative flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 pb-10"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("${images[currentImageIndex]}")`,
                  }}
                >
                  {/* Nút Previous Image */}
                  <button
                    onClick={previousImage}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-transparent text-white text-2xl"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  >
                    ‹
                  </button>

                  {/* Nút Next Image */}
                  <button
                    onClick={nextImage}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-transparent text-white text-2xl"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  >
                    ›
                  </button>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                  <div className="mb-2">
                    <span className="font-semibold">
                      Tại sao nên mua hàng Xiaomi tại Cửa Hàng TCS
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">
                      Cam kết hàng chính hãng 100%,khách có thể đến cửa hàng mua
                      hàng xem hàng và kiểm tra thật giả bằng mọi cách
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">
                      Cửa Hàng có địa chỉ rõ ràng tại Hà Nội và TP Hồ Chí Minh,
                      bạn có thể yên tâm mua hàng
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">
                      Cửa hàng nhận ship hàng toàn quốc
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
                  <div>
                    <div className="flex items-center justify-between px-4 pt-5">
                      <h2 className="text-[#0e161b] text-[22px] font-bold">
                        Các sản phẩm của TCS
                      </h2>
                    </div>
                    <div className="layout-content-container flex max-w-[1200px] w-full px-4 sm:px-6 lg:px-8">
                      {/* Thanh Filter bên trái */}
                      <div className="w-1/4 p-4 bg-gray-100 rounded-lg shadow-sm">
                        <h2 className="text-[#0e161b] text-xl font-bold mb-4">
                          Filters
                        </h2>

                        <div className="mb-4">
                          <label className="mb-1">Age Group:</label>
                          <select
                            value={ageGroup}
                            onChange={(e) => setAgeGroup(e.target.value)}
                            className="border rounded p-2 w-full"
                          >
                            <option value="">All</option>
                            <option value="Ages 3-5">Ages 3-5</option>
                            <option value="Ages 4-6">Ages 4-6</option>
                            <option value="Ages 6-8">Ages 6-8</option>
                            <option value="Ages 9-12">Ages 9-12</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="mb-1">Max Price:</label>
                          <select
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="border rounded p-2 w-full"
                          >
                            <option value="">All</option>
                            <option value="10">Up to $10</option>
                            <option value="20">Up to $20</option>
                            <option value="30">Up to $30</option>
                            <option value="40">Up to $40</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="mb-1">Brand:</label>
                          <select
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="border rounded p-2 w-full"
                          >
                            <option value="">All</option>
                            <option value="Brand A">Brand A</option>
                            <option value="Brand B">Brand B</option>
                          </select>
                        </div>

                        <button
                          onClick={handleSearch}
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          Apply Filters
                        </button>
                      </div>

                      {/* Phần hiển thị sản phẩm bên phải */}
                      <div className="w-3/4 pl-6">
                        <div className="mb-4">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border rounded p-2 w-full"
                            placeholder="Tìm kiếm bằng tên đồ chơi"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {currentItems.length > 0 ? (
                            currentItems.map((toy, index) => (
                              <div
                                key={index}
                                className="flex flex-col gap-3 pb-3"
                              >
                                <div
                                  className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                                  style={{
                                    backgroundImage: `url(${toy.image})`,
                                  }}
                                ></div>
                                <div>
                                  <p className="text-[#0e161b] text-base font-medium">
                                    {toy.name}
                                  </p>
                                  <p className="text-[#507a95] text-sm">
                                    Age group: {toy.ageGroup}
                                  </p>
                                  <p className="text-[#0e161b] text-sm">
                                    Brand: {toy.brand}
                                  </p>
                                  <p className="text-[#0e161b] text-lg font-bold">
                                    ${toy.price}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[#0e161b] text-lg">
                              No toys found
                            </p>
                          )}
                        </div>

                        {/* Phân trang */}
                        <div className="flex justify-center mt-4">
                          {pageNumbers.map((number) => (
                            <button
                              key={number}
                              onClick={() => setCurrentPage(number)}
                              className={`${
                                currentPage === number
                                  ? "bg-blue-800"
                                  : "bg-blue-500"
                              } text-white px-3 py-2 mx-1 rounded`}
                            >
                              {number}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

  //phần chỉnh trang chủ của toy sup
  const images = [
    "https://cdn.usegalileo.ai/sdxl10/53c88725-ec48-4320-81f5-e34d4c105caf.png",
    "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
    // Thay thế bằng URL hình ảnh thứ ba
  ];

  const recommendedToys = [
    {
      name: "Kids Play Kitchen",
      ageGroup: "Ages 4-6",
      price: "49.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
    },
    {
      name: "Outdoor Adventure Set",
      ageGroup: "Ages 5-8",
      price: "34.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
    },
    {
      name: "Musical Instruments",
      ageGroup: "Ages 6-9",
      price: "59.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
    },
  ];

  const toys = [
    {
      name: "Đồ chơi phát triển tư duy",
      ageGroup: "Ages 3-5",
      brand: "Brand A",
      price: "19.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forSale",
    },
    {
      name: "Remote Control Car",
      ageGroup: "Ages 4-6",
      brand: "Brand B",
      price: "29.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forRent",
    },
    {
      name: "Đồ chơi phát triển tư duy",
      ageGroup: "Ages 3-5",
      brand: "Brand A",
      price: "19.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forSale",
    },
    {
      name: "Remote Control Car",
      ageGroup: "Ages 4-6",
      brand: "Brand B",
      price: "29.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forRent",
    },
    {
      name: "Đồ chơi phát triển tư duy",
      ageGroup: "Ages 3-5",
      brand: "Brand A",
      price: "19.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forSale",
    },
    {
      name: "Remote Control Car",
      ageGroup: "Ages 4-6",
      brand: "Brand B",
      price: "29.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forRent",
    },
    {
      name: "Remote Control Car",
      ageGroup: "Ages 4-6",
      brand: "Brand B",
      price: "29.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forRent",
    },
    // Thêm nhiều đồ chơi khác tại đây
  ];

  const [ageGroup, setAgeGroup] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái cho tìm kiếm
  const [toyType, setToyType] = useState(""); // Trạng thái để lọc giữa đồ chơi bán và cho thuê
  const [filteredToys, setFilteredToys] = useState(toys); // Trạng thái cho đồ chơi đã lọc

  // Thêm trạng thái cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Số lượng đồ chơi mỗi trang

  const handleSearch = () => {
    const newFilteredToys = toys.filter((toy) => {
      const matchesAge = ageGroup ? toy.ageGroup === ageGroup : true;
      const matchesPrice = maxPrice
        ? parseFloat(toy.price) <= parseFloat(maxPrice)
        : true;
      const matchesBrand = brand ? toy.brand === brand : true;
      const matchesSearch = toy.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = toyType ? toy.type === toyType : true;

      return (
        matchesAge &&
        matchesPrice &&
        matchesBrand &&
        matchesSearch &&
        matchesType
      );
    });
    setFilteredToys(newFilteredToys); // Cập nhật danh sách đồ chơi đã lọc
    setCurrentPage(1); // Reset trang về 1 khi tìm kiếm
  };

  // Tính toán phần tử trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredToys.slice(indexOfFirstItem, indexOfLastItem);

  // Tạo danh sách số trang
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredToys.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Thay đổi hình ảnh mỗi 3 giây

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
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
            <button
              onClick={() => setSelectedTab("info")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "info" ? "bg-gray-300" : ""
              }`}
            >
              Thông tin cửa hàng
            </button>

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
              Các sản phẩm đang bán
            </button>
            <button
              onClick={() => setSelectedTab("dashboard")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "dashboard" ? "bg-gray-300" : ""
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setSelectedTab("Edit")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "Edit" ? "bg-gray-300" : ""
              }`}
            >
              Chỉnh sửa cửa hàng
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

export default ToySupplierPage;
