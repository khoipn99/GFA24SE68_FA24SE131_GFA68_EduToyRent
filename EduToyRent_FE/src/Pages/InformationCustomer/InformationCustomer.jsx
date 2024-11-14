import React, { useState, useEffect } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie
import apiOrderDetail from "../../service/ApiOrderDetail";
import apiOrder from "../../service/ApiOrder";

const InformationCustomer = () => {
  const [selectedTab, setSelectedTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({});

  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    getUserInfo();
    getOrderInfo();
  }, []);

  const getUserInfo = () => {
    const userDataCookie = Cookies.get("userDataReal");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);
      setCustomerInfo(parsedUserData[0]);
      console.log(parsedUserData[0]);
    }
  };

  const getOrderInfo = () => {
    const userDataCookie = Cookies.get("userDataReal");
    const parsedUserData = JSON.parse(userDataCookie);

    apiOrder
      .get(
        "/ByUserId?userId=" +
          parsedUserData[0].id +
          "&pageIndex=1&pageSize=1000"
      )
      .then((response) => {
        setOrders(response.data);
        console.log(response.data);
      });
  };

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

    apiOrderDetail.get("/Order/" + order.id).then((response) => {
      setOrderDetails(response.data);
      console.log(response.data);
    });
  };

  const ViewDetails = () => {
    apiOrderDetail.get("/Order/" + selectedOrder.id).then((response) => {
      setOrderDetails(response.data);
      console.log(response.data);
    });
  };

  const closeDetails = () => {
    setSelectedOrder(null);
  };

  const handleEditAvatar = () => {};

  const filteredOrders = orders.filter((order) => {
    return filterStatus === "all" || order.status === filterStatus;
  });

  const handleExtendRental = (order) => {};
  const handleReturnOrderDetail = (order) => {
    var tmp = order;
    tmp.status = "returning";

    apiOrderDetail.put("/" + order.id, tmp).then((response) => {
      ViewDetails();
    });
  };
  // const handleFinishOrderDetail = (order) => {
  //   var tmp = order;
  //   tmp.status = "finish";

  //   apiOrderDetail.put("/" + order.id, tmp).then((response) => {
  //     ViewDetails();
  //   });
  // };

  const handleCancelOrder = (order) => {
    var tmp = order;
    tmp.status = "Cancel";

    apiOrderDetail.put("/" + order.id, tmp).then((response) => {
      ViewDetails();
    });
  };
  const handleReBuy = (order) => {};

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
                onClick={() => handleFilterChange("Inactive")}
                className={`p-2 rounded ${
                  filterStatus === "Inactive"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Chờ xác nhận
              </button>
              <button
                onClick={() => handleFilterChange("Active")}
                className={`p-2 rounded ${
                  filterStatus === "Active"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang vận chuyển
              </button>
              <button
                onClick={() => handleFilterChange("Progress")}
                className={`p-2 rounded ${
                  filterStatus === "Progress"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang thực hiện
              </button>

              <button
                onClick={() => handleFilterChange("Finish")}
                className={`p-2 rounded ${
                  filterStatus === "Finish"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Hoàn thành
              </button>
              <button
                onClick={() => handleFilterChange("Cancel")}
                className={`p-2 rounded ${
                  filterStatus === "Cancel"
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
                    <h4 className="font-semibold">Đặt hàng từ:</h4>
                    <span className="font-medium">{order.status}</span>
                  </div>
                  <hr className="border-gray-300 mb-2" />
                  <div className="flex items-center mb-2">
                    <div className="flex-grow">
                      <p className="font-semibold">
                        Ngày đặt hàng:{" "}
                        {new Date(order.orderDate).toISOString().split("T")[0]}
                      </p>
                      <p>Địa chỉ nhận hàng: {order.receiveAddress}</p>
                      <p>Tên người nhận: {order.receiveName}</p>
                      <p>Số điện thoại: {order.receivePhone}</p>
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
                      Tổng tiền: {order.totalPrice.toLocaleString()} VNĐ
                    </p>

                    {order.status === "Cancel" && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleReBuy(order)}
                          className="p-2 bg-green-500 text-white rounded"
                        >
                          Đặt hàng lại
                        </button>
                      </div>
                    )}
                    {order.status === "Inactive" && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleCancelOrder(order)}
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

    const stages = ["renting", "await", "returning", "finish"];
    const getStatusIndex = (status) => stages.indexOf(status);

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
                <strong>Ngày đặt:</strong>{" "}
                {new Date(selectedOrder.orderDate).toISOString().split("T")[0]}
              </p>
              <p>
                <strong>Tình trạng:</strong> {selectedOrder.status}
              </p>

              <p>
                <strong>Địa chỉ nhận hàng:</strong>{" "}
                {selectedOrder.receiveAddress}
              </p>
              <p>
                <strong>Tên người nhận:</strong> {selectedOrder.receiveName}
              </p>

              <p>
                <strong>Số điện thoại:</strong> {selectedOrder.receivePhone}
              </p>

              <p>
                <strong>Tổng tiền:</strong>{" "}
                {(selectedOrder.totalPrice || 0).toLocaleString()} VNĐ
              </p>
            </div>
          </div>

          {/* Right side: OrderDetails */}
          <div className="w-1/2 p-4">
            <h3 className="text-lg font-semibold">Chi tiết đơn hàng</h3>
            <ul className="space-y-4 mt-4 overflow-y-auto max-h-[700px] w-full px-4 py-4 text-lg">
              {orderDetails.map((item) => {
                const currentIndex = getStatusIndex(item.status);

                return (
                  <li
                    key={item.id}
                    className="p-4 border border-gray-300 rounded-lg flex flex-col"
                  >
                    {item.quantity === -1 && (
                      <div>
                        <div className="flex items-center mb-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover mr-4"
                          />
                          <div className="flex-grow">
                            <h4 className="font-semibold">{item.toyName}</h4>
                            <p>
                              Giá cọc: {(item.unitPrice || 0).toLocaleString()}{" "}
                              VNĐ
                            </p>

                            <p>
                              Giá thuê: {(item.rentPrice || 0).toLocaleString()}{" "}
                              VNĐ
                            </p>
                            <p>
                              Ngày thuê:{" "}
                              {
                                new Date(item.startDate)
                                  .toISOString()
                                  .split("T")[0]
                              }
                            </p>
                            <p>
                              Ngày trả hàng:{" "}
                              {
                                new Date(item.endDate)
                                  .toISOString()
                                  .split("T")[0]
                              }
                            </p>
                          </div>
                          {item.status === "await" && (
                            <div>
                              <button
                                className="flex items-center mb-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow hover:bg-green-600 transition duration-200 ease-in-out"
                                onClick={() => handleExtendRental(item)}
                              >
                                Thuê tiếp
                              </button>
                              <button
                                className="flex items-center mb-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                                onClick={() => handleReturnOrderDetail(item)}
                              >
                                Trả hàng
                              </button>
                            </div>
                          )}
                          {/* {item.status === "returning" && (
                            <div>
                              <button
                                className="flex items-center mb-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                                onClick={() => handleFinishOrderDetail(item)}
                              >
                                Đã trả hàng
                              </button>
                            </div>
                          )} */}
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
                                {stage === "renting" && (
                                  <div className="text-sm">Đang thuê</div>
                                )}
                                {stage === "await" && (
                                  <div className="text-sm">Chờ trả hàng</div>
                                )}
                                {stage === "returning" && (
                                  <div className="text-sm">Đang trả hàng</div>
                                )}
                                {stage === "finish" && (
                                  <div className="text-sm">Hoàn thành</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {item.quantity >= 1 && (
                      <div className="flex items-center mb-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover mr-4"
                        />
                        <div className="flex-grow">
                          <h4 className="font-semibold">{item.toyName}</h4>
                          <p>
                            Giá đồ chơi:{" "}
                            {(item.unitPrice || 0).toLocaleString()} VNĐ
                          </p>

                          <p>Số lượng: {item.quantity}</p>

                          <p>
                            Tổng:{" "}
                            {(
                              item.unitPrice * item.quantity || 0
                            ).toLocaleString()}{" "}
                            VNĐ
                          </p>
                        </div>
                      </div>
                    )}
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
