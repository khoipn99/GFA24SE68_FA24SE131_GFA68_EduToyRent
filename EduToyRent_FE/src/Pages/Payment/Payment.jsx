import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../../Component/Sidebar/Sidebar";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie
import apiWallets from "../../service/ApiWallets";
import apiWalletTransaction from "../../service/ApiWalletTransaction";
import apiOrder from "../../service/ApiOrder";
import apiOrderDetail from "../../service/ApiOrderDetail";
import apiCart from "../../service/ApiCart";
import apiCartItem from "../../service/ApiCartItem";
import apiTransaction from "../../service/ApiTransaction";
import apiTransactionDetail from "../../service/ApiTransactionDetail";
import apiToys from "../../service/ApiToys";
import apiNotifications from "../../service/ApiNotifications";
import ChatForm from "../Chat/ChatForm";
import Term from "../../Component/Terms/Terms";
import apiOrderTypes from "../../service/ApiOrderTypes";

const Payment = () => {
  const [cartItems, setCartItems] = useState([]); // Danh sách sản phẩm
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phoneNumber: "",
    detail: "",
    city: "",
    district: "",
    ward: "",
  });
  const [cities, setCities] = useState([]); // Thành phố
  const [districts, setDistricts] = useState([]); // Quận/Huyện
  const [wards, setWards] = useState([]); // Phường/Xã
  const [cart, setCart] = useState({});
  const [customerInfo, setCustomerInfo] = useState({});
  const [rentItems, setRentItems] = useState([]);
  const [buyItems, setBuyItems] = useState([]);
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [wallet, setWallet] = useState({});
  const [error, setError] = useState("");
  const [oldAddress, setOldAddress] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false); // State để kiểm tra checkbox
  const [orderType, setOrderType] = useState([]);

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

    const userDataCookie = Cookies.get("userDataReal");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);

      console.log(JSON.parse(userDataCookie));

      setCustomerInfo(parsedUserData);
      setShippingInfo({
        ...shippingInfo,
        fullName: parsedUserData.fullName,
        phoneNumber: parsedUserData.phone,
      });

      setOldAddress(parsedUserData.address);

      console.log(parsedUserData);
      fetchUserCart(parsedUserData.id);

      apiWallets.get("/" + parsedUserData.walletId).then((response) => {
        setWallet(response.data);
      });
    }

    axios.get("https://provinces.open-api.vn/api/").then((response) => {
      setCities(response.data);
    });
  }, []);

  const fetchUserCart = async (userId) => {
    try {
      const response = await apiCart.get(`?pageIndex=1&pageSize=1000`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Tất cả giỏ hàng:", response.data);

      // Lọc giỏ hàng theo userId
      const userCart = response.data.filter((cart) => cart.userId == userId);

      if (userCart.length > 0) {
        const cart = userCart[0];
        const cartId = cart.id;
        console.log(cart);

        setCart(cart); // Lưu cartId vào state
        fetchCartItems(cartId); // Gọi API lấy CartItems
        LoadOrderTypes();
      } else {
        console.error("Không tìm thấy giỏ hàng cho người dùng.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng của người dùng:", error);
    }
  };

  const fetchCartItems = async (cartId) => {
    try {
      if (!cartId) {
        console.error("Không tìm thấy cartId");
        return;
      }

      const response = await apiCartItem
        .get(`/ByCartId/${cartId}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        })
        .then(async (response) => {
          setCartItems(response.data);

          if (response.data == "Empty List!") {
            navigate("/");
          }

          // Tạo các danh sách rentItems và buyItems dựa vào quantity
          const rentItems = response.data
            .filter((item) => item.quantity === -1)
            .map((item) => ({
              ...item,
              rentalDuration: calculateRentalDuration(item.orderTypeId),
            }));
          const buyItems = response.data.filter((item) => item.quantity >= 1);

          const itemsWithRentalPrices = await Promise.all(
            rentItems.map(async (item) => {
              const rentalPrice = await calculateRentalPrice(
                item.price,
                item.orderTypeId
              );
              console.log(item.price);
              console.log(item.orderTypeId);
              console.log(rentalPrice);
              return {
                ...item,
                rentalPrice,
              };
            })
          );

          setRentItems(itemsWithRentalPrices);
          setBuyItems(buyItems);
          console.log(itemsWithRentalPrices);
          console.log(rentItems);
        });

      console.log("Các mục trong giỏ hàng:", response.data);
    } catch (error) {}
  };

  const LoadOrderTypes = async () => {
    try {
      const OrderTypesResponse = await apiOrderTypes.get(
        `?pageIndex=1&pageSize=2000`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      console.log("Danh sách phí nền tảng mới log:", OrderTypesResponse.data);
      const OrderType = OrderTypesResponse.data;
      // Cập nhật dữ liệu đồ chơi
      setOrderType(OrderType);
      console.log(`Danh sách phí nền tảng:`, OrderType);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng", error);
    }
  };

  const calculateRentalDuration = (orderTypeId) => {
    switch (orderTypeId) {
      case 4:
        return "1 tuần";
      case 5:
        return "2 tuần";
      case 6:
        return "1 tháng";
      case 7:
        return "Mua";
      default:
        return "Loại đơn hàng không hợp lệ";
    }
  };

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setShippingInfo({
      ...shippingInfo,
      city: selectedCity,
      district: "",
      ward: "",
    });
    axios
      .get(`https://provinces.open-api.vn/api/p/${selectedCity}?depth=2`)
      .then((response) => {
        setDistricts(response.data.districts);
      });
  };

  const handleCheckboxChange2 = (e) => {
    setIsChecked(e.target.checked);
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setShippingInfo({ ...shippingInfo, district: selectedDistrict, ward: "" });
    axios
      .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
      .then((response) => {
        setWards(response.data.wards);
      });
  };

  const calculateRentalPrice = async (price, duration) => {
    try {
      const response = await apiOrderTypes.get(`?pageIndex=1&pageSize=2000`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const matchingOrder = response.data.find((item) => item.id == duration);
      if (!matchingOrder) {
        throw new Error("Matching order not found");
      }

      const rentalPrice = price * (matchingOrder.percentPrice || 0);
      console.log(matchingOrder.time); // Log giá trị `time`
      return rentalPrice; // Trả về rentalPrice
    } catch (error) {
      console.error("Error calculating rental price:", error);
      return undefined; // Xử lý lỗi và trả về undefined nếu có lỗi
    }
  };

  const handleWardChange = (e) => {
    setShippingInfo({ ...shippingInfo, ward: e.target.value });
  };

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "phoneNumber") {
      validatePhoneNumber(e.target.value);
    }
  };

  const validatePhoneNumber = (value) => {
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(value)) {
      setError("Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0");
    } else {
      setError("");
    }
  };

  const handleTermsClick = () => {
    navigate("/term");
  };

  const calculateTotalPrice = (items) =>
    items.reduce((total, item) => total + item.price * (item.quantity || 1), 0);

  const calculateTotalPrice2 = (items) =>
    items.reduce((total, item) => total + item.price, 0);

  // const calculateTotalPrice2 = (items) => {
  //   return items.reduce((total, item) => {
  //     if (item.orderTypeId === 4) {
  //       return total + item.price * 0.15;
  //     } else if (item.orderTypeId === 5) {
  //       return total + item.price * 0.25;
  //     } else if (item.orderTypeId === 6) {
  //       return total + item.price * 0.3;
  //     }
  //     return total;
  //   }, 0);
  // };

  const totalRentPrice = calculateTotalPrice2(rentItems);
  const totalBuyPrice = calculateTotalPrice(buyItems);
  const totalPrice = totalRentPrice + totalBuyPrice;

  // Tính tổng thanh toán sau giảm giá
  const totalAfterDiscount = totalPrice - discount;

  const handleVoucherApply = () => {
    // Giả lập xử lý voucher, thêm API nếu cần
    if (voucher === "DISCOUNT10") {
      setDiscount(totalPrice * 0.1); // Giảm 10%
    } else {
      alert("Mã giảm giá không hợp lệ!");
    }
  };

  const handlePayment = async () => {
    if (isChecked) {
      if (wallet.balance >= totalAfterDiscount) {
        if (
          shippingInfo.fullName != "" &&
          shippingInfo.phoneNumber != "" &&
          error == ""
        ) {
          if (useNewAddress) {
            if (
              shippingInfo.detail != "" &&
              shippingInfo.ward != "" &&
              shippingInfo.district != "" &&
              shippingInfo.city != ""
            ) {
              const city = cities.find(
                (city) => city.code == shippingInfo.city
              ).name;
              const distric = districts.find(
                (district) => district.code == shippingInfo.district
              ).name;
              const war = wards.find(
                (ward) => ward.code == shippingInfo.ward
              ).name;

              if (rentItems != "") {
                const groupedItems = rentItems.reduce((acc, item) => {
                  const shopId = item.shopId; // Hoặc thuộc tính phân biệt shop
                  if (!acc[shopId]) {
                    acc[shopId] = []; // Tạo mảng mới nếu chưa tồn tại
                  }
                  acc[shopId].push(item); // Thêm item vào mảng tương ứng
                  return acc;
                }, {});

                console.log(groupedItems);
                for (const shopId of Object.keys(groupedItems)) {
                  const tmp = groupedItems[shopId].length;
                  console.log(`Shop ID: ${shopId}`);
                  console.log("Items:", groupedItems[shopId]); // Mảng của shop này

                  var totalRentPriceTmp = 0;
                  await groupedItems[shopId].map(async (item, index) => {
                    orderType.map((item2, index) => {
                      if (item.orderTypeId == item2.id) {
                        totalRentPriceTmp += item.price * item2.percentPrice;
                      }
                    });
                  });
                  console.log(totalRentPriceTmp);

                  var totalDepositTmp = 0;
                  await groupedItems[shopId].map((item, index) => {
                    totalDepositTmp += item.price;
                  });
                  console.log(totalDepositTmp);
                  console.log(shippingInfo.fullName);
                  console.log(
                    shippingInfo.detail + "," + war + "," + distric + "," + city
                  );

                  await apiOrder
                    .post(
                      "",
                      {
                        orderDate: new Date().toISOString(),
                        receiveDate: null,
                        totalPrice: totalDepositTmp,
                        rentPrice: totalRentPriceTmp,
                        depositeBackMoney: 0,
                        fine: 0,
                        receiveName: shippingInfo.fullName,
                        receiveAddress:
                          shippingInfo.detail +
                          "," +
                          war +
                          "," +
                          distric +
                          "," +
                          city,
                        receivePhone: shippingInfo.phoneNumber,
                        status: "Pending",
                        userId: customerInfo.id,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${Cookies.get("userToken")}`,
                        },
                      }
                    )
                    .then(async (response) => {
                      await apiNotifications.post(
                        "",
                        {
                          notify: `Bạn có đơn hàng mới mã số ${response.data.id} `,
                          isRead: false,
                          userId: shopId,
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${Cookies.get("userToken")}`,
                          },
                        }
                      );

                      await apiWalletTransaction
                        .post(
                          "",
                          {
                            transactionType: "Thanh toán đơn hàng",
                            amount: -parseInt(totalDepositTmp),
                            date: new Date().toISOString(),
                            walletId: customerInfo.walletId,
                            paymentTypeId: 5,
                            orderId: response.data.id,
                            status: "Success",
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${Cookies.get(
                                "userToken"
                              )}`,
                            },
                          }
                        )
                        .then((response) => {});

                      await apiWallets
                        .get("/" + customerInfo.walletId, {
                          headers: {
                            Authorization: `Bearer ${Cookies.get("userToken")}`,
                          },
                        })
                        .then(async (response2) => {
                          await apiWallets.put(
                            `/${response2.data.id}`,
                            {
                              balance: response2.data.balance - totalDepositTmp,
                              withdrawMethod: response2.data.withdrawMethod,
                              withdrawInfo: response2.data.withdrawInfo,
                              status: response2.data.status,
                              userId: response2.data.userId,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${Cookies.get(
                                  "userToken"
                                )}`,
                              },
                            }
                          );
                        });

                      console.log(response.data);
                      await Promise.all(
                        groupedItems[shopId].map(async (item, index) => {
                          var rentPriceTmp = 0;
                          orderType.map((item2, index) => {
                            if (item.orderTypeId == item2.id) {
                              rentPriceTmp += item.price * item2.percentPrice;
                            }
                          });
                          await apiOrderDetail.post(
                            "",
                            {
                              rentPrice: rentPriceTmp,
                              deposit: item.price,
                              unitPrice: item.price,
                              quantity: -1,
                              startDate: null,
                              endDate: null,
                              fine: 0,
                              rentCount: 1,
                              status: "Await",
                              orderId: response.data.id,
                              toyId: item.toyId,
                              orderTypeId: item.orderTypeId,
                              ratingId: null,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${Cookies.get(
                                  "userToken"
                                )}`,
                              },
                            }
                          );

                          await apiToys.patch(
                            `/${item.toyId}/update-status`,
                            JSON.stringify("Renting"), // Adjust the key as per API requirements
                            {
                              headers: {
                                "Content-Type": "application/json", // Specify the correct Content-Type
                                Authorization: `Bearer ${Cookies.get(
                                  "userToken"
                                )}`,
                              },
                            }
                          );
                        })
                      );
                    });
                }
              }

              if (buyItems != "") {
                const groupedItems = buyItems.reduce((acc, item) => {
                  const shopId = item.shopId; // Hoặc thuộc tính phân biệt shop
                  if (!acc[shopId]) {
                    acc[shopId] = []; // Tạo mảng mới nếu chưa tồn tại
                  }
                  acc[shopId].push(item); // Thêm item vào mảng tương ứng
                  return acc;
                }, {});

                console.log(groupedItems);
                for (const shopId of Object.keys(groupedItems)) {
                  console.log(`Shop ID: ${shopId}`);
                  console.log("Items:", groupedItems[shopId]); // Mảng của shop này

                  console.log(buyItems);

                  var totalDepositTmp2 = 0;
                  await groupedItems[shopId].map((item, index) => {
                    totalDepositTmp2 += item.price * item.quantity;
                  });
                  console.log(totalDepositTmp2);
                  console.log(shippingInfo.fullName);
                  console.log(
                    shippingInfo.detail + "," + war + "," + distric + "," + city
                  );

                  await apiOrder
                    .post(
                      "",
                      {
                        orderDate: new Date().toISOString(),
                        receiveDate: null,
                        totalPrice: totalDepositTmp2,
                        rentPrice: 0,
                        depositeBackMoney: 0,
                        fine: 0,
                        receiveName: shippingInfo.fullName,
                        receiveAddress:
                          shippingInfo.detail +
                          "," +
                          war +
                          "," +
                          distric +
                          "," +
                          city,
                        receivePhone: shippingInfo.phoneNumber,
                        status: "Delivering",
                        userId: customerInfo.id,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${Cookies.get("userToken")}`,
                        },
                      }
                    )
                    .then(async (response) => {
                      console.log(response.data);
                      await apiNotifications.post(
                        "",
                        {
                          notify: `Bạn có đơn hàng mới mã số ${response.data.id} `,
                          isRead: false,
                          userId: shopId,
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
                          transactionType: "Thanh toán đơn hàng",
                          amount: -parseInt(totalDepositTmp2),
                          date: new Date().toISOString(),
                          walletId: customerInfo.walletId,
                          paymentTypeId: 5,
                          orderId: response.data.id,
                          status: "Success",
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${Cookies.get("userToken")}`,
                          },
                        }
                      );

                      await apiWallets
                        .get("/" + customerInfo.walletId, {
                          headers: {
                            Authorization: `Bearer ${Cookies.get("userToken")}`,
                          },
                        })
                        .then(async (response2) => {
                          await apiWallets.put(
                            `/${response2.data.id}`,
                            {
                              balance:
                                response2.data.balance - totalDepositTmp2,
                              withdrawMethod: response2.data.withdrawMethod,
                              withdrawInfo: response2.data.withdrawInfo,
                              status: response2.data.status,
                              userId: response2.data.userId,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${Cookies.get(
                                  "userToken"
                                )}`,
                              },
                            }
                          );
                        });

                      await Promise.all(
                        groupedItems[shopId].map(async (item, index) => {
                          await apiOrderDetail.post(
                            "",
                            {
                              rentPrice: 0,
                              deposit: 0,
                              unitPrice: item.price,
                              quantity: item.quantity,
                              startDate: null,
                              endDate: null,
                              fine: 0,
                              rentCount: 1,
                              status: "DeliveringToBuyer",
                              orderId: response.data.id,
                              toyId: item.toyId,
                              orderTypeId: item.orderTypeId,
                              ratingId: null,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${Cookies.get(
                                  "userToken"
                                )}`,
                              },
                            }
                          );
                          await apiToys
                            .get("/" + item.toyId, {
                              headers: {
                                Authorization: `Bearer ${Cookies.get(
                                  "userToken"
                                )}`,
                              },
                            })
                            .then(async (response) => {
                              await apiToys
                                .put(
                                  "/" + item.toyId,
                                  {
                                    name: response.data.name,
                                    description: response.data.description,
                                    price: response.data.price,
                                    buyQuantity:
                                      response.data.buyQuantity - item.quantity,
                                    origin: response.data.origin,
                                    age: response.data.age,
                                    brand: response.data.brand,
                                    categoryId: response.data.category.id,
                                    rentCount: response.data.rentCount,
                                    quantitySold:
                                      response.data.quantitySold +
                                      item.quantity,
                                    status: response.data.status,
                                  },
                                  {
                                    headers: {
                                      Authorization: `Bearer ${Cookies.get(
                                        "userToken"
                                      )}`,
                                    },
                                  }
                                )
                                .then(async (response) => {});
                            });
                        })
                      );
                    });
                }
              }

              cartItems.map(async (item) => {
                await apiCartItem.delete("/" + item.id, {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("userToken")}`,
                  },
                });
              });

              await apiCart.put(
                `/${cart.id}`,
                {
                  totalPrice: 0,
                  status: "active",
                  userId: cart.userId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("userToken")}`,
                  },
                }
              );
              navigate("/payments-success");
            } else {
              alert("Bạn nhập thiếu thông tin giao hàng!");
            }
          } else {
            if (rentItems != "") {
              const groupedItems = rentItems.reduce((acc, item) => {
                const shopId = item.shopId; // Hoặc thuộc tính phân biệt shop
                if (!acc[shopId]) {
                  acc[shopId] = []; // Tạo mảng mới nếu chưa tồn tại
                }
                acc[shopId].push(item); // Thêm item vào mảng tương ứng
                return acc;
              }, {});

              console.log(groupedItems);
              for (const shopId of Object.keys(groupedItems)) {
                console.log(`Shop ID: ${shopId}`);
                console.log("Items:", groupedItems[shopId]); // Mảng của shop này

                const tmp = groupedItems[shopId].length;
                var totalRentPriceTmp = 0;
                await groupedItems[shopId].map((item, index) => {
                  orderType.map((item2, index) => {
                    if (item.orderTypeId == item2.id) {
                      totalRentPriceTmp += item.price * item2.percentPrice;
                    }
                  });
                });
                console.log(totalRentPriceTmp);

                var totalDepositTmp = 0;
                await groupedItems[shopId].map((item, index) => {
                  totalDepositTmp += item.price;
                });
                console.log(totalDepositTmp);
                console.log(shippingInfo.fullName);

                await apiOrder
                  .post(
                    "",
                    {
                      orderDate: new Date().toISOString(),
                      receiveDate: null,
                      totalPrice: totalDepositTmp,
                      rentPrice: totalRentPriceTmp,
                      depositeBackMoney: 0,
                      fine: 0,
                      receiveName: shippingInfo.fullName,
                      receiveAddress: oldAddress,
                      receivePhone: shippingInfo.phoneNumber,
                      status: "Pending",
                      userId: customerInfo.id,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${Cookies.get("userToken")}`,
                      },
                    }
                  )
                  .then(async (response) => {
                    await apiNotifications.post(
                      "",
                      {
                        notify: `Bạn có đơn hàng mới mã số ${response.data.id} `,
                        isRead: false,
                        userId: shopId,
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
                        transactionType: "Thanh toán đơn hàng",
                        amount: -parseInt(totalDepositTmp),
                        date: new Date().toISOString(),
                        walletId: customerInfo.walletId,
                        paymentTypeId: 5,
                        orderId: response.data.id,
                        status: "Success",
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${Cookies.get("userToken")}`,
                        },
                      }
                    );

                    await apiWallets
                      .get("/" + customerInfo.walletId, {
                        headers: {
                          Authorization: `Bearer ${Cookies.get("userToken")}`,
                        },
                      })
                      .then(async (response2) => {
                        await apiWallets
                          .put(
                            `/${response2.data.id}`,
                            {
                              balance: response2.data.balance - totalDepositTmp,
                              withdrawMethod: response2.data.withdrawMethod,
                              withdrawInfo: response2.data.withdrawInfo,
                              status: response2.data.status,
                              userId: response2.data.userId,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${Cookies.get(
                                  "userToken"
                                )}`,
                              },
                            }
                          )
                          .then((response) => {
                            console.log(response2.data);
                          });
                      });

                    console.log(response.data);
                    await Promise.all(
                      groupedItems[shopId].map(async (item, index) => {
                        var rentPriceTmp = 0;
                        orderType.map((item2, index) => {
                          if (item.orderTypeId == item2.id) {
                            rentPriceTmp += item.price * item2.percentPrice;
                          }
                        });
                        await apiOrderDetail.post(
                          "",
                          {
                            rentPrice: rentPriceTmp,
                            deposit: item.price,
                            unitPrice: item.price,
                            quantity: -1,
                            startDate: null,
                            endDate: null,
                            fine: 0,
                            rentCount: 1,
                            status: "Await",
                            orderId: response.data.id,
                            toyId: item.toyId,
                            orderTypeId: item.orderTypeId,
                            ratingId: null,
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${Cookies.get(
                                "userToken"
                              )}`,
                            },
                          }
                        );

                        await apiToys.patch(
                          `/${item.toyId}/update-status`,
                          JSON.stringify("Renting"), // Adjust the key as per API requirements
                          {
                            headers: {
                              "Content-Type": "application/json", // Specify the correct Content-Type
                              Authorization: `Bearer ${Cookies.get(
                                "userToken"
                              )}`,
                            },
                          }
                        );
                      })
                    );
                  });
              }
            }

            if (buyItems != "") {
              const groupedItems = buyItems.reduce((acc, item) => {
                const shopId = item.shopId; // Hoặc thuộc tính phân biệt shop
                if (!acc[shopId]) {
                  acc[shopId] = []; // Tạo mảng mới nếu chưa tồn tại
                }
                acc[shopId].push(item); // Thêm item vào mảng tương ứng
                return acc;
              }, {});

              console.log(groupedItems);
              for (const shopId of Object.keys(groupedItems)) {
                console.log(`Shop ID: ${shopId}`);
                console.log("Items:", groupedItems[shopId]); // Mảng của shop này

                console.log(buyItems);

                var totalDepositTmp2 = 0;
                await groupedItems[shopId].map((item, index) => {
                  totalDepositTmp2 += item.price * item.quantity;
                });
                console.log(totalDepositTmp2);
                console.log(shippingInfo.fullName);

                await apiOrder
                  .post(
                    "",
                    {
                      orderDate: new Date().toISOString(),
                      receiveDate: null,
                      totalPrice: totalDepositTmp2,
                      rentPrice: 0,
                      depositeBackMoney: 0,
                      fine: 0,
                      receiveName: shippingInfo.fullName,
                      receiveAddress: oldAddress,
                      receivePhone: shippingInfo.phoneNumber,
                      status: "Delivering",
                      userId: customerInfo.id,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${Cookies.get("userToken")}`,
                      },
                    }
                  )
                  .then(async (response) => {
                    console.log(response.data);
                    await apiNotifications.post(
                      "",
                      {
                        notify: `Bạn có đơn hàng mới mã số ${response.data.id} `,
                        isRead: false,
                        userId: shopId,
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
                        transactionType: "Thanh toán đơn hàng",
                        amount: -parseInt(totalDepositTmp2),
                        date: new Date().toISOString(),
                        walletId: customerInfo.walletId,
                        paymentTypeId: 5,
                        orderId: response.data.id,
                        status: "Success",
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${Cookies.get("userToken")}`,
                        },
                      }
                    );

                    await apiWallets
                      .get("/" + customerInfo.walletId, {
                        headers: {
                          Authorization: `Bearer ${Cookies.get("userToken")}`,
                        },
                      })
                      .then(async (response2) => {
                        await apiWallets.put(
                          `/${response2.data.id}`,
                          {
                            balance: response2.data.balance - totalDepositTmp2,
                            withdrawMethod: response2.data.withdrawMethod,
                            withdrawInfo: response2.data.withdrawInfo,
                            status: response2.data.status,
                            userId: response2.data.userId,
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${Cookies.get(
                                "userToken"
                              )}`,
                            },
                          }
                        );
                      });

                    await Promise.all(
                      groupedItems[shopId].map(async (item, index) => {
                        await apiOrderDetail.post(
                          "",
                          {
                            rentPrice: 0,
                            deposit: 0,
                            unitPrice: item.price,
                            quantity: item.quantity,
                            startDate: null,
                            endDate: null,
                            fine: 0,
                            rentCount: 1,
                            status: "DeliveringToBuyer",
                            orderId: response.data.id,
                            toyId: item.toyId,
                            orderTypeId: item.orderTypeId,
                            ratingId: null,
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${Cookies.get(
                                "userToken"
                              )}`,
                            },
                          }
                        );
                        await apiToys
                          .get("/" + item.toyId, {
                            headers: {
                              Authorization: `Bearer ${Cookies.get(
                                "userToken"
                              )}`,
                            },
                          })
                          .then(async (response) => {
                            await apiToys
                              .put(
                                "/" + item.toyId,
                                {
                                  name: response.data.name,
                                  description: response.data.description,
                                  price: response.data.price,
                                  buyQuantity:
                                    response.data.buyQuantity - item.quantity,
                                  origin: response.data.origin,
                                  age: response.data.age,
                                  brand: response.data.brand,
                                  categoryId: response.data.category.id,
                                  rentCount: response.data.rentCount,
                                  quantitySold:
                                    response.data.quantitySold + item.quantity,
                                  status: response.data.status,
                                },
                                {
                                  headers: {
                                    Authorization: `Bearer ${Cookies.get(
                                      "userToken"
                                    )}`,
                                  },
                                }
                              )
                              .then(async (response) => {});
                          });
                      })
                    );
                  });
              }
            }

            cartItems.map(async (item) => {
              await apiCartItem.delete("/" + item.id, {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              });
            });

            await apiCart
              .put(
                `/${cart.id}`,
                {
                  totalPrice: 0,
                  status: "active",
                  userId: cart.userId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("userToken")}`,
                  },
                }
              )
              .then((response) => {
                navigate("/payments-success");
              });
          }
        } else {
          alert("Bạn nhập thiếu thông tin giao hàng!");
        }
      } else {
        alert("Số dư trong tài khoản của bạn không đủ để thực hiện giao dịch!");
      }
    } else {
      alert("Bạn cần tích vào ô checkbox trước khi đặt hàng.");
    }
  };
  const handleCheckboxChange = () => {
    setUseNewAddress(!useNewAddress);
  };

  return (
    <div>
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
      <div className="flex flex-col py-5 bg-white shadow-md max-w-[1200px] mx-auto">
        {/* Thông tin giao hàng */}
        <div className="bg-gray-100 p-6 rounded-md shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
          <div className="mb-4">
            <label>
              <input
                type="checkbox"
                checked={useNewAddress}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              Sử dụng địa chỉ mới
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Họ và tên:</label>
              <input
                type="text"
                name="fullName"
                value={shippingInfo.fullName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Số điện thoại:</label>
              <input
                type="number"
                name="phoneNumber"
                value={shippingInfo.phoneNumber}
                onChange={handleInputChange}
                className={`w-full border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded-md p-2`}
              />

              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
          {!useNewAddress && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block mb-2 font-medium">
                  Địa chỉ mặc định:
                </label>
                <input
                  type="text"
                  value={oldAddress}
                  className="w-full border border-gray-300 rounded-md p-2"
                  readOnly
                />
              </div>
            </div>
          )}

          {useNewAddress && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">
                  Thành phố/Tỉnh:
                </label>
                <select
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleCityChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Chọn thành phố/tỉnh</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium">Quận/Huyện:</label>
                <select
                  name="district"
                  value={shippingInfo.district}
                  onChange={handleDistrictChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  disabled={!shippingInfo.city}
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium">Phường/Xã:</label>
                <select
                  name="ward"
                  value={shippingInfo.ward}
                  onChange={handleWardChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  disabled={!shippingInfo.district}
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Chi tiết địa chỉ:
                </label>
                <input
                  type="text"
                  name="detail"
                  value={shippingInfo.detail}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Danh sách sản phẩm */}
        <div className="bg-gray-100 p-6 rounded-md shadow-md overflow-y-auto ">
          <h2 className="text-xl font-semibold mb-4">
            Danh sách sản phẩm thuê
          </h2>
          <div className="grid grid-cols-5 text-gray-700 font-semibold border-b pb-2 mb-4">
            <p className="col-span-2"></p>
            <p className="text-center">Số ngày thuê</p>
            <p className="text-center">Giá thuê</p>

            <p className="text-center">Tiền cọc</p>
          </div>
          <div className="border rounded-md p-4">
            {rentItems.length > 0 ? (
              rentItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 items-center border-b py-2"
                >
                  <div className="col-span-2 flex items-center gap-4">
                    <img
                      src={item.toyImgUrls[0]}
                      alt={item.toyName}
                      className="w-16 h-16 object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.toyName}</p>
                    </div>
                  </div>

                  <p className="text-center">
                    {item.orderTypeId === 4
                      ? "7 ngày"
                      : item.orderTypeId === 5
                      ? "14 ngày"
                      : item.orderTypeId === 6
                      ? "1 tháng"
                      : item.price.toLocaleString()}
                  </p>

                  <p className="text-center">
                    {item.rentalPrice && item.rentalPrice
                      ? item.rentalPrice.toLocaleString()
                      : 0}{" "}
                    ₫
                  </p>

                  <p className="text-center font-medium">
                    {(item.price || 0).toLocaleString()} ₫
                  </p>
                </div>
              ))
            ) : (
              <p>Giỏ hàng của bạn đang trống.</p>
            )}
          </div>
        </div>
        <br />
        <div className="bg-gray-100 p-6 rounded-md shadow-md overflow-y-auto ">
          <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm mua</h2>
          <div className="grid grid-cols-5 text-gray-700 font-semibold border-b pb-2 mb-4">
            <p className="col-span-2"></p>
            <p className="text-center">Đơn giá</p>
            <p className="text-center">Số lượng</p>
            <p className="text-center">Tổng tiền</p>
          </div>
          <div className="border rounded-md p-4">
            {buyItems.length > 0 ? (
              buyItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 items-center border-b py-2"
                >
                  {/* Sản phẩm */}
                  <div className="col-span-2 flex items-center gap-4">
                    <img
                      src={item.toyImgUrls[0]}
                      alt={item.toyName}
                      className="w-16 h-16 object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.toyName}</p>
                    </div>
                  </div>
                  {/* Đơn giá */}
                  <p className="text-center">
                    {" "}
                    {(item.price || 0).toLocaleString()} ₫{" "}
                  </p>
                  {/* Số lượng */}
                  <p className="text-center">{item.quantity}</p>
                  {/* Tổng tiền */}
                  <p className="text-center font-medium">
                    {(item.price * item.quantity || 0).toLocaleString()} ₫
                  </p>
                </div>
              ))
            ) : (
              <p>Giỏ hàng của bạn đang trống.</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-between items-start bg-gray-100 p-6 rounded-md shadow-md mt-6">
          {/* Nhập mã voucher */}
          <div className="w-full md:w-1/2 mb-4">
            <h3 className="text-lg font-semibold mb-2">Nhập mã voucher</h3>
            <div className="flex items-center">
              <input
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                className="border border-gray-300 rounded-md p-2 flex-grow"
                placeholder="Nhập mã giảm giá"
              />
              <button
                onClick={handleVoucherApply}
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Áp dụng
              </button>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="w-full md:w-1/2 text-right">
            <h3 className="text-lg font-semibold mb-2">Thông tin thanh toán</h3>
            <p>Tổng tiền hàng: {totalPrice.toLocaleString()} ₫</p>
            <p>Voucher giảm giá: -{discount.toLocaleString()} ₫</p>
            <p className="font-semibold">
              Tổng thanh toán: {totalAfterDiscount.toLocaleString()} ₫
            </p>
            <div className="flex items-center">
              {/* Checkbox */}
              <input
                type="checkbox"
                id="confirmCheckbox"
                className="mr-2 h-5 w-5"
                checked={isChecked}
                onChange={handleCheckboxChange2}
              />
              <label htmlFor="confirmCheckbox" className="text-gray-700">
                Tôi đồng ý với điều khoản đặt hàng
              </label>
              <label
                htmlFor="confirmCheckbox"
                className="text-blue-700 cursor-pointer"
                onClick={() => handleTermsClick()}
              >
                Điều khoản
              </label>

              {/* Nút Đặt hàng */}
              <button
                className={`ml-4 bg-green-500 text-white px-6 py-2 rounded-md ${
                  isChecked
                    ? "hover:bg-green-600"
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (isChecked) handlePayment();
                }}
                disabled={!isChecked} // Vô hiệu hóa nút khi chưa check
              >
                Đặt hàng
              </button>
            </div>
          </div>
        </div>
      </div>
      <ChatForm />
      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default Payment;
