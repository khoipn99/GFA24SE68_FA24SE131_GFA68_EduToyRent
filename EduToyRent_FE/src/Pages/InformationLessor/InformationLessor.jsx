import React, { useState, useEffect } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie
import apiOrderDetail from "../../service/ApiOrderDetail";
import apiOrder from "../../service/ApiOrder";
import apiToys from "../../service/ApiToys";
import apiCategory from "../../service/ApiCategory";
import apiMedia from "../../service/ApiMedia";
import { useNavigate } from "react-router-dom";
import apiWallets from "../../service/ApiWallets";
import apiWalletTransaction from "../../service/ApiWalletTransaction";
import apiUser from "../../service/ApiUser";
import apiTransaction from "../../service/ApiTransaction";
import apiTransactionDetail from "../../service/ApiTransactionDetail";

const InformationLessor = () => {
  const [selectedTab, setSelectedTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [customerInfo, setCustomerInfo] = useState({});

  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const navigate = useNavigate();

  // Sample data for orders
  useEffect(() => {
    if (Cookies.get("userToken")) {
      getUserInfo();
      getOrderInfo();
      getProductInfo();
      getCategoryInfo();
    } else {
      navigate("/Login");
    }
  }, []);

  const getUserInfo = () => {
    const userDataCookie = Cookies.get("userDataReal");
    if (userDataCookie) {
      var parsedUserData;
      try {
        parsedUserData = JSON.parse(userDataCookie);
        setCustomerInfo(parsedUserData); // Adjust based on your app's logic
        console.log("Parsed user data:", parsedUserData);
      } catch (error) {
        console.error("Error parsing userDataCookie:", error);
      }
    } else {
      console.warn("Cookie 'userDataReal' is missing or undefined.");
    }
  };

  const getCategoryInfo = () => {
    apiCategory.get("?pageIndex=1&pageSize=50").then((response) => {
      setCategories(response.data);
    });
  };

  const getOrderInfo = () => {
    const userDataCookie = Cookies.get("userDataReal");
    const parsedUserData = JSON.parse(userDataCookie);

    apiOrder
      .get("/ByShop?shopId=" + parsedUserData.id + "&pageIndex=1&pageSize=1000")
      .then((response) => {
        setOrders(response.data);
        console.log(response.data);
      });
  };

  const [products, setProducts] = useState([]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getProductInfo = () => {
    const userDataCookie = Cookies.get("userDataReal");
    const parsedUserData = JSON.parse(userDataCookie);

    apiToys
      .get("/user/" + parsedUserData.id + "?pageIndex=1&pageSize=1000")
      .then((response) => {
        setProducts(response.data);
        console.log(response.data);
      });
  };

  const handleProductFilterChange = (filter) => {
    setProductFilter(filter);
    setCurrentPage(1);
  };

  const filteredProducts = products.filter((product) => {
    return productFilter === "all" || product.status === productFilter;
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

      var tmp = true;
      response.data.map((item) => {
        if (item.status != "Complete") {
          tmp = false;
        }
      });

      if (tmp) {
        var orderTmp = selectedOrder;
        orderTmp.status = "Complete";

        apiOrder.put("/" + selectedOrder.id, orderTmp).then((response) => {
          getOrderInfo();
        });
      }
    });
  };

  const closeDetails = () => {
    setSelectedOrder(null); // Close the order details view
  };

  const filteredOrders = orders.filter((order) => {
    return filterStatus === "all" || order.status === filterStatus;
  });

  const handleFinishOrderDetail = async (order) => {
    var tmp = order;
    tmp.status = "Complete";

    await apiOrderDetail.put("/" + order.id, tmp, {
      headers: {
        Authorization: `Bearer ${Cookies.get("userToken")}`,
      },
    });

    await apiToys.patch(
      `/${order.toyId}/update-status`,
      JSON.stringify("Active"), // Adjust the key as per API requirements
      {
        headers: {
          "Content-Type": "application/json", // Specify the correct Content-Type
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }
    );

    await apiUser
      .get("/" + selectedOrder.userId, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then(async (response) => {
        console.log(response.data);
        const userTmp = response.data;
        await apiWallets
          .get("/" + userTmp.walletId, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          })
          .then(async (response2) => {
            const walletTmp = response2.data;
            console.log(walletTmp);
            await apiWallets.put(
              "/" + walletTmp.id,
              {
                balance: walletTmp.balance + (order.deposit - order.rentPrice),
                withdrawMethod: walletTmp.withdrawMethod,
                withdrawInfo: walletTmp.withdrawInfo,
                status: walletTmp.status,
                userId: walletTmp.userId,
              },
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            );
            await apiWalletTransaction.post(
              "",
              {
                transactionType: "Nhận lại tiền cọc",
                amount: parseInt(order.deposit - order.rentPrice),
                date: new Date().toISOString(),
                walletId: walletTmp.id,
                paymentTypeId: 5,
                orderId: selectedOrder.id,
              },
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            );
          });
      });

    await apiWallets
      .get("/" + customerInfo.walletId, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then(async (response2) => {
        const walletTmp = response2.data;
        console.log(walletTmp);
        await apiWallets.put(
          "/" + walletTmp.id,
          {
            balance: walletTmp.balance + order.rentPrice * 0.85,
            withdrawMethod: walletTmp.withdrawMethod,
            withdrawInfo: walletTmp.withdrawInfo,
            status: walletTmp.status,
            userId: walletTmp.userId,
          },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        );

        await apiWalletTransaction.post(
          "",
          {
            transactionType: "Nhận tiền từ đơn hàng",
            amount: parseInt(order.rentPrice * 0.85),
            date: new Date().toISOString(),
            walletId: customerInfo.walletId,
            paymentTypeId: 5,
            orderId: selectedOrder.id,
          },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        );
      });

    await apiTransaction
      .get("?pageIndex=1&pageSize=1000", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then(async (response1) => {
        ViewDetails();
        const transactionTmp = response1.data.filter(
          (transaction) => transaction.order.id == selectedOrder.id
        );
        console.log(transactionTmp);

        if (transactionTmp == "") {
          await apiTransaction
            .post(
              "",
              {
                receiveMoney: order.unitPrice,
                platformFee: order.rentPrice * 0.15,
                ownerReceiveMoney: order.rentPrice * 0.85,
                depositBackMoney: order.unitPrice - order.rentPrice,
                status: "Success",
                orderId: selectedOrder.id,
              },
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            )
            .then(async (response) => {
              console.log(response.data);

              console.log(order);
              await apiTransactionDetail.post(
                "",
                {
                  receiveMoney: order.unitPrice,
                  platformFee: order.rentPrice * 0.15,
                  ownerReceiveMoney: order.rentPrice * 0.85,
                  depositBackMoney: order.unitPrice - order.rentPrice,
                  status: "ToyGood",
                  orderDetailId: order.id,
                  transactionId: response.data.id,
                },
                {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("userToken")}`,
                  },
                }
              );
            });
        } else {
          await apiTransaction
            .put(
              "/" + transactionTmp[0].id,
              {
                receiveMoney: transactionTmp[0].receiveMoney + order.unitPrice,
                platformFee:
                  transactionTmp[0].platformFee + order.rentPrice * 0.15,
                ownerReceiveMoney:
                  transactionTmp[0].ownerReceiveMoney + order.rentPrice * 0.85,
                depositBackMoney:
                  transactionTmp[0].depositBackMoney +
                  (order.unitPrice - order.rentPrice),
                status: "Success",
                orderId: selectedOrder.id,
              },
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            )
            .then(async (response) => {
              console.log(response.data);

              console.log(order);
              await apiTransactionDetail.post(
                "",
                {
                  receiveMoney: order.unitPrice,
                  platformFee: order.rentPrice * 0.15,
                  ownerReceiveMoney: order.rentPrice * 0.85,
                  depositBackMoney: order.unitPrice - order.rentPrice,
                  status: "ToyGood",
                  orderDetailId: order.id,
                  transactionId: transactionTmp[0].id,
                },
                {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("userToken")}`,
                  },
                }
              );
            });
        }
      });
  };

  const handleAcceptOrder = (order) => {
    var tmp = order;
    tmp.status = "Delivering";

    apiOrder.put("/" + order.id, tmp).then((response) => {
      getOrderInfo();
    });
  };

  const handleCancelOrder = (order) => {
    var tmp = order;
    tmp.status = "Cancel";

    console.log(order.userId);

    apiOrder.put("/" + order.id, tmp).then((response) => {
      getOrderInfo();
    });

    apiUser
      .get("/" + order.userId, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        const userTmp = response.data;
        apiWallets
          .get("/" + userTmp.walletId, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          })
          .then((response2) => {
            const walletTmp = response2.data;
            console.log(walletTmp.id);
            apiWallets.put(
              "/" + walletTmp.id,
              {
                balance: walletTmp.balance + order.totalPrice,
                withdrawMethod: walletTmp.withdrawMethod,
                withdrawInfo: walletTmp.withdrawInfo,
                status: walletTmp.status,
                userId: walletTmp.userId,
              },
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            );
            apiWalletTransaction.post(
              "",
              {
                transactionType: "Nhận lại tiền cọc",
                amount: parseInt(order.totalPrice),
                date: new Date().toISOString(),
                walletId: walletTmp.id,
                paymentTypeId: 5,
                orderId: order.id,
              },
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            );
          });
      });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    buyQuantity: -1,
    origin: "",
    age: "",
    brand: "",
    categoryId: 1,
    rentCount: 0,
    quantitySold: 0,
    status: "Inactive",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const [newImage, setNewImage] = useState([]);
  const [newImage2, setNewImage2] = useState([]);
  const [newImage3, setNewImage3] = useState([]);
  const [newImage4, setNewImage4] = useState([]);
  const [newImage5, setNewImage5] = useState([]);
  const [newVideo, setNewVideo] = useState([]);

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleImageChange2 = (e) => {
    setNewImage2(e.target.files[0]);
  };

  const handleImageChange3 = (e) => {
    setNewImage3(e.target.files[0]);
  };
  const handleImageChange4 = (e) => {
    setNewImage4(e.target.files[0]);
  };
  const handleImageChange5 = (e) => {
    setNewImage5(e.target.files[0]);
  };
  const handleVideo = (e) => {
    setNewVideo(e.target.files[0]);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newVideo == "") {
      alert("Bạn chưa chọn video để xác thực đồ chơi");
      return;
    }
    apiToys
      .post("", newProduct, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        var formData = new FormData();

        formData.append(`mediaUrls`, newImage);
        formData.append(`mediaUrls`, newImage2);
        formData.append(`mediaUrls`, newImage3);
        formData.append(`mediaUrls`, newImage4);
        formData.append(`mediaUrls`, newImage5);
        formData.append(`mediaUrls`, newVideo);

        apiMedia
          .post("/upload-toy-media/" + response.data.id, formData, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          })
          .then((response) => {
            setNewProduct({
              name: "",
              description: "",
              price: 0,
              buyQuantity: -1,
              origin: "",
              age: "",
              brand: "",
              categoryId: 1,
              rentCount: 0,
              quantitySold: 0,
              status: "Inactive",
            });
            setNewVideo([]);
            setNewImage([]);
            setNewImage2([]);
            setNewImage3([]);
            setNewImage4([]);
            setNewImage5([]);
            getProductInfo();
          });
      });

    console.log("New product:", newProduct);
    closeModal();
  };

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editedProduct, setEditedProduct] = useState(null);

  useEffect(() => {
    if (
      selectedProduct &&
      selectedProduct.media &&
      selectedProduct.media.length > 0
    ) {
      setSelectedMedia(selectedProduct.media[0].mediaUrl); // Đặt ảnh/video đầu tiên làm mặc định
    }
  }, [selectedProduct]);
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
    console.log(editedProduct);

    apiToys
      .put("/" + editedProduct.id, {
        name: editedProduct.name,
        description: editedProduct.description,
        price: editedProduct.price,
        buyQuantity: editedProduct.buyQuantity,
        origin: editedProduct.origin,
        age: editedProduct.age,
        brand: editedProduct.brand,
        categoryId: editedProduct.category.id,
        rentCount: editedProduct.rentCount,
        rentTime: editedProduct.rentTime,
      })
      .then((response) => {
        getProductInfo();
      });

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

  const handleChangeCategory = (event) => {
    const selectedCategoryId = event.target.value;
    const selectedCategory = categories.find(
      (category) => category.id === parseInt(selectedCategoryId)
    );

    setEditedProduct((prevProduct) => ({
      ...prevProduct,
      category: selectedCategory,
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
                onClick={() => handleFilterChange("Pending")}
                className={`p-2 rounded ${
                  filterStatus === "Pending"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Chờ xác nhận
              </button>
              <button
                onClick={() => handleFilterChange("Delivering")}
                className={`p-2 rounded ${
                  filterStatus === "Delivering"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang vận chuyển
              </button>
              <button
                onClick={() => handleFilterChange("Processing")}
                className={`p-2 rounded ${
                  filterStatus === "Processing"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang thực hiện
              </button>

              <button
                onClick={() => handleFilterChange("Complete")}
                className={`p-2 rounded ${
                  filterStatus === "Complete"
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
                    <h4 className="font-semibold">
                      Người đặt hàng: {order.userName}
                    </h4>
                    <span className="font-medium">
                      {order.status == "Pending"
                        ? "Đợi người cho thuê chấp nhận đơn hàng"
                        : order.status == "Delivering"
                        ? "Đang giao hàng"
                        : order.status == "Processing"
                        ? "Đơn hàng đang thuê"
                        : "Hoàn thành"}
                    </span>
                  </div>
                  <hr className="border-gray-300 mb-2" />
                  <div className="flex items-center mb-2">
                    <div className="flex-grow">
                      <p className="font-semibold">
                        Ngày đặt hàng:{" "}
                        {new Date(order.orderDate).toISOString().split("T")[0]}
                      </p>
                      <p>Địa chỉ giao hàng: {order.receiveAddress}</p>
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

                    {order.status === "Pending" && (
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="p-2 bg-red-500 text-white rounded"
                          >
                            Hủy đơn hàng
                          </button>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleAcceptOrder(order)}
                            className="p-2 bg-green-500 text-white rounded"
                          >
                            Xác nhận đơn hàng
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
                <div className="bg-white p-6 rounded shadow-lg w-120">
                  <h3 className="text-lg font-semibold mb-4">
                    Thêm Sản Phẩm Mới
                  </h3>
                  <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    {/* Phần thông tin đồ chơi */}
                    <div style={{ flex: 1, paddingRight: "20px" }}>
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
                          name="description"
                          value={newProduct.description}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded p-1 w-full"
                          required
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
                          required
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
                          required
                        />
                      </label>
                      <label className="block mb-2">
                        Tuổi:
                        <select
                          type="text"
                          name="age"
                          value={newProduct.age}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded p-1 w-full"
                          required
                        >
                          <option key="1" value="1-3">
                            1-3
                          </option>
                          <option key="2" value="3-5">
                            3-5
                          </option>
                          <option key="3" value="5-7">
                            5-7
                          </option>
                          <option key="4" value="7-9">
                            7-9
                          </option>
                          <option key="5" value="9-11">
                            9-11
                          </option>
                          <option key="6" value="11-13">
                            11-13
                          </option>
                          <option key="7" value="13+">
                            13+
                          </option>
                        </select>
                      </label>
                      <label className="block mb-2">
                        Hãng:
                        <input
                          type="text"
                          name="brand"
                          value={newProduct.brand}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded p-1 w-full"
                          required
                        />
                      </label>
                      <label className="block mb-2">
                        Loại đồ chơi:
                        <select
                          name="categoryId"
                          value={newProduct.categoryId}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded p-1 w-full"
                        >
                          {categories.map((category, index) => (
                            <option key={index} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {/* Phần đăng hình ảnh và video */}
                    <div style={{ flex: 1 }}>
                      <label className="block mb-2">
                        Hình ảnh:
                        <input
                          type="file"
                          onChange={handleImageChange}
                          className="border border-gray-300 rounded p-1 w-full"
                          accept="image/*"
                        />
                      </label>
                      <label className="block mb-2">
                        Hình ảnh 2:
                        <input
                          type="file"
                          onChange={handleImageChange2}
                          className="border border-gray-300 rounded p-1 w-full"
                          accept="image/*"
                        />
                      </label>
                      <label className="block mb-2">
                        Hình ảnh 3:
                        <input
                          type="file"
                          onChange={handleImageChange3}
                          className="border border-gray-300 rounded p-1 w-full"
                          accept="image/*"
                        />
                      </label>
                      <label className="block mb-2">
                        Hình ảnh 4:
                        <input
                          type="file"
                          onChange={handleImageChange4}
                          className="border border-gray-300 rounded p-1 w-full"
                          accept="image/*"
                        />
                      </label>
                      <label className="block mb-2">
                        Hình ảnh 5:
                        <input
                          type="file"
                          onChange={handleImageChange5}
                          className="border border-gray-300 rounded p-1 w-full"
                          accept="image/*"
                        />
                      </label>
                      <label className="block mb-2">
                        Video xác thực đồ chơi:
                        <input
                          type="file"
                          onChange={handleVideo}
                          className="border border-gray-300 rounded p-1 w-full"
                          accept="video/*"
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
                    </div>

                    {/* Các nút gửi và đóng */}
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
                onClick={() => handleProductFilterChange("Inactive")}
                className={`p-2 rounded ${
                  productFilter === "Inactive"
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
              {currentProducts.map((product) => (
                <li
                  key={product.id}
                  className="p-4 border border-gray-300 rounded-lg flex items-center"
                >
                  <img
                    src={
                      product.media && product.media[0].mediaUrl
                        ? product.media[0].mediaUrl
                        : ""
                    }
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
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-16 rounded-2xl shadow-2xl max-w-7xl w-full h-[70%] overflow-auto relative">
                  {isEditMode ? (
                    <>
                      <input
                        name="name"
                        value={editedProduct.name}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Tên đồ chơi"
                        required
                      />
                      <input
                        name="price"
                        value={editedProduct.price}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Giá"
                        type="number"
                        required
                      />

                      <textarea
                        name="description"
                        value={editedProduct.description}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Chi tiết"
                        required
                      />
                      <select
                        name="age"
                        value={editedProduct.age}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Tuổi"
                        type="text"
                        required
                      >
                        <option key="1" value="1-3">
                          1-3
                        </option>
                        <option key="2" value="3-5">
                          3-5
                        </option>
                        <option key="3" value="5-7">
                          5-7
                        </option>
                        <option key="4" value="7-9">
                          7-9
                        </option>
                        <option key="5" value="9-11">
                          9-11
                        </option>
                        <option key="6" value="11-13">
                          11-13
                        </option>
                        <option key="7" value="13+">
                          13+
                        </option>
                      </select>
                      <input
                        name="brand"
                        value={editedProduct.brand}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Hãng"
                        required
                      />
                      <select
                        name="category"
                        value={editedProduct.category.id}
                        onChange={handleChangeCategory}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                      >
                        {categories.map((category, index) => (
                          <option key={index} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <input
                        name="origin"
                        value={editedProduct.origin}
                        onChange={handleChange}
                        className="mb-2 w-full p-2 border border-gray-300 rounded"
                        placeholder="Nguồn gốc"
                        required
                      />
                      <button
                        onClick={handleSaveClick}
                        className="mt-4 p-2 bg-green-500 text-white rounded"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={closeDetailModal}
                        className="p-2 bg-red-500 text-white rounded"
                      >
                        Đóng
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap lg:flex-nowrap gap-10">
                        {/* Phần hình ảnh */}
                        <div className="flex-1 flex justify-center items-center flex-col max-w-md mx-auto mt-20">
                          {/* Hiển thị ảnh hoặc video */}
                          <div className="w-80 h-80">
                            {selectedMedia &&
                            selectedProduct.media.some(
                              (media) => media.mediaUrl === selectedMedia
                            ) ? (
                              selectedMedia.endsWith(".mp4?alt=media") ? (
                                <video
                                  src={selectedMedia}
                                  controls
                                  className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                                />
                              ) : (
                                <img
                                  src={selectedMedia}
                                  alt="Media"
                                  className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                                />
                              )
                            ) : null}
                          </div>

                          {/* Ảnh/video nhỏ */}
                          <div className="flex gap-4 flex-wrap justify-center mt-4">
                            {" "}
                            {/* Giữ cho các ảnh nhỏ xếp dưới ảnh lớn */}
                            {selectedProduct.media.map((media, index) => (
                              <div
                                key={index}
                                className="flex flex-col items-center"
                              >
                                {/* Hiển thị video nếu media là video */}
                                {media.mediaUrl.endsWith(".mp4?alt=media") ? (
                                  <video
                                    src={media.mediaUrl}
                                    alt={`Video ${index + 1}`}
                                    className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-transform duration-200 
              ${
                selectedMedia === media.mediaUrl
                  ? "border-orange-500 scale-105"
                  : "border-gray-300"
              }`}
                                    onClick={() =>
                                      setSelectedMedia(media.mediaUrl)
                                    } // Cập nhật media khi chọn video
                                  />
                                ) : (
                                  // Hiển thị ảnh nếu media là ảnh
                                  <img
                                    src={media.mediaUrl}
                                    alt={`Hình ảnh ${index + 1}`}
                                    className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-transform duration-200 
              ${
                selectedMedia === media.mediaUrl
                  ? "border-orange-500 scale-105"
                  : "border-gray-300"
              }`}
                                    onClick={() =>
                                      setSelectedMedia(media.mediaUrl)
                                    } // Cập nhật media khi chọn ảnh
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Phần thông tin */}
                        <div className="flex-1 text-xl space-y-6">
                          <div className="flex justify-between items-center mb-10">
                            <h2 className="text-4xl font-bold text-center">
                              Thông tin đồ chơi
                            </h2>
                            <button
                              onClick={closeDetailModal}
                              className="p-2 bg-red-500 text-white rounded"
                            >
                              Đóng
                            </button>
                          </div>

                          <p>
                            <strong>Tên đồ chơi:</strong> {selectedProduct.name}
                          </p>
                          <p>
                            <strong>Giá:</strong>{" "}
                            {(selectedProduct.price || 0).toLocaleString()} VNĐ
                          </p>
                          <p>
                            <strong>Xuất xứ:</strong> {selectedProduct.origin}
                          </p>
                          <p>
                            <strong>Tuổi:</strong> {selectedProduct.age}
                          </p>

                          <p>
                            <strong>Thương Hiệu:</strong>{" "}
                            {selectedProduct.brand}
                          </p>
                          <p>
                            <strong>Danh mục:</strong>{" "}
                            {selectedProduct.category.name}
                          </p>
                          <p>
                            <strong>Ngày tạo:</strong>{" "}
                            {new Date(
                              selectedProduct.createDate
                            ).toLocaleDateString()}
                          </p>
                          {(selectedProduct.status === "Inactive" ||
                            selectedProduct.status === "Active") && (
                            <button
                              onClick={handleEditClick}
                              className="mt-4 p-2 bg-yellow-500 text-white rounded"
                            >
                              Sửa sản phẩm
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
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
          </div>
        );
      default:
        return null;
    }
  };

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    const stages = [
      "Processing",
      "Expired",
      "Delivering",
      "Checking",
      "DeliveringToShop",
      "DeliveringToUser",
      "Complete",
    ];
    const getStatusIndex = (status) => stages.indexOf(status);

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-lg relative w-5/6 flex">
          {/* Left side: Order information */}
          <div className="w-1/4 p-4 border-r border-gray-300">
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
          <div className="w-3/4 p-4">
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
                            src={
                              item.toyImgUrls && item.toyImgUrls[0]
                                ? item.toyImgUrls[0]
                                : ""
                            }
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
                              {item.startDate
                                ? new Date(item.startDate)
                                    .toISOString()
                                    .split("T")[0]
                                : "Đang chờ"}
                            </p>
                            <p>
                              Ngày trả hàng:{" "}
                              {item.endDate
                                ? new Date(item.endDate)
                                    .toISOString()
                                    .split("T")[0]
                                : "Đang chờ"}
                            </p>
                          </div>

                          {item.status === "DeliveringToShop" && (
                            <div>
                              <button
                                className="flex items-center mb-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                                onClick={() => handleFinishOrderDetail(item)}
                              >
                                Đã nhận hàng
                              </button>
                            </div>
                          )}
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
                                {stage === "Processing" && (
                                  <div className="text-sm">Đang thuê</div>
                                )}
                                {stage === "Expired" && (
                                  <div className="text-sm">Chờ trả hàng</div>
                                )}
                                {stage === "Delivering" && (
                                  <div className="text-sm">
                                    Giao hàng tới kho đánh giá
                                  </div>
                                )}

                                {stage === "Checking" && (
                                  <div className="text-sm">Đang đánh giá</div>
                                )}

                                {stage === "DeliveringToShop" && (
                                  <div className="text-sm">Đồ chơi tốt</div>
                                )}
                                {stage === "DeliveringToUser" && (
                                  <div className="text-sm">Đồ chơi bị hỏng</div>
                                )}
                                {stage === "Complete" && (
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
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "white",
        }}
      >
        <HeaderForCustomer />
      </header>
      <main className="flex flex-grow justify-center py-4">
        <div className="flex w-3/4 bg-white shadow-md rounded-lg">
          <div className="w-1/4 p-4">
            <h2 className="text-lg font-semibold mb-4">
              Cửa hàng cho thuê của tôi
            </h2>
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
              Doanh thu
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
