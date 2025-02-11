import React, { useState, useEffect, useMemo } from "react";
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
import apiOrderCheckImages from "../../service/ApiOrderCheckImages";
import ChatForm from "../Chat/ChatForm";

import apiPlatformFees from "../../service/ApiPlatfromFees";
import apiOrderTypes from "../../service/ApiOrderTypes";
import apiReport from "../../service/ApiReport";
import apiRatingImage from "../../service/ApiRatingImage";

const InformationCustomer = () => {
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 10MB
  const [selectedTab, setSelectedTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({});

  const [ordersRent, setOrdersRent] = useState([]);
  const [ordersSale, setOrdersSale] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);

  const [walletInfo, setWalletInfo] = useState({});
  const [walletTransaction, setWalletTransaction] = useState({});
  const [walletTransactionPlus, setWalletTransactionPlus] = useState({});
  const [walletTransactionMinus, setWalletTransactionMinus] = useState({});
  const [oldPassword, setOldPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isEditing2, setIsEditing2] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [openImage, setOpenImage] = useState("");
  const [openVideoReturn, setOpenVideoReturn] = useState([]);
  const [openVideoReview, setOpenVideoReview] = useState([]);
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);
  const [isReportFormVisible, setIsReportFormVisible] = useState(false);
  const [isContinueFormVisible, setIsContinueFormVisible] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [orderType, setOrderType] = useState([]);
  const [platformFee, setPlatformFee] = useState([]);
  const [continueRent, setContinueRent] = useState(0);
  const [continueRentTime, setContinueRentTime] = useState(0);

  useEffect(() => {
    const userDataCookie1 = Cookies.get("userData");
    if (userDataCookie1) {
      const parsedUserData = JSON.parse(userDataCookie1);

      if (parsedUserData.roleId == 4) {
        navigate("/staff");
      } else if (parsedUserData.roleId == 1) {
        navigate("/admin");
      } else if (parsedUserData.roleId == 2) {
        navigate("/toySupplier");
      } else if (parsedUserData == "") {
        navigate("/login");
      }
    }

    if (Cookies.get("userToken")) {
      getUserInfo();
      getOrderInfo();
    } else {
      navigate("/Login");
    }
  }, []);

  // const getUserInfo = () => {
  //   const userDataCookie = Cookies.get("userDataReal");
  //   if (userDataCookie) {
  //     const parsedUserData = JSON.parse(userDataCookie);

  //     setCustomerInfo(parsedUserData);
  //     console.log(parsedUserData);

  //     apiWallets
  //       .get("/" + parsedUserData.walletId, {
  //         headers: {
  //           Authorization: `Bearer ${Cookies.get("userToken")}`,
  //         },
  //       })
  //       .then((response) => {
  //         setWalletInfo(response.data);
  //         setFormData({
  //           balance: response.data.balance || 0,
  //           withdrawInfo: response.data.withdrawInfo || "",
  //           withdrawMethod: response.data.withdrawMethod || "",
  //         });
  //       });
  //     apiWalletTransaction
  //       .get(
  //         "/ByWalletId?walletId=" +
  //           parsedUserData.walletId +
  //           "&pageIndex=1&pageSize=100",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${Cookies.get("userToken")}`,
  //           },
  //         }
  //       )
  //       .then((response) => {
  //         setWalletTransaction(
  //           response.data.filter((transaction) => transaction.amount >= 0)
  //         );
  //         setWalletTransactionMinus(
  //           response.data.filter((transaction) => transaction.amount < 0)
  //         );
  //         console.log(parsedUserData.walletId);
  //       });
  //   }
  // };
  const getUserInfo = () => {
    const userDataCookie = Cookies.get("userDataReal");

    if (userDataCookie) {
      try {
        const parsedUserData = JSON.parse(userDataCookie);

        setCustomerInfo(parsedUserData);
        setName(parsedUserData.fullName);
        setAddress(parsedUserData.address);
        setDob(parsedUserData.dob);
        setPhone(parsedUserData.phone);
        console.log("Parsed User Data:", parsedUserData);

        // Kiểm tra nếu walletId tồn tại
        if (!parsedUserData.walletId) {
          console.error("Wallet ID is missing.");
          return;
        }

        // Gọi API lấy thông tin ví
        apiWallets
          .get("/" + parsedUserData.walletId, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          })
          .then((response) => {
            console.log("Wallet Info Response:", response.data);
            setWalletInfo(response.data);
            setFormData({
              balance: response.data.balance || 0,
              withdrawInfo: response.data.withdrawInfo || "",
              withdrawMethod: response.data.withdrawMethod || "",
            });
          })
          .catch((error) => {
            handleApiError(error, "Fetching wallet info failed.");
          });

        // Gọi API lấy giao dịch ví
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
            console.log("Wallet Transaction Response:", response.data);
            setWalletTransaction(response.data);

            setWalletTransactionPlus(
              response.data.filter((transaction) => transaction.amount >= 0)
            );

            setWalletTransactionMinus(
              response.data.filter((transaction) => transaction.amount < 0)
            );
          })
          .catch((error) => {
            handleApiError(error, "Fetching wallet transactions failed.");
          });
      } catch (err) {
        console.error("Failed to parse user data from cookie:", err.message);
      }
    } else {
      console.error("User data cookie is missing.");
    }
  };

  const handleApiError = (error, customMessage) => {
    if (error.response) {
      console.error(
        customMessage,
        error.response.data || error.response.status
      );
    } else if (error.request) {
      console.error(customMessage, "No response received from server.");
    } else {
      console.error(customMessage, error.message);
    }
  };
  const getOrderInfo = () => {
    const userDataCookie = Cookies.get("userDataReal");
    const parsedUserData = JSON.parse(userDataCookie);

    apiOrderTypes
      .get("?pageIndex=1&pageSize=20", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        setOrderType(response.data);

        console.log(response.data);
      });

    apiPlatformFees
      .get("?pageIndex=1&pageSize=20", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        setPlatformFee(response.data);

        console.log(response.data);
      });

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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleWithdraw = async () => {
    const numericAmount = parseInt(withdrawAmount.replace(/\./g, ""), 10);
    if (walletInfo.balance >= numericAmount) {
      // Logic xử lý số tiền rút
      console.log("Số tiền rút:", numericAmount);
      await apiWallets.put(
        "/" + walletInfo.id,
        {
          balance: walletInfo.balance - numericAmount,
          withdrawMethod: walletInfo.withdrawMethod,
          withdrawInfo: walletInfo.withdrawInfo,
          status: walletInfo.status,
          userId: walletInfo.userId,
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
          transactionType: "Rút tiền",
          amount: -numericAmount,
          date: new Date().toISOString(),
          walletId: walletInfo.id,
          paymentTypeId: 5,
          orderId: null,
          status: "Await",
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      alert(
        `Bạn đã gửi yêu cầu rút ${numericAmount.toLocaleString()} VNĐ thành công!`
      );
      window.location.reload();
      setIsFormVisible(false); // Ẩn form sau khi rút
    } else {
      alert(`Tài khoản của bạn không đủ để thực hiện rút tiền!`);
    }
  };

  const handleSaveChanges = () => {
    if (newPassword != "" && confirmNewPassword != "" && oldPassword != "") {
      if (oldPassword == customerInfo.password) {
        if (newPassword == confirmNewPassword) {
          apiUser
            .put(
              "/" +
                customerInfo.id +
                "?fullName=" +
                name +
                "&email=" +
                customerInfo.email +
                "&password=" +
                confirmNewPassword +
                "&createDate=" +
                customerInfo.createDate +
                "&phone=" +
                phone +
                "&dob=" +
                dob +
                "&address=" +
                address +
                "&roleId=" +
                customerInfo.role.id +
                "&status=" +
                customerInfo.status +
                "&description=" +
                customerInfo.description +
                "&walletId=" +
                customerInfo.walletId,
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            )
            .then((response) => {
              setIsEditing(false);
              apiUser
                .get("/" + customerInfo.id, {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("userToken")}`,
                  },
                })
                .then((response2) => {
                  Cookies.set("userDataReal", JSON.stringify(response2.data), {
                    expires: 7,
                  });
                  alert("Mật khẩu và Thông tin của bạn đã được cập nhật.");

                  window.location.reload();
                });
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
        .put(
          "/" +
            customerInfo.id +
            "?fullName=" +
            name +
            "&email=" +
            customerInfo.email +
            "&password=" +
            customerInfo.password +
            "&createDate=" +
            customerInfo.createDate +
            "&phone=" +
            phone +
            "&dob=" +
            dob +
            "&address=" +
            address +
            "&roleId=" +
            customerInfo.role.id +
            "&status=" +
            customerInfo.status +
            "&description=" +
            customerInfo.description +
            "&walletId=" +
            customerInfo.walletId,

          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        )
        .then((response) => {
          setIsEditing(false);
          apiUser
            .get("/" + customerInfo.id, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            })
            .then((response2) => {
              Cookies.set("userDataReal", JSON.stringify(response2.data), {
                expires: 7,
              });
              alert("Thông tin của bạn đã được cập nhật.");

              window.location.reload();
            });
        });
    }
  };

  const handleFileChange2 = (event, fieldName, index) => {
    console.log(index);

    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước tệp
    if (fieldName === "video" && !file.type.startsWith("video/")) {
      alert("Vui lòng chỉ thả video vào ô này.");
      return;
    }

    if (fieldName === "video" && file.size > MAX_VIDEO_SIZE) {
      alert("Video phải có kích thước tối đa 10MB.");
      return;
    }

    setOpenVideoReturn((prev) => {
      const updatedVideos = [...(prev[fieldName] || [])];
      updatedVideos[index] = file;
      return { ...prev, [fieldName]: updatedVideos };
    });
    console.log(openVideoReturn.video);
  };

  const handleFileChangeReview = (event, fieldName, index) => {
    console.log(index);

    const file = event.target.files[0];
    if (!file) return;

    if (fieldName === "video" && file.size > MAX_VIDEO_SIZE) {
      alert("Video phải có kích thước tối đa 10MB.");
      return;
    }

    setOpenVideoReview(file);
    console.log(openVideoReturn.video);
  };

  const handleDropReview = (event, fieldName, index) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (fieldName === "video" && file.size > MAX_VIDEO_SIZE) {
      alert("Video phải có kích thước bé hơn 10MB.");
      return;
    }

    // Nếu hợp lệ, cập nhật hoặc thêm video vào danh sách dựa trên index
    setOpenVideoReview(file);
    console.log(openVideoReturn.video);
  };

  const handleDrop = (event, fieldName, index) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (fieldName === "video" && !file.type.startsWith("video/")) {
      alert("Vui lòng chỉ thả video vào ô này.");
      return;
    }

    if (fieldName === "video" && file.size > MAX_VIDEO_SIZE) {
      alert("Video phải có kích thước bé hơn 10MB.");
      return;
    }

    // Nếu hợp lệ, cập nhật hoặc thêm video vào danh sách dựa trên index
    setOpenVideoReturn((prev) => {
      const updatedVideos = [...(prev[fieldName] || [])];
      updatedVideos[index] = file; // Ghi đè tại vị trí index
      return { ...prev, [fieldName]: updatedVideos };
    });
    console.log(openVideoReturn.video);
  };

  const handleInputChangeName = (e) => {
    setName(e);
  };
  const handleInputChangeAddress = (e) => {
    setAddress(e);
  };
  const handleInputChangePhone = (e) => {
    setPhone(e);
  };
  const handleInputChangeDob = (e) => {
    setDob(e);
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

          await apiUser
            .get("/" + customerInfo.id, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            })
            .then((response) => {
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

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);

    await apiOrderDetail
      .get("/Order/" + order.id, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then(async (response) => {
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
    apiOrderDetail
      .get("/Order/" + selectedOrder.id, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
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

          apiOrder
            .put("/" + selectedOrder.id, orderTmp, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            })
            .then((response) => {
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
    return filterStatus == "all" || order.status == filterStatus;
  });

  const filteredOrdersSale = ordersSale.filter((order) => {
    return filterStatus2 == "all" || order.status == filterStatus2;
  });

  const handleInputChange2 = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();

    await apiWallets
      .put(
        "/" + walletInfo.id,
        {
          balance: walletInfo.balance,
          withdrawMethod: formData.withdrawMethod,
          withdrawInfo: formData.withdrawInfo,
          status: walletInfo.status,
          userId: walletInfo.userId,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      )
      .then((response) => {
        setIsEditing2(false);
      });

    getUserInfo();
  };

  const handleExtendRental = async (item) => {
    console.log(continueRent);
    console.log(continueRentTime);

    var tmp3 = item;
    tmp3.status = "Processing";
    tmp3.rentCount = item.rentCount + 1;

    tmp3.rentPrice = item.rentPrice + continueRent;

    const endDate = new Date(item.endDate);
    const newEndDate = new Date(endDate);
    newEndDate.setDate(endDate.getDate() + continueRentTime);
    tmp3.endDate = newEndDate.toISOString();
    console.log(tmp3);

    await apiOrderDetail
      .put("/" + item.id, tmp3, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        setIsContinueFormVisible(false);
        ViewDetails();
      });
  };

  const handleContinueRent = async (price, time) => {
    var totalRentPriceTmp = 0;
    orderType.map((item2, index) => {
      if (time == item2.id) {
        totalRentPriceTmp += price * item2.percentPrice;
      }
    });
    setContinueRent(totalRentPriceTmp);
    if (time == 4) {
      setContinueRentTime(7);
    } else if (time == 5) {
      setContinueRentTime(14);
    } else if (time == 6) {
      setContinueRentTime(30);
    }
  };

  const handleReturnOrderDetail = (order, index) => {
    if (
      openVideoReturn &&
      Array.isArray(openVideoReturn.video) &&
      openVideoReturn.video[index] != null
    ) {
      var formData = new FormData();

      formData.append(`checkImageUrls`, openVideoReturn.video[index]);

      apiOrderCheckImages
        .post("?orderDetailId=" + order.id + "&status=Success", formData, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        })
        .then((response) => {
          var tmp = order;
          tmp.status = "Delivering";
          tmp.endDate = new Date().toISOString();
          apiOrderDetail
            .put("/" + order.id, tmp, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            })
            .then((response) => {
              ViewDetails();
            });
        });
    } else {
      alert("bạn chưa chọn video của đồ chơi trước khi trả hàng !");
    }
  };

  const handleReturnSoon = (order, index) => {
    if (
      openVideoReturn &&
      Array.isArray(openVideoReturn.video) &&
      openVideoReturn.video[index] != null
    ) {
      var formData = new FormData();

      formData.append(`checkImageUrls`, openVideoReturn.video[index]);

      apiOrderCheckImages
        .post("?orderDetailId=" + order.id + "&status=Success", formData, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        })
        .then((response) => {
          var tmp = order;
          tmp.status = "Delivering";
          tmp.endDate = new Date().toISOString();
          apiOrderDetail
            .put("/" + order.id, tmp, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            })
            .then((response) => {
              ViewDetails();
            });
        });
    } else {
      alert("bạn chưa chọn video của đồ chơi trước khi trả hàng !");
    }
  };

  const handleBuyToy = async (order) => {
    var tmp = order;
    tmp.status = "Complete";

    await apiOrderDetail.put("/" + order.id, tmp, {
      headers: {
        Authorization: `Bearer ${Cookies.get("userToken")}`,
      },
    });

    await apiToys
      .get("/" + order.toyId, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then(async (response) => {
        const updatedToy = {
          name: response.data.name || "Default Toy Name",
          description: response.data.description || "Default Description",
          price: response.data.price || "0",
          buyQuantity: response.data.buyQuantity || "0",
          origin: response.data.origin || "Default Origin",
          age: response.data.age || "All Ages",
          brand: response.data.brand || "Default Brand",
          categoryId: response.data.category.id || "1", // Nếu không có selectedCategory thì dùng mặc định

          rentCount: response.data.rentCount || "0",
          quantitySold: response.data.quantitySold || "0",
          status: "Sold",
        };

        await apiToys.put(`/${order.toyId}`, updatedToy, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });

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
                    balance:
                      walletTmp.balance +
                      order.deposit * (1 - platformFee[0].percent),
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
                    amount: parseInt(
                      order.deposit * (1 - platformFee[0].percent)
                    ),
                    date: new Date().toISOString(),
                    walletId: walletTmp.id,
                    paymentTypeId: 5,
                    orderId: selectedOrder.id,
                    status: "Success",
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
                platformFee: order.unitPrice * platformFee[0].percent,
                ownerReceiveMoney:
                  order.unitPrice * (1 - platformFee[0].percent),
                depositBackMoney: 0,
                status: "Success",
                orderId: selectedOrder.id,
                fineFee: 0,
                date: new Date().toISOString(),
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
                  platformFee: order.unitPrice * platformFee[0].percent,
                  ownerReceiveMoney:
                    order.unitPrice * (1 - platformFee[0].percent),
                  depositBackMoney: 0,
                  status: "ToyBroke",
                  orderDetailId: order.id,
                  transactionId: response.data.id,
                  platformFeeId: 1,
                  fineFee: 0,
                  date: new Date().toISOString(),
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
                  transactionTmp[0].platformFee +
                  order.unitPrice * platformFee[0].percent,
                ownerReceiveMoney:
                  transactionTmp[0].ownerReceiveMoney +
                  order.unitPrice * (1 - platformFee[0].percent),
                depositBackMoney: transactionTmp[0].depositBackMoney,
                status: "Success",
                orderId: selectedOrder.id,
                fineFee: transactionTmp[0].fineFee,
                date: new Date().toISOString(),
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
                  platformFee: order.unitPrice * platformFee[0].percent,
                  ownerReceiveMoney:
                    order.unitPrice * (1 - platformFee[0].percent),
                  depositBackMoney: 0,
                  status: "ToyBroke",
                  orderDetailId: order.id,
                  transactionId: transactionTmp[0].id,
                  platformFeeId: 1,
                  fineFee: 0,
                  date: new Date().toISOString(),
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

  const handleReport = async (order, index) => {
    var tmp = order;
    tmp.status = "StaffCheck";

    await apiOrderDetail.put("/" + order.id, tmp, {
      headers: {
        Authorization: `Bearer ${Cookies.get("userToken")}`,
      },
    });

    await apiReport.post(
      "",
      {
        videoUrl: order.orderCheckImageUrl[0],
        description: reportDescription,
        status: "Await",
        orderDetailId: order.id,
        userId: customerInfo.id,
      },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }
    );
    ViewDetails();
  };

  const handleFinishOrderDetail = async (order) => {
    const unitPrice = parseFloat(order.unitPrice);
    const rentPrice = parseFloat(order.rentPrice);
    const platformfee = parseFloat(platformFee[0].percent);
    const fee = parseFloat(order.fine);

    var tmp = order;
    tmp.status = "Complete";

    await apiOrderDetail.put("/" + order.id, tmp, {
      headers: {
        Authorization: `Bearer ${Cookies.get("userToken")}`,
      },
    });

    await apiToys
      .get("/" + order.toyId, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then(async (response) => {
        const updatedToy = {
          name: response.data.name || "Default Toy Name",
          description: response.data.description || "Default Description",
          price: response.data.price || "0",
          buyQuantity: response.data.buyQuantity || "0",
          origin: response.data.origin || "Default Origin",
          age: response.data.age || "All Ages",
          brand: response.data.brand || "Default Brand",
          categoryId: response.data.category.id || "1", // Nếu không có selectedCategory thì dùng mặc định

          rentCount: response.data.rentCount + 1 || "0",
          quantitySold: response.data.quantitySold || "0",
          status: "Active",
        };

        await apiToys.put(`/${order.toyId}`, updatedToy, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });

        await apiWallets
          .get("/" + customerInfo.walletId, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          })
          .then(async (response3) => {
            const walletTmp = response3.data;
            console.log(walletTmp.id);
            const result1 = parseInt(unitPrice - (rentPrice + fee));

            await apiWallets.put(
              "/" + walletTmp.id,
              {
                balance: walletTmp.balance + result1,
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
                amount: parseInt(result1),
                date: new Date().toISOString(),
                walletId: walletTmp.id,
                paymentTypeId: 5,
                orderId: selectedOrder.id,
                status: "Success",
              },
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            );
          });

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

                const result3 = rentPrice * (1 - platformfee) + fee;

                await apiWallets.put(
                  "/" + walletTmp.id,
                  {
                    balance: walletTmp.balance + result3,
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
                    amount: parseInt(result3),
                    date: new Date().toISOString(),
                    walletId: walletTmp.id,
                    paymentTypeId: 5,
                    orderId: selectedOrder.id,
                    status: "Success",
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
          const result4 = rentPrice * (1 - platformfee) + fee;
          const result5 = unitPrice - (rentPrice + fee);

          await apiTransaction
            .post(
              "",
              {
                receiveMoney: order.unitPrice,
                platformFee: order.rentPrice * platformFee[0].percent,
                ownerReceiveMoney: result4,
                depositBackMoney: result5,
                status: "Success",
                orderId: selectedOrder.id,
                fineFee: order.fine,
                date: new Date().toISOString(),
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
                  platformFee: order.rentPrice * platformFee[0].percent,
                  ownerReceiveMoney: result4,
                  depositBackMoney: result5,
                  status: "Success",
                  orderDetailId: order.id,
                  transactionId: response.data.id,
                  platformFeeId: 1,
                  fineFee: order.fine,
                  date: new Date().toISOString(),
                },
                {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("userToken")}`,
                  },
                }
              );
            });
        } else {
          const result6 = rentPrice * (1 - platformfee) + fee;
          const result7 = unitPrice - (rentPrice + fee);

          await apiTransaction
            .put(
              "/" + transactionTmp[0].id,
              {
                receiveMoney: transactionTmp[0].receiveMoney + order.unitPrice,
                platformFee:
                  transactionTmp[0].platformFee +
                  order.rentPrice * platformFee[0].percent,
                ownerReceiveMoney:
                  transactionTmp[0].ownerReceiveMoney + result6,
                depositBackMoney: transactionTmp[0].depositBackMoney + result7,
                status: "Success",
                orderId: selectedOrder.id,
                fineFee: transactionTmp[0].fineFee + order.fine,
                date: new Date().toISOString(),
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
                  platformFee: order.rentPrice * platformFee[0].percent,
                  ownerReceiveMoney: result6,
                  depositBackMoney: result7,
                  status: "Success",
                  orderDetailId: order.id,
                  transactionId: transactionTmp[0].id,
                  platformFeeId: 1,
                  fineFee: order.fine,
                  date: new Date().toISOString(),
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

  const handleCancelOrder = async (order) => {
    const isConfirmed = window.confirm("Bạn có chắc muốn hủy đơn hàng này");

    if (!isConfirmed) {
      return;
    }

    var tmp = order;
    tmp.status = "Cancel";

    console.log(order.userId);

    await apiOrder.put("/" + order.id, tmp, {
      headers: {
        Authorization: `Bearer ${Cookies.get("userToken")}`,
      },
    });

    await apiUser
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

            apiWalletTransaction.post(
              "",
              {
                transactionType: "Nhận lại tiền cọc",
                amount: parseInt(order.totalPrice),
                date: new Date().toISOString(),
                walletId: walletTmp.id,
                paymentTypeId: 5,
                orderId: order.id,
                status: "Success",
              },
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            );
            apiOrderDetail.get("/Order/" + order.id).then((response) => {
              apiWallets
                .put(
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
                )
                .then((response) => {
                  window.location.reload();
                });
            });
          });
      });
  };

  const handleReBuy = async (order) => {
    const isConfirmed = window.confirm("Bạn có chắc muốn đăt lại đơn hàng này");

    if (!isConfirmed) {
      return;
    }

    var tmp = order;
    tmp.status = "Pending";

    console.log(order.userId);

    await apiOrder.put("/" + order.id, tmp, {
      headers: {
        Authorization: `Bearer ${Cookies.get("userToken")}`,
      },
    });

    await apiUser
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

            apiWalletTransaction.post(
              "",
              {
                transactionType: "Thanh toán đơn hàng",
                amount: -parseInt(order.totalPrice),
                date: new Date().toISOString(),
                walletId: walletTmp.id,
                paymentTypeId: 5,
                orderId: order.id,
                status: "Success",
              },
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            );
            apiOrderDetail.get("/Order/" + order.id).then((response) => {
              apiWallets
                .put(
                  "/" + walletTmp.id,
                  {
                    balance: walletTmp.balance - order.totalPrice,
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
                )
                .then((response) => {
                  //getOrderInfo();
                  window.location.reload();
                });
            });
          });
      });
  };

  const handleCompleteSaleOrder = async (orderToUpdate) => {
    try {
      const ownerResponse = await apiUser.get(`/${orderToUpdate.shopId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const ownerWalletResponse = await apiWallets.get(
        `/${ownerResponse.data.walletId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      const ownerWallet = ownerWalletResponse.data;

      const amountToAdd =
        orderToUpdate.totalPrice * (1 - platformFee[0].percent);

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
          status: "Success",
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
            platformFee: orderToUpdate.totalPrice * platformFee[0].percent,
            ownerReceiveMoney:
              orderToUpdate.totalPrice * (1 - platformFee[0].percent),
            depositBackMoney: 0,
            status: "Success",
            orderId: orderToUpdate.id,
            fineFee: 0,
            date: new Date().toISOString(),
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
                  .then((response) => {});
                await apiTransactionDetail.post(
                  "",
                  {
                    receiveMoney: item.unitPrice * item.quantity,
                    platformFee:
                      item.unitPrice * item.quantity * platformFee[0].percent,
                    ownerReceiveMoney:
                      item.unitPrice *
                      item.quantity *
                      (1 - platformFee[0].percent),
                    depositBackMoney: 0,
                    status: "Success",
                    orderDetailId: item.id,
                    transactionId: response.data.id,
                    platformFeeId: 1,
                    fineFee: 0,
                    date: new Date().toISOString(),
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

  const handleSubmitReport = async (e, productId, item) => {
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
        var formData = new FormData();

        formData.append(`ratingImageUrls`, openVideoReview);
        await apiRatingImage.post("?ratingId=" + response.data.id, formData, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });

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
              fine: item.fine,
              rentCount: item.rentCount,
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
            setIsReviewFormVisible(false);
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
                      value={name}
                      onChange={(e) => handleInputChangeName(e.target.value)}
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>
                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">Địa chỉ: </p>
                    <input
                      type="text"
                      name="address"
                      value={address}
                      onChange={(e) => handleInputChangeAddress(e.target.value)}
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>
                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">Điện thoại:</p>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => handleInputChangePhone(e.target.value)}
                      className="w-6/10 border border-gray-300 rounded p-1"
                    />
                  </label>
                  <label className="flex justify-between items-center space-x-12 block">
                    <p className="font-semibold w-4/10">Ngày sinh:</p>
                    <input
                      type="date"
                      name="dob"
                      value={
                        dob ? new Date(dob).toISOString().split("T")[0] : ""
                      }
                      onChange={(e) => handleInputChangeDob(e.target.value)}
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

                <div className="relative w-40 h-40 flex flex-col items-center">
                  {/* Avatar */}
                  <img
                    src={
                      customerInfo && customerInfo.avatarUrl
                        ? customerInfo.avatarUrl
                        : ""
                    }
                    alt="User Avatar"
                    className="w-36 h-36 object-cover rounded-full border border-gray-300"
                  />

                  {/* Input file ẩn */}
                  <input
                    type="file"
                    accept=".jpg, .png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                  />

                  {/* Nút chọn ảnh */}
                  <button
                    className="mt-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                    onClick={() => document.getElementById("fileInput").click()}
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
              {/* <button
                onClick={() => handleFilterChange("ContinueRent")}
                className={`p-2 rounded ${
                  filterStatus == "ContinueRent"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Thuê tiếp
              </button> */}
              <button
                onClick={() => handleFilterChange("Processing")}
                className={`p-2 rounded ${
                  filterStatus == "Processing"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Đang thực hiện
              </button>

              <button
                onClick={() => handleFilterChange("Complete")}
                className={`p-2 rounded ${
                  filterStatus == "Complete"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Hoàn thành
              </button>
              <button
                onClick={() => handleFilterChange("Cancel")}
                className={`p-2 rounded ${
                  filterStatus == "Cancel"
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
                        : order.status == "Cancel"
                        ? "Đã hủy"
                        : "Hoàn thành"}
                    </span>
                  </div>
                  <hr className="border-gray-300 mb-2" />
                  <div className="flex items-center mb-2">
                    <div className="flex-grow">
                      <p className="font-semibold">
                        Ngày đặt hàng:{" "}
                        {new Date(order.orderDate)
                          .toLocaleString()
                          .substring(9)}
                      </p>
                      <p className="font-semibold">
                        Ngày nhận hàng:{" "}
                        {order.receiveDate && order.receiveDate
                          ? new Date(order.receiveDate)
                              .toLocaleString()
                              .substring(9)
                          : "đang xử lý"}
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
                        : order.status == "Cancel"
                        ? "Đã hủy"
                        : "Hoàn thành"}
                    </span>
                  </div>
                  <hr className="border-gray-300 mb-2" />
                  <div className="flex items-center mb-2">
                    <div className="flex-grow">
                      <p className="font-semibold">
                        Ngày đặt hàng:{" "}
                        {/* {new Date(order.orderDate).toISOString().split("T")[0]} */}
                        {new Date(order.orderDate)
                          .toLocaleString()
                          .substring(9)}
                      </p>

                      <p className="font-semibold">
                        Ngày nhận hàng:{" "}
                        {order.receiveDate && order.receiveDate
                          ? new Date(order.receiveDate)
                              .toLocaleString()
                              .substring(9)
                          : "đang xử lý"}
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
              <h2 className="text-xl font-semibold">Thông tin tài khoản</h2>

              <p>
                <strong>Số dư khả dụng:</strong>{" "}
                {walletInfo.balance.toLocaleString()} VNĐ
              </p>
              {!isEditing2 ? (
                <>
                  <p>
                    <strong>Số tài khoản:</strong> {walletInfo.withdrawInfo}
                  </p>
                  <p>
                    <strong>Ngân hàng:</strong> {walletInfo.withdrawMethod}
                  </p>

                  <div className="flex items-center space-x-4">
                    <button
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setIsEditing2(true)}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => setIsFormVisible(true)}
                    >
                      Rút tiền
                    </button>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit2(e);
                  }}
                  className="mt-4"
                >
                  <div className="flex items-center mb-2">
                    <label className="block font-semibold w-1/7">
                      Số tài khoản:
                    </label>
                    <input
                      type="text"
                      name="withdrawInfo"
                      value={formData.withdrawInfo}
                      onChange={handleInputChange2}
                      className="w-6/7 p-2 border rounded"
                    />
                  </div>

                  <div className="flex items-center mb-2">
                    <label className="block font-semibold w-1/7">
                      Ngân hàng:
                    </label>
                    <input
                      type="text"
                      name="withdrawMethod"
                      value={formData.withdrawMethod}
                      onChange={handleInputChange2}
                      className="w-6/7 p-2 border rounded"
                    />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      onClick={() => setIsEditing2(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Phần dưới: Lịch sử giao dịch */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Lịch sử giao dịch</h2>
              {walletTransaction.length > 0 ? (
                <div className="flex items-start mb-10">
                  {/* WalletTransaction - Danh sách giao dịch dương */}
                  <ul className="space-y-4 w-1/2">
                    {walletTransactionPlus.length > 0 ? (
                      walletTransactionPlus.map((transaction) => (
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
                                ? "+" +
                                  (transaction.amount || 0).toLocaleString()
                                : (
                                    transaction.amount || 0
                                  ).toLocaleString()}{" "}
                              VNĐ
                            </span>
                          </div>

                          <div className="flex items-center mb-2">
                            <p className="font-semibold">
                              Ngày giao dịch :{" "}
                              {
                                new Date(transaction.date).toLocaleString()
                                //.substring(9)
                              }
                            </p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p>Chưa có giao dịch</p>
                    )}
                  </ul>

                  {/* Đường kẻ phân chia */}
                  <div className="border-l border-gray-400 h-auto mx-2"></div>

                  {/* WalletTransaction - Danh sách giao dịch âm */}
                  <ul className="space-y-4 w-1/2">
                    {walletTransactionMinus.length > 0 ? (
                      walletTransactionMinus.map((transaction) => (
                        <li
                          key={transaction.id}
                          className="p-4 border border-gray-300 rounded-lg"
                          style={{ backgroundColor: "#f75e5e" }}
                        >
                          <div className="flex justify-between mb-2">
                            <h4 className="font-semibold">
                              {transaction.transactionType}{" "}
                              {transaction.status == "Await"
                                ? "(Đang xử lý)"
                                : ""}
                              {transaction.status == "Complete"
                                ? "(Hoàn thành)"
                                : ""}
                              {transaction.orderId != null
                                ? " " + transaction.orderId
                                : ""}{" "}
                            </h4>
                            <span className="font-medium">
                              {transaction.amount >= 0
                                ? "+" +
                                  (transaction.amount || 0).toLocaleString()
                                : (
                                    transaction.amount || 0
                                  ).toLocaleString()}{" "}
                              VNĐ
                            </span>
                          </div>

                          <div className="flex items-center mb-2">
                            <p className="font-semibold">
                              Ngày giao dịch :{" "}
                              {
                                new Date(transaction.date).toLocaleString()
                                //  .substring(9)
                              }
                            </p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p>Chưa có giao dịch</p>
                    )}
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

  const renderMoney = () => {
    if (!isFormVisible) return null;

    return (
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center"
        style={{
          zIndex: 20,
        }}
      >
        <div
          className="mt-4 p-4 border border-gray-300 rounded shadow"
          style={{
            backgroundColor: "white",
          }}
        >
          <h3 className="text-lg font-semibold mb-2">
            Nhập số tiền bạn muốn rút (VNĐ)
          </h3>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded mb-4"
            placeholder="Nhập số tiền"
            value={withdrawAmount}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, "");

              if (rawValue) {
                setWithdrawAmount(
                  new Intl.NumberFormat("vi-VN").format(rawValue)
                );
              } else {
                setWithdrawAmount("");
              }
            }}
          />
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleWithdraw}
            >
              Xác nhận
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => setIsFormVisible(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    const stages = [
      "Processing",
      "Expired",
      "Delivering",
      "Checking",
      "AcceptFee",
      "StaffCheck",
      "Complete",
    ];
    const getStatusIndex = (status) => stages.indexOf(status);

    return (
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center"
        style={{
          zIndex: 20,
        }}
      >
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
                {new Date(selectedOrder.orderDate)
                  .toLocaleString()
                  .substring(9)}
              </p>
              <p>
                <strong>Ngày nhận:</strong>{" "}
                {selectedOrder.receiveDate && selectedOrder.receiveDate
                  ? new Date(selectedOrder.receiveDate)
                      .toLocaleString()
                      .substring(9)
                  : "đang xử lý"}
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
              {orderDetails.map((item, index) => {
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
                            onClick={() => setOpenImage(item.toyImgUrls[0])}
                          />

                          <div className="flex-grow">
                            <h4 className="font-semibold" style={{}}>
                              {item.toyName}
                            </h4>
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
                                    .toLocaleString()
                                    .substring(9)
                                : "Đang chờ"}
                            </p>
                            <p>
                              Ngày trả hàng:{" "}
                              {item.endDate
                                ? new Date(item.endDate)
                                    .toLocaleString()
                                    .substring(9)
                                : "Đang chờ"}
                            </p>
                            {item.orderCheckImageUrl[1] != null &&
                              item.orderCheckImageUrl[1] != "" && (
                                <p className="text-red-500">
                                  Phí phạt yêu cầu :{" "}
                                  {item.fine.toLocaleString()} VNĐ
                                </p>
                              )}
                            {item.orderCheckImageUrl[1] != null &&
                              item.orderCheckImageUrl[1] != "" && (
                                <p className="text-red-500">
                                  Lý do phạt : {item.orderCheckStatus[1]}
                                </p>
                              )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "16px",
                            }}
                          >
                            {item.orderCheckImageUrl[0] != null &&
                              item.orderCheckImageUrl[0] != "" && (
                                <div>
                                  <video
                                    src={
                                      item.orderCheckImageUrl[0] &&
                                      item.orderCheckImageUrl[0]
                                        ? item.orderCheckImageUrl[0]
                                        : ""
                                    }
                                    style={{
                                      width: "300px",
                                      height: "160px",
                                      objectFit: "cover",
                                      marginRight: "16px",
                                    }}
                                    controls
                                    muted
                                  >
                                    Trình duyệt của bạn không hỗ trợ thẻ video.
                                  </video>
                                  <div>Video tình trạng đồ chơi của tôi</div>
                                </div>
                              )}

                            {item.orderCheckImageUrl[1] != null &&
                              item.orderCheckImageUrl[1] != "" && (
                                <div>
                                  <video
                                    src={
                                      item.orderCheckImageUrl[1] &&
                                      item.orderCheckImageUrl[1]
                                        ? item.orderCheckImageUrl[1]
                                        : ""
                                    }
                                    style={{
                                      width: "300px",
                                      height: "160px",
                                      objectFit: "cover",
                                      marginRight: "16px",
                                      marginLeft: "16px",
                                    }}
                                    controls
                                    muted
                                  >
                                    Trình duyệt của bạn không hỗ trợ thẻ video.
                                  </video>
                                  <div>
                                    Video tình trạng đồ chơi người thuê gửi
                                  </div>
                                </div>
                              )}

                            {item.status === "AcceptFee" && (
                              <div
                                style={{
                                  width: "300px",
                                  height: "160px",
                                  objectFit: "cover",
                                  marginRight: "16px",
                                  marginLeft: "16px",
                                }}
                              >
                                <button
                                  className="flex items-center mb-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow hover:bg-green-600 transition duration-200 ease-in-out"
                                  onClick={() => handleFinishOrderDetail(item)}
                                >
                                  Chấp nhận phí phạt
                                </button>

                                <button
                                  className="flex items-center mb-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-md shadow hover:bg-red-600 transition duration-200 ease-in-out"
                                  onClick={() => setIsReportFormVisible(true)}
                                >
                                  Không chấp nhận
                                </button>

                                <div>
                                  {isReportFormVisible && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                      <div className="bg-white p-6 rounded-md shadow-lg w-96 relative">
                                        <form
                                          onSubmit={(e) => {
                                            e.preventDefault();
                                            handleReport(item, index);
                                          }}
                                          className="flex flex-col space-y-4"
                                        >
                                          {/* Nút đóng (X) nằm bên trong form */}
                                          <button
                                            type="button" // Sử dụng type="button" để ngăn không gửi form
                                            onClick={() => {
                                              setIsReportFormVisible(false);
                                            }}
                                            className="absolute top-3 right-3 text-xl text-red-500 hover:text-red-700"
                                          >
                                            ✖
                                          </button>
                                          <div>video dùng để khiếu nại</div>
                                          <div
                                            className="border border border-gray-300 rounded p-4 mb-4 w-full text-center"
                                            onDragOver={(e) =>
                                              e.preventDefault()
                                            }
                                          >
                                            <video
                                              controls
                                              className="w-full h-auto max-h-40 object-contain"
                                              src={item.orderCheckImageUrl[0]}
                                            />
                                          </div>

                                          <div>
                                            <textarea
                                              value={reportDescription}
                                              onChange={(e) =>
                                                setReportDescription(
                                                  e.target.value
                                                )
                                              }
                                              rows="4"
                                              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                              placeholder="Nhập nội dung khiếu nại..."
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
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {(item.status == "Processing" ||
                            item.status == "Expired") && (
                            <div
                              className="border border border-gray-300 rounded p-4 mb-4 w-full text-center"
                              onDrop={(e) => handleDrop(e, "video", index)}
                              onDragOver={(e) => e.preventDefault()}
                              style={{
                                width: "600px", // Kích thước cố định (có thể tùy chỉnh)
                                height: "200px",
                                overflow: "hidden",
                              }}
                            >
                              {openVideoReturn?.video?.[index] ? (
                                <video
                                  controls
                                  className="w-full h-auto max-h-40 object-contain"
                                  src={URL.createObjectURL(
                                    openVideoReturn.video[index]
                                  )}
                                />
                              ) : (
                                <p>Kéo và thả video tại đây hoặc nhấp vào</p>
                              )}
                              <input
                                type="file"
                                onChange={(e) =>
                                  handleFileChange2(e, "video", index)
                                }
                                className="hidden"
                                id={`video-input-${index}`}
                              />
                              <label
                                htmlFor={`video-input-${index}`}
                                className="text-blue-500 underline cursor-pointer"
                              >
                                chọn tệp
                              </label>
                            </div>
                          )}
                          <div
                            style={{
                              marginLeft: "20px",
                            }}
                          >
                            {item.status === "Processing" && (
                              <div>
                                <button
                                  className="flex items-center mb-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                                  onClick={() => handleReturnSoon(item, index)}
                                >
                                  Trả hàng sớm
                                </button>
                              </div>
                            )}
                            {item.status === "Expired" && (
                              <button
                                className="flex items-center mb-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow hover:bg-green-600 transition duration-200 ease-in-out"
                                onClick={() => handleBuyToy(item)}
                              >
                                Mua luôn
                              </button>
                            )}
                            {item.status === "Expired" &&
                              item.rentCount < 3 && (
                                <button
                                  className="flex items-center mb-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 transition duration-200 ease-in-out"
                                  onClick={() => {
                                    setIsContinueFormVisible(true);
                                    orderType.map((item2, index) => {
                                      if (4 == item2.id) {
                                        setContinueRent(
                                          item.toyPrice * item2.percentPrice
                                        );
                                      }
                                    });
                                  }}
                                >
                                  Thuê tiếp
                                </button>
                              )}
                            {item.status === "Expired" && (
                              <button
                                className="flex items-center mb-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                                onClick={() =>
                                  handleReturnOrderDetail(item, index)
                                }
                              >
                                Trả hàng
                              </button>
                            )}
                          </div>
                          <div>
                            {isContinueFormVisible && (
                              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="bg-white p-6 rounded-md shadow-lg w-96 relative">
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault(); // Ngăn form tự load lại trang
                                      handleExtendRental(item); // Gọi hàm xử lý thuê tiếp
                                    }}
                                    className="flex flex-col space-y-4"
                                  >
                                    {/* Nút đóng (X) */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsContinueFormVisible(false);
                                      }}
                                      className="absolute top-3 right-3 text-xl text-red-500 hover:text-red-700"
                                    >
                                      ✖
                                    </button>

                                    {/* Hiển thị giá đồ chơi */}
                                    <div>
                                      <label className="block mb-2 font-medium">
                                        Giá đồ chơi:
                                      </label>
                                      <p className="text-lg font-semibold">
                                        {item.toyPrice.toLocaleString()} VND
                                      </p>
                                    </div>

                                    {/* Hiển thị giá thuê */}
                                    <div>
                                      <label className="block mb-2 font-medium">
                                        Giá thuê:
                                      </label>
                                      <p className="text-lg font-semibold">
                                        {continueRent.toLocaleString()} VND
                                      </p>
                                    </div>

                                    {/* Nút chọn số ngày thuê */}
                                    <div className="flex justify-between">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleContinueRent(item.toyPrice, 4)
                                        }
                                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                                      >
                                        7 ngày
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleContinueRent(item.toyPrice, 5)
                                        }
                                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                                      >
                                        14 ngày
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleContinueRent(item.toyPrice, 6)
                                        }
                                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                                      >
                                        1 tháng
                                      </button>
                                    </div>

                                    {/* Nút gửi */}
                                    <button
                                      type="submit"
                                      className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow hover:bg-green-600 transition duration-200 ease-in-out"
                                    >
                                      Thuê tiếp
                                    </button>
                                  </form>
                                </div>
                              </div>
                            )}
                          </div>

                          {item.ratingId == null &&
                            item.status == "Complete" && (
                              <div>
                                {isReviewFormVisible && (
                                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                    <div className="bg-white p-6 rounded-md shadow-lg w-96 relative">
                                      <form
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          handleSubmitReview(e, item.id, item);
                                        }}
                                        className="flex flex-col space-y-4"
                                      >
                                        {/* Nút đóng (X) nằm bên trong form */}
                                        <button
                                          type="button" // Sử dụng type="button" để ngăn không gửi form
                                          onClick={() => {
                                            setOpenVideoReview("");
                                            setIsReviewFormVisible(false);
                                          }}
                                          className="absolute top-3 right-3 text-xl text-red-500 hover:text-red-700"
                                        >
                                          ✖
                                        </button>

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
                                                  star <=
                                                  reviews[item.id].rating
                                                    ? "text-yellow-400"
                                                    : "text-gray-300"
                                                } transition-colors duration-200 ease-in-out`}
                                                onClick={() =>
                                                  handleRatingChange(
                                                    item.id,
                                                    star
                                                  )
                                                }
                                              >
                                                ★
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Nội dung đánh giá */}
                                        <div>
                                          <textarea
                                            value={reviews[item.id].review}
                                            onChange={(e) =>
                                              handleReviewChange(
                                                item.id,
                                                e.target.value
                                              )
                                            }
                                            rows="4"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Nhập nội dung đánh giá..."
                                            required
                                          ></textarea>
                                        </div>
                                        <div
                                          className="border border border-gray-300 rounded p-4 mb-4 w-full text-center"
                                          onDrop={(e) =>
                                            handleDropReview(e, "video", index)
                                          }
                                          onDragOver={(e) => e.preventDefault()}
                                        >
                                          {openVideoReview ? (
                                            // Kiểm tra xem tệp là video hay hình ảnh
                                            openVideoReview.type &&
                                            openVideoReview.type.startsWith(
                                              "video/"
                                            ) ? (
                                              <video
                                                controls
                                                className="w-full h-auto max-h-40 object-contain"
                                                src={URL.createObjectURL(
                                                  openVideoReview
                                                )}
                                              />
                                            ) : openVideoReview.type &&
                                              openVideoReview.type.startsWith(
                                                "image/"
                                              ) ? (
                                              <img
                                                className="w-full h-auto max-h-40 object-contain"
                                                src={URL.createObjectURL(
                                                  openVideoReview
                                                )}
                                                alt="Hình ảnh tải lên"
                                              />
                                            ) : (
                                              <p>Định dạng không hợp lệ</p> // Nếu tệp không phải là video hoặc hình ảnh
                                            )
                                          ) : (
                                            <p>
                                              Kéo và thả video/hình ảnh tại đây
                                              hoặc nhấp vào
                                            </p>
                                          )}

                                          <input
                                            type="file"
                                            onChange={(e) =>
                                              handleFileChangeReview(
                                                e,
                                                "video",
                                                index
                                              )
                                            }
                                            className="hidden"
                                            id={`video-input`}
                                          />
                                          <label
                                            htmlFor={`video-input`}
                                            className="text-blue-500 underline cursor-pointer"
                                          >
                                            chọn tệp
                                          </label>
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
                                  </div>
                                )}

                                {/* Nút mở form đánh giá */}
                                <button
                                  onClick={() => setIsReviewFormVisible(true)}
                                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                                  style={{
                                    marginLeft: "30px",
                                    width: "100px",
                                    gap: "16px",
                                  }}
                                >
                                  Đánh giá
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
                                  <div className="text-sm">Đang trả hàng</div>
                                )}

                                {stage === "Checking" && (
                                  <div className="text-sm">Đang đánh giá</div>
                                )}

                                {stage == "AcceptFee" && (
                                  <div className="text-sm">
                                    Phí phạt (Nếu có)
                                  </div>
                                )}

                                {stage == "StaffCheck" && (
                                  <div className="text-sm">Xử lý khiếu nại</div>
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
                            {isReviewFormVisible && (
                              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="bg-white p-6 rounded-md shadow-lg w-96 relative">
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleSubmitReview(e, item.id, item);
                                    }}
                                    className="flex flex-col space-y-4"
                                  >
                                    {/* Nút đóng (X) nằm bên trong form */}
                                    <button
                                      type="button" // Sử dụng type="button" để ngăn không gửi form
                                      onClick={() => {
                                        setOpenVideoReview("");
                                        setIsReviewFormVisible(false);
                                      }}
                                      className="absolute top-3 right-3 text-xl text-red-500 hover:text-red-700"
                                    >
                                      ✖
                                    </button>

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
                                    <div>
                                      <textarea
                                        value={reviews[item.id].review}
                                        onChange={(e) =>
                                          handleReviewChange(
                                            item.id,
                                            e.target.value
                                          )
                                        }
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Nhập nội dung đánh giá..."
                                        required
                                      ></textarea>
                                    </div>
                                    <div
                                      className="border border border-gray-300 rounded p-4 mb-4 w-full text-center"
                                      onDrop={(e) =>
                                        handleDropReview(e, "video", index)
                                      }
                                      onDragOver={(e) => e.preventDefault()}
                                    >
                                      {openVideoReview ? (
                                        // Kiểm tra xem tệp là video hay hình ảnh
                                        openVideoReview.type &&
                                        openVideoReview.type.startsWith(
                                          "video/"
                                        ) ? (
                                          <video
                                            controls
                                            className="w-full h-auto max-h-40 object-contain"
                                            src={URL.createObjectURL(
                                              openVideoReview
                                            )}
                                          />
                                        ) : openVideoReview.type &&
                                          openVideoReview.type.startsWith(
                                            "image/"
                                          ) ? (
                                          <img
                                            className="w-full h-auto max-h-40 object-contain"
                                            src={URL.createObjectURL(
                                              openVideoReview
                                            )}
                                            alt="Hình ảnh tải lên"
                                          />
                                        ) : (
                                          <p>Định dạng không hợp lệ</p> // Nếu tệp không phải là video hoặc hình ảnh
                                        )
                                      ) : (
                                        <p>
                                          Kéo và thả video/hình ảnh tại đây hoặc
                                          nhấp vào
                                        </p>
                                      )}

                                      <input
                                        type="file"
                                        onChange={(e) =>
                                          handleFileChangeReview(
                                            e,
                                            "video",
                                            index
                                          )
                                        }
                                        className="hidden"
                                        id={`video-input`}
                                      />
                                      <label
                                        htmlFor={`video-input`}
                                        className="text-blue-500 underline cursor-pointer"
                                      >
                                        chọn tệp
                                      </label>
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
                              </div>
                            )}

                            {/* Nút mở form đánh giá */}
                            <button
                              onClick={() => setIsReviewFormVisible(true)}
                              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                            >
                              Đánh giá
                            </button>
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
          zIndex: 10,
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
      {renderOrderDetails()}

      {renderMoney()}
      <ChatForm />
      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default InformationCustomer;
