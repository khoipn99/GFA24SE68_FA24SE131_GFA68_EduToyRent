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
    {
      id: 6,
      name: "Sản phẩm 5",
      price: 90000,
      status: "Đang cho thuê",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleProductFilterChange = (filter) => {
    setProductFilter(filter);
    setCurrentPage(1);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    details: "",
    price: "",
    origin: "",
    age: "",
    brand: "",
    category: "",
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewProduct((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the newProduct data to the server
    console.log("New product:", newProduct);
    closeModal();
  };

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editedProduct, setEditedProduct] = useState(null);

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setEditedProduct(product);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedProduct(null);
    setIsDetailModalOpen(false);
    setIsEditMode(false);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSaveClick = () => {
    //onSaveProduct(editedProduct); // Call a function to save the edited product
    setIsEditMode(false);
    setSelectedProduct(editedProduct); // Update the displayed details with saved changes
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Các sản phẩm trong cửa hàng
              </h3>
              <button
                onClick={openModal}
                className="p-2 bg-green-500 text-white rounded"
              >
                Thêm sản phẩm mới
              </button>
            </div>
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded shadow-lg w-96">
                  <h3 className="text-lg font-semibold mb-4">
                    Thêm Sản Phẩm Mới
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <label className="block mb-2">
                      Tên đồ chơi:
                      <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded p-1 w-full"
                        required
                      />
                    </label>
                    <label className="block mb-2">
                      Chi tiết:
                      <textarea
                        name="details"
                        value={newProduct.details}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </label>
                    <label className="block mb-2">
                      Giá:
                      <input
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </label>
                    <label className="block mb-2">
                      Nguồn gốc:
                      <input
                        type="text"
                        name="origin"
                        value={newProduct.origin}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </label>
                    <label className="block mb-2">
                      Tuổi:
                      <input
                        type="number"
                        name="age"
                        value={newProduct.age}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </label>
                    <label className="block mb-2">
                      Hãng:
                      <input
                        type="text"
                        name="brand"
                        value={newProduct.brand}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </label>
                    <label className="block mb-2">
                      Loại đồ chơi:
                      <input
                        type="text"
                        name="category"
                        value={newProduct.category}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </label>
                    <label className="block mb-2">
                      Hình ảnh:
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="border border-gray-300 rounded p-1 w-full"
                        accept="image/*"
                      />
                    </label>
                    <button
                      type="submit"
                      className="mt-4 p-2 bg-blue-500 text-white rounded"
                    >
                      Tạo sản phẩm
                    </button>
                    <button
                      onClick={closeModal}
                      className="mt-4 p-2 bg-red-500 text-white rounded ml-2"
                    >
                      Đóng
                    </button>
                  </form>
                </div>
              </div>
            )}
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
                  className="p-4 border border-gray-300 rounded-lg flex items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover mr-4"
                  />
                  <div className="flex-grow">
                    <h4 className="font-semibold">{product.name}</h4>
                    <p>Giá: {product.price.toLocaleString()} VNĐ</p>
                    <p>Trạng thái: {product.status}</p>
                  </div>
                  <button
                    onClick={() => openDetailModal(product)}
                    className="p-2 bg-blue-500 text-white rounded ml-4"
                  >
                    Xem chi tiết
                  </button>
                </li>
              ))}
            </ul>

            {isDetailModalOpen && selectedProduct && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded shadow-lg w-96">
                  <h3 className="text-lg font-semibold mb-4">
                    {isEditMode ? "Sửa sản phẩm" : "Chi tiết sản phẩm"}
                  </h3>
                  <img
                    src={editedProduct.image}
                    alt={editedProduct.name}
                    className="w-full h-48 object-cover mb-4"
                  />
                  {isEditMode ? (
                    <>
                      <input
                        name="name"
                        value={editedProduct.name}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Tên đồ chơi"
                      />
                      <input
                        name="price"
                        value={editedProduct.price}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Giá"
                        type="number"
                      />
                      <input
                        name="status"
                        value={editedProduct.status}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Trạng thái"
                      />
                      <textarea
                        name="details"
                        value={editedProduct.details}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Chi tiết"
                      />
                      <input
                        name="age"
                        value={editedProduct.age}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Tuổi"
                        type="number"
                      />
                      <input
                        name="brand"
                        value={editedProduct.brand}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Hãng"
                      />
                      <input
                        name="category"
                        value={editedProduct.category}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Loại đồ chơi"
                      />
                      <input
                        name="origin"
                        value={editedProduct.origin}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Nguồn gốc"
                      />
                      <button
                        onClick={handleSaveClick}
                        className="mt-4 p-2 bg-green-500 text-white rounded"
                      >
                        Lưu
                      </button>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Tên đồ chơi:</strong> {selectedProduct.name}
                      </p>
                      <p>
                        <strong>Giá:</strong>{" "}
                        {selectedProduct.price.toLocaleString()} VNĐ
                      </p>
                      <p>
                        <strong>Trạng thái:</strong> {selectedProduct.status}
                      </p>
                      <p>
                        <strong>Chi tiết:</strong> {selectedProduct.details}
                      </p>
                      <p>
                        <strong>Tuổi:</strong> {selectedProduct.age}
                      </p>
                      <p>
                        <strong>Hãng:</strong> {selectedProduct.brand}
                      </p>
                      <p>
                        <strong>Loại đồ chơi:</strong>{" "}
                        {selectedProduct.category}
                      </p>
                      <p>
                        <strong>Nguồn gốc:</strong> {selectedProduct.origin}
                      </p>
                      {(selectedProduct.status === "Chờ duyệt" ||
                        selectedProduct.status === "Đã duyệt") && (
                        <button
                          onClick={handleEditClick}
                          className="mt-4 p-2 bg-yellow-500 text-white rounded"
                        >
                          Sửa sản phẩm
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={closeDetailModal}
                    className="mt-4 p-2 bg-red-500 text-white rounded"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded ${
                  currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
                }`}
              >
                Trang trước
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-300"
                    : "bg-blue-500 text-white"
                }`}
              >
                Trang sau
              </button>
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
              Các sản phẩm trong cửa hàng
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
      {renderOrderDetails()} {/* Render order details modal a*/}
      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default InformationLessor;
