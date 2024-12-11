import React, { useState, useEffect } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie
import apiOrderDetail from "../../service/ApiOrderDetail";
import apiOrder from "../../service/ApiOrder";
import { useNavigate } from "react-router-dom";
import apiWallets from "../../service/ApiWallets";
import apiWalletTransaction from "../../service/ApiWalletTransaction";
import apiUser from "../../service/ApiUser";
import apiTransaction from "../../service/ApiTransaction";
import apiTransactionDetail from "../../service/ApiTransactionDetail";
import apiToys from "../../service/ApiToys";
import apiRatings from "../../service/ApiRatings";

const InformationCustomer = () => {
  const [selectedTab, setSelectedTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({});

  const [ordersRent, setOrdersRent] = useState([]);
  const [ordersSale, setOrdersSale] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);

  const [walletInfo, setWalletInfo] = useState({});
  const [walletTransaction, setWalletTransaction] = useState({});
  const [walletTransactionMinus, setWalletTransactionMinus] = useState({});
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [reviews, setReviews] = useState([]);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (Cookies.get("userToken")) {
      getUserInfo();
      getOrderInfo();
    } else {
      navigate("/Login");
    }
  }, []);

  const getUserInfo = () => {
    const userDataCookie = Cookies.get("userDataReal");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);
      setCustomerInfo(parsedUserData);
      console.log(parsedUserData);

      apiWallets
        .get("/" + parsedUserData.walletId, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        })
        .then((response) => {
          setWalletInfo(response.data);
        });
      apiWalletTransaction
        .get(
          "/ByWalletId?walletId=" +
            parsedUserData.walletId +
            "&pageIndex=1&pageSize=100",
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        )
        .then((response) => {
          setWalletTransaction(
            response.data.filter((transaction) => transaction.amount >= 0)
          );
          setWalletTransactionMinus(
            response.data.filter((transaction) => transaction.amount < 0)
          );
          console.log(parsedUserData.walletId);
        });
    }
  };

  const getOrderInfo = () => {
    const userDataCookie = Cookies.get("userDataReal");
    const parsedUserData = JSON.parse(userDataCookie);

    apiOrder
      .get(
        "/ByUserId?userId=" + parsedUserData.id + "&pageIndex=1&pageSize=1000",
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      )
      .then((response) => {
        setOrdersRent(
          response.data.orders.filter((order) => order.rentPrice > 0)
        );

        setOrdersSale(
          response.data.orders.filter((order) => order.rentPrice == 0)
        );
        console.log(response.data.orders);
      });
  };

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStatus2, setFilterStatus2] = useState("all");

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
    if (newPassword != "" && confirmNewPassword != "" && oldPassword != "") {
      if (oldPassword == customerInfo.password) {
        if (newPassword == confirmNewPassword) {
          apiUser
            .get(
              "/" +
                customerInfo.id +
                "?fullName=" +
                customerInfo.fullName +
                "&email=" +
                customerInfo.email +
                "&password=" +
                newPassword +
                "&createDate=" +
                customerInfo.createDate +
                "&phone=" +
                customerInfo.phone +
                "&dob=" +
                customerInfo.dob +
                "&address=" +
                customerInfo.address +
                "&roleId=" +
                customerInfo.role.id +
                "&status=" +
                customerInfo.status,
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            )
            .then((response) => {
              setIsEditing(false);
              alert("Mật khẩu và thông tin của bạn đã được cập nhật.");
            });
        } else {
          alert("Mật khẩu xác nhận không mật khẩu mới.");
          return;
        }
      } else {
        alert("Bạn đã nhập sai mật khẩu cũ.");
        return;
      }
    } else {
      apiUser
        .get(
          "/" +
            customerInfo.id +
            "?fullName=" +
            customerInfo.fullName +
            "&email=" +
            customerInfo.email +
            "&password=" +
            customerInfo.password +
            "&createDate=" +
            customerInfo.createDate +
            "&phone=" +
            customerInfo.phone +
            "&dob=" +
            customerInfo.dob +
            "&address=" +
            customerInfo.address +
            "&roleId=" +
            customerInfo.role.id +
            "&status=" +
            customerInfo.status,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        )
        .then((response) => {
          setIsEditing(false);
          alert("Thông tin của bạn đã được cập nhật.");
          console.log(response.data);
          console.log(customerInfo);
        });
    }
  };

  const handleInputChangeOldPassword = (e) => {
    setOldPassword(e);
  };

  const handleInputChangeNewPassword = (e) => {
    setNewPassword(e);
  };

  const handleInputChangeConfirmNewPassword = (e) => {
    setConfirmNewPassword(e);
  };

  const handleCancel = () => {
    getUserInfo();
    setIsEditing(false);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleFilterChange2 = (status) => {
    setFilterStatus2(status);
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile)); // Hiển thị ảnh ngay lập tức

      // Gửi ảnh lên API ngay khi người dùng chọn ảnh
      if (customerInfo.id) {
        const formData = new FormData();
        formData.append("userImage", selectedFile);

        try {
          const response = await apiUser.put(
            `/update-user-image/${customerInfo.id}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );

          await apiUser.get("/" + customerInfo.id).then((response) => {
            console.log(response.data);

            setCustomerInfo(response.data);
            Cookies.set("userDataReal", JSON.stringify(response.data), {
              expires: 7,
            });
          });

          console.log("Cập nhật ảnh thành công:", response.data);
          setImageUrl(response.data.avatarUrl); // Cập nhật lại URL ảnh mới từ API
          window.location.reload();
        } catch (error) {
          console.error("Lỗi khi cập nhật ảnh:", error);
        }
      } else {
        console.error("Không có userId.");
      }
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);

    apiOrderDetail
      .get("/Order/" + order.id, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        setOrderDetails(response.data);
        console.log(response.data);

        setReviews(
          response.data.reduce((acc, product) => {
            acc[product.id] = { rating: 1, review: "" };
            return acc;
          }, {})
        );
      });
  };

  const ViewDetails = () => {
    apiOrderDetail.get("/Order/" + selectedOrder.id).then((response) => {
      setOrderDetails(response.data);
      setReviews(
        response.data.reduce((acc, product) => {
          acc[product.id] = { rating: 1, review: "" };
          return acc;
        }, {})
      );
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
    setSelectedOrder(null);
  };

  const handleEditAvatar = () => {};

  const filteredOrdersRent = ordersRent.filter((order) => {
    return filterStatus === "all" || order.status === filterStatus;
  });

  const filteredOrdersSale = ordersSale.filter((order) => {
    return filterStatus2 === "all" || order.status === filterStatus2;
  });

  const handleExtendRental = (order) => {};
  const handleReturnOrderDetail = (order) => {
    var tmp = order;
    tmp.status = "Delivering";

    apiOrderDetail
      .put("/" + order.id, tmp, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        ViewDetails();
      });
  };

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
      JSON.stringify("Sold"), // Adjust the key as per API requirements
      {
        headers: {
          "Content-Type": "application/json", // Specify the correct Content-Type
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }
    );

    await apiToys
      .get("/" + order.toyId, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then(async (response) => {
        await apiUser
          .get("/" + response.data.owner.id, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          })
          .then(async (response1) => {
            console.log(response1.data);
            const userTmp = response1.data;
            await apiWallets
              .get("/" + userTmp.walletId, {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              })
              .then(async (response2) => {
                const walletTmp = response2.data;
                console.log(walletTmp.id);
                await apiWallets.put(
                  "/" + walletTmp.id,
                  {
                    balance: walletTmp.balance + order.deposit * 0.85,
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
                    amount: parseInt(order.deposit * 0.85),
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
      });

    await apiTransaction
      .get("?pageIndex=1&pageSize=1000", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then(async (response1) => {
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
                platformFee: order.unitPrice * 0.15,
                ownerReceiveMoney: order.unitPrice * 0.85,
                depositBackMoney: 0,
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
                  platformFee: order.unitPrice * 0.15,
                  ownerReceiveMoney: order.unitPrice * 0.85,
                  depositBackMoney: 0,
                  status: "ToyBroke",
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
                  transactionTmp[0].platformFee + order.unitPrice * 0.15,
                ownerReceiveMoney:
                  transactionTmp[0].ownerReceiveMoney + order.unitPrice * 0.85,
                depositBackMoney: transactionTmp[0].depositBackMoney,
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
                  platformFee: order.unitPrice * 0.15,
                  ownerReceiveMoney: order.unitPrice * 0.85,
                  depositBackMoney: 0,
                  status: "ToyBroke",
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
    ViewDetails();
  };

  const handleCancelOrder = (order) => {
    var tmp = order;
    tmp.status = "Cancel";

    apiOrder
      .put("/" + order.id, tmp, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        ViewDetails();
      });
  };
  const handleReBuy = (order) => {};

  const handleCompleteSaleOrder = async (orderToUpdate) => {
    try {
      const ownerWalletResponse = await apiWallets.get(
        `/${orderToUpdate.shopId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      const ownerWallet = ownerWalletResponse.data;

      const amountToAdd = orderToUpdate.totalPrice * 0.85;

      const updatedWallet = {
        ...ownerWallet,
        balance: ownerWallet.balance + amountToAdd,
      };

      await apiWallets.put(`/${ownerWallet.id}`, updatedWallet, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await apiWalletTransaction.post(
        "",
        {
          transactionType: "Nhận tiền từ đơn hàng ",
          amount: parseInt(amountToAdd),
          date: new Date().toISOString(),
          walletId: ownerWallet.id,
          paymentTypeId: 5,
          orderId: orderToUpdate.id,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      await apiOrder.put(
        `/${orderToUpdate.id}`,
        {
          ...orderToUpdate,
          status: "Complete",
          receiveDate: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      await apiTransaction
        .post(
          "",
          {
            receiveMoney: orderToUpdate.totalPrice,
            platformFee: orderToUpdate.totalPrice * 0.15,
            ownerReceiveMoney: orderToUpdate.totalPrice * 0.85,
            depositBackMoney: 0,
            status: "Success",
            orderId: orderToUpdate.id,
          },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        )
        .then(async (response) => {
          console.log(response.data);

          await apiOrderDetail
            .get("/Order/" + orderToUpdate.id, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            })
            .then((response2) => {
              response2.data.map(async (item) => {
                console.log(item);
                var Tmp = item;
                Tmp.status = "Complete";
                await apiOrderDetail
                  .put("/" + item.id, Tmp, {
                    headers: {
                      Authorization: `Bearer ${Cookies.get("userToken")}`,
                    },
                  })
                  .then((response) => {
                    ViewDetails();
                  });
                await apiTransactionDetail.post(
                  "",
                  {
                    receiveMoney: item.unitPrice * item.quantity,
                    platformFee: item.unitPrice * item.quantity * 0.15,
                    ownerReceiveMoney: item.unitPrice * item.quantity * 0.85,
                    depositBackMoney: 0,
                    status: "Success",
                    orderDetailId: item.id,
                    transactionId: response.data.id,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${Cookies.get("userToken")}`,
                    },
                  }
                );
              });
            });
        });

      getOrderInfo();

      alert("Đơn hàng đã được hoàn tất.");
    } catch (error) {
      console.error("Lỗi khi hoàn tất đơn hàng:", error);
      alert("Đã xảy ra lỗi khi xử lý đơn hàng.");
    }
  };

  const handleFinishDeliveryOrder = (order) => {
    var tmp = order;
    tmp.status = "Processing";

    tmp.receiveDate = new Date().toISOString();
    apiOrder
      .put("/" + order.id, tmp, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        apiOrderDetail
          .get("/Order/" + order.id, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          })
          .then((response) => {
            response.data.map((item) => {
              var tmp = item;
              tmp.status = "Processing";
              tmp.startDate = new Date().toISOString();
              if (tmp.orderTypeId == "4") {
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + 7);
                tmp.endDate = currentDate.toISOString();
              } else if (tmp.orderTypeId == "5") {
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + 14);
                tmp.endDate = currentDate.toISOString();
              } else if (tmp.orderTypeId == "6") {
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + 30);
                tmp.endDate = currentDate.toISOString();
              }
              apiOrderDetail
                .put("/" + item.id, tmp, {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("userToken")}`,
                  },
                })
                .then((response) => {
                  getOrderInfo();
                });
            });
          });
      });
  };
  const handleRatingChange = (productId, rating) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const handleReviewChange = (productId, review) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], review },
    }));
  };

  const handleSubmitReview = async (e, productId, item) => {
    e.preventDefault();
    const reviewData = reviews[productId];
    console.log("Đánh giá cho sản phẩm:", productId, reviewData);

    await apiRatings
      .post(
        "",
        {
          comment: reviewData.review,
          star: reviewData.rating,
          userId: customerInfo.id,
          orderDetailId: productId,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      )
      .then(async (response) => {
        await apiOrderDetail
          .put(
            "/" + item.id,
            {
              rentPrice: item.rentPrice,
              deposit: item.deposit,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              startDate: item.startDate,
              endDate: item.endDate,
              status: item.status,
              orderId: item.orderId,
              toyId: item.toyId,
              orderTypeId: item.orderTypeId,
              ratingId: response.data.id,
            },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          )
          .then((response) => {
            ViewDetails();
          });
      });

    alert(`Cảm ơn bạn đã đánh giá sản phẩm ${productId}`);
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
                    <p className="font-semibold w-4/10">Mật khẩu cũ:</p>
                    <input
                      type="password"
                      name="password"
                      onChange={(e) =>
                        handleInputChangeOldPassword(e.target.value)
                      }
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>
                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">Mật khẩu mới:</p>
                    <input
                      type="password"
                      name="password"
                      onChange={(e) =>
                        handleInputChangeNewPassword(e.target.value)
                      }
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>
                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">
                      Xác nhận mật khẩu mới:
                    </p>
                    <input
                      type="password"
                      name="password"
                      onChange={(e) =>
                        handleInputChangeConfirmNewPassword(e.target.value)
                      }
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
                    src={
                      customerInfo && customerInfo.avatarUrl
                        ? customerInfo.avatarUrl
                        : ""
                    }
                    alt="User Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <input
                    type="file"
                    accept=".jpg, .png"
                    onChange={handleFileChange} // Gọi hàm xử lý khi người dùng chọn file
                    className="hidden"
                    id="fileInput"
                  />
                  <button
                    className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                    onClick={() => document.getElementById("fileInput").click()} // Mở input file khi click nút này
                  >
                    Chọn Ảnh
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case "ordersRent":
        return (
          <div>
            <h3 className="text-lg font-semibold">
              Danh sách đơn hàng thuê đồ chơi
            </h3>
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
              {filteredOrdersRent.map((order) => (
                <li
                  key={order.id}
                  className="p-4 border border-gray-300 rounded-lg"
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">
                      Đặt hàng từ: {order.shopName}
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
                    {order.status === "Delivering" && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleFinishDeliveryOrder(order)}
                          className="p-2 bg-green-500 text-white rounded"
                        >
                          Đã nhận hàng
                        </button>
                      </div>
                    )}
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
                    {order.status === "Pending" && (
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

      case "ordersSale":
        return (
          <div>
            <h3 className="text-lg font-semibold">
              Danh sách đơn hàng mua đồ chơi
            </h3>
            <div className="flex mb-4">
              <button
                onClick={() => handleFilterChange2("all")}
                className={`p-2 rounded ${
                  filterStatus2 === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Tất cả
              </button>

              <button
                onClick={() => handleFilterChange2("Delivering")}
                className={`p-2 rounded ${
                  filterStatus2 === "Delivering"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang vận chuyển
              </button>

              <button
                onClick={() => handleFilterChange2("Complete")}
                className={`p-2 rounded ${
                  filterStatus2 === "Complete"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Hoàn thành
              </button>
              <button
                onClick={() => handleFilterChange2("Cancel")}
                className={`p-2 rounded ${
                  filterStatus2 === "Cancel"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đã hủy
              </button>
            </div>
            <ul className="space-y-4">
              {filteredOrdersSale.map((order) => (
                <li
                  key={order.id}
                  className="p-4 border border-gray-300 rounded-lg"
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">
                      Đặt hàng từ: {order.shopName}
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
                    {order.status === "Delivering" && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleCompleteSaleOrder(order)}
                          className="p-2 bg-green-500 text-white rounded"
                        >
                          Đã nhận được hàng
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );

      case "wallet":
        return (
          <div className="p-4">
            {/* Phần trên: Thông tin tài khoản */}
            <div className="bg-gray-100 p-4 rounded shadow mb-4">
              <h2 className="text-xl font-semibold mb-2">
                Thông tin tài khoản
              </h2>
              <p>
                <strong>Số dư khả dụng:</strong>{" "}
                {(walletInfo.balance || 0).toLocaleString()} VNĐ
              </p>
              <p>
                <strong>Số tài khoản:</strong> {walletInfo.withdrawInfo}
              </p>
              <p>
                <strong>Ngân hàng:</strong> {walletInfo.withdrawMethod}
              </p>
            </div>

            {/* Phần dưới: Lịch sử giao dịch */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Lịch sử giao dịch</h2>
              {walletTransaction.length > 0 ? (
                <div className="flex items-start mb-10">
                  {/* WalletTransaction - Danh sách giao dịch dương */}
                  <ul className="space-y-4 w-1/2">
                    {walletTransaction.map((transaction) => (
                      <li
                        key={transaction.id}
                        className="p-4 border border-gray-300 rounded-lg"
                        style={{ backgroundColor: "#61eb34" }}
                      >
                        <div className="flex justify-between mb-2">
                          <h4 className="font-semibold">
                            {transaction.transactionType}{" "}
                            {transaction.orderId != null
                              ? " " + transaction.orderId
                              : ""}{" "}
                          </h4>
                          <span className="font-medium">
                            {transaction.amount >= 0
                              ? "+" + (transaction.amount || 0).toLocaleString()
                              : (transaction.amount || 0).toLocaleString()}{" "}
                            VNĐ
                          </span>
                        </div>

                        <div className="flex items-center mb-2">
                          <p className="font-semibold">
                            Ngày giao dịch :{" "}
                            {
                              new Date(transaction.date)
                                .toISOString()
                                .split("T")[0]
                            }
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Đường kẻ phân chia */}
                  <div className="border-l border-gray-400 h-auto mx-2"></div>

                  {/* WalletTransaction - Danh sách giao dịch âm */}
                  <ul className="space-y-4 w-1/2">
                    {walletTransactionMinus.map((transaction) => (
                      <li
                        key={transaction.id}
                        className="p-4 border border-gray-300 rounded-lg"
                        style={{ backgroundColor: "#f75e5e" }}
                      >
                        <div className="flex justify-between mb-2">
                          <h4 className="font-semibold">
                            {transaction.transactionType}{" "}
                            {transaction.orderId != null
                              ? " " + transaction.orderId
                              : ""}{" "}
                          </h4>
                          <span className="font-medium">
                            {transaction.amount >= 0
                              ? "+" + (transaction.amount || 0).toLocaleString()
                              : (transaction.amount || 0).toLocaleString()}{" "}
                            VNĐ
                          </span>
                        </div>

                        <div className="flex items-center mb-2">
                          <p className="font-semibold">
                            Ngày giao dịch :{" "}
                            {
                              new Date(transaction.date)
                                .toISOString()
                                .split("T")[0]
                            }
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>Không có giao dịch nào.</p>
              )}
            </div>
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
                    {item.quantity == -1 && (
                      <div>
                        <div className="flex items-center mb-2">
                          <img
                            src={
                              item.toyImgUrls[0] && item.toyImgUrls[0]
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
                          {item.status === "Expired" && (
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
                          {item.status === "DeliveringToUser" && (
                            <div>
                              <button
                                className="flex items-center mb-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                                onClick={() => handleFinishOrderDetail(item)}
                              >
                                Đã nhận hàng
                              </button>
                            </div>
                          )}
                          {item.ratingId == null &&
                            item.status == "Complete" && (
                              <div>
                                <form
                                  onSubmit={(e) =>
                                    handleSubmitReview(e, item.id, item)
                                  }
                                  className="flex items-center space-x-6 mt-4"
                                >
                                  {/* Chọn số sao */}
                                  <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-700">
                                      Đánh giá:
                                    </label>
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          className={`text-2xl ${
                                            star <= reviews[item.id].rating
                                              ? "text-yellow-400"
                                              : "text-gray-300"
                                          } transition-colors duration-200 ease-in-out`}
                                          onClick={() =>
                                            handleRatingChange(item.id, star)
                                          }
                                        >
                                          ★
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Nội dung đánh giá */}
                                  <div className="flex-1">
                                    <textarea
                                      value={reviews[item.id].review}
                                      onChange={(e) =>
                                        handleReviewChange(
                                          item.id,
                                          e.target.value
                                        )
                                      }
                                      rows="2"
                                      className="w-full px-4 py-8 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                      placeholder="Nhập nội dung đánh giá..."
                                      required
                                    ></textarea>
                                  </div>

                                  {/* Nút gửi đánh giá */}
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow hover:bg-green-600 transition duration-200 ease-in-out"
                                  >
                                    Gửi
                                  </button>
                                </form>
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

                                {stage == "DeliveringToShop" && (
                                  <div className="text-sm">Đồ chơi tốt</div>
                                )}
                                {stage == "DeliveringToUser" && (
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
                          src={item.toyImgUrls[0]}
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
                        {item.ratingId == null && item.status == "Complete" && (
                          <div>
                            <form
                              onSubmit={(e) =>
                                handleSubmitReview(e, item.id, item)
                              }
                              className="flex items-center space-x-6 mt-4"
                            >
                              {/* Chọn số sao */}
                              <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Đánh giá:
                                </label>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      className={`text-2xl ${
                                        star <= reviews[item.id].rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      } transition-colors duration-200 ease-in-out`}
                                      onClick={() =>
                                        handleRatingChange(item.id, star)
                                      }
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Nội dung đánh giá */}
                              <div className="flex-1">
                                <textarea
                                  value={reviews[item.id].review}
                                  onChange={(e) =>
                                    handleReviewChange(item.id, e.target.value)
                                  }
                                  rows="2"
                                  className="w-full px-4 py-8 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Nhập nội dung đánh giá..."
                                  required
                                ></textarea>
                              </div>

                              {/* Nút gửi đánh giá */}
                              <button
                                type="submit"
                                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow hover:bg-green-600 transition duration-200 ease-in-out"
                              >
                                Gửi
                              </button>
                            </form>
                          </div>
                        )}
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
              onClick={() => setSelectedTab("ordersRent")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "ordersRent" ? "bg-gray-300" : ""
              }`}
            >
              Đơn hàng thuê của tôi
            </button>
            <button
              onClick={() => setSelectedTab("ordersSale")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "ordersSale" ? "bg-gray-300" : ""
              }`}
            >
              Đơn hàng mua của tôi
            </button>
            <button
              onClick={() => setSelectedTab("wallet")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${
                selectedTab === "wallet" ? "bg-gray-300" : ""
              }`}
            >
              Ví tiền
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
