import React, { useState, useEffect } from "react";
import axios from "axios";
import { Outlet } from "react-router-dom";
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
  const [cartId, setCartId] = useState("");
  const [customerInfo, setCustomerInfo] = useState({});
  const [rentItems, setRentItems] = useState([]);
  const [buyItems, setBuyItems] = useState([]);
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [wallet, setWallet] = useState({});

  const [citiesTmp, setCitiesTmp] = useState(""); // Thành phố
  const [districtsTmp, setDistrictsTmp] = useState(""); // Quận/Huyện
  const [wardsTmp, setWardsTmp] = useState(""); // Phường/Xã

  useEffect(() => {
    const userDataCookie = Cookies.get("userDataReal");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);
      setCustomerInfo(parsedUserData[0]);
      console.log(parsedUserData[0]);
      fetchUserCart(parsedUserData[0].id);

      apiWallets.get("/" + parsedUserData[0].walletId).then((response) => {
        setWallet(response.data);
      });
    }

    // Lấy danh sách thành phố từ API bên thứ ba
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
      const userCart = response.data.filter((cart) => cart.userId === userId);

      if (userCart.length > 0) {
        const cart = userCart[0];
        const cartId = cart.id;

        setCartId(cartId); // Lưu cartId vào state
        fetchCartItems(cartId); // Gọi API lấy CartItems
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
        .then((response) => {
          setCartItems(response.data);

          // Tạo các danh sách rentItems và buyItems dựa vào quantity
          const rentItems = response.data
            .filter((item) => item.quantity === -1)
            .map((item) => ({
              ...item,
              rentalDuration: calculateRentalDuration(item.orderTypeId), // Chuyển sang dùng orderTypeId
            }));
          const buyItems = response.data.filter((item) => item.quantity >= 1);

          // Lưu vào state
          setRentItems(rentItems);
          setBuyItems(buyItems);
        });

      console.log("Các mục trong giỏ hàng:", response.data);
    } catch (error) {}
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

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setShippingInfo({ ...shippingInfo, district: selectedDistrict, ward: "" });
    axios
      .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
      .then((response) => {
        setWards(response.data.wards);
      });
  };

  const handleWardChange = (e) => {
    setShippingInfo({ ...shippingInfo, ward: e.target.value });
  };

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
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
    if (wallet.balance >= totalAfterDiscount) {
      if (
        shippingInfo.fullName != "" &&
        shippingInfo.phoneNumber != "" &&
        shippingInfo.detail != "" &&
        shippingInfo.ward != "" &&
        shippingInfo.district != "" &&
        shippingInfo.city != ""
      ) {
        const city = cities.find((city) => city.code == shippingInfo.city).name;
        const distric = districts.find(
          (district) => district.code == shippingInfo.district
        ).name;
        const war = wards.find((ward) => ward.code == shippingInfo.ward).name;

        if (rentItems != "") {
          var totalRentPriceTmp = 0;
          rentItems.map((item, index) => {
            if (item.orderTypeId == 4) {
              totalRentPriceTmp += item.price * 0.15;
            } else if (item.orderTypeId == 5) {
              totalRentPriceTmp += item.price * 0.25;
            } else if (item.orderTypeId == 6) {
              totalRentPriceTmp += item.price * 0.3;
            }
          });

          var totalDepositTmp = 0;
          rentItems.map((item, index) => {
            totalDepositTmp += item.price;
          });
          console.log(totalDepositTmp);
          console.log(shippingInfo.fullName);
          console.log(
            shippingInfo.detail + "," + war + "," + distric + "," + city
          );

          apiOrder
            .post("", {
              orderDate: new Date().toISOString(),
              receiveDate: null,
              totalPrice: totalDepositTmp,
              rentPrice: totalRentPriceTmp,
              depositeBackMoney: 0,
              receiveName: shippingInfo.fullName,
              receiveAddress:
                shippingInfo.detail + "," + war + "," + distric + "," + city,
              receivePhone: shippingInfo.phoneNumber,
              status: "Inactive",
              userId: customerInfo.id,
            })
            .then((response) => {
              console.log(response.data);
              rentItems.map((item, index) => {
                var rentPriceTmp = 0;
                if (item.orderTypeId == 4) {
                  rentPriceTmp = item.price * 0.15;
                } else if (item.orderTypeId == 5) {
                  rentPriceTmp = item.price * 0.25;
                } else if (item.orderTypeId == 6) {
                  rentPriceTmp = item.price * 0.3;
                }
                apiOrderDetail.post("", {
                  rentPrice: rentPriceTmp,
                  deposit: item.price,
                  unitPrice: item.price,
                  quantity: -1,
                  startDate: null,
                  endDate: null,
                  status: "delivery",
                  orderId: response.data.id,
                  toyId: item.toyId,
                  orderTypeId: item.orderTypeId,
                  ratingId: null,
                });
              });
            });
        }
        if (buyItems != "") {
          console.log(buyItems);
        }
      } else {
        alert("Bạn nhập thiếu thông tin giao hàng!");
      }
    } else {
      alert("Số dư trong tài khoản của bạn không đủ để thực hiện giao dịch!");
    }
  };

  return (
    <div>
      <header>
        <HeaderForCustomer />
      </header>
      <div className="flex flex-col py-5 bg-white shadow-md max-w-[1200px] mx-auto">
        {/* Thông tin giao hàng */}
        <div className="bg-gray-100 p-6 rounded-md shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
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
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Thành phố/Tỉnh:</label>
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
        </div>

        {/* Danh sách sản phẩm */}
        <div className="bg-gray-100 p-6 rounded-md shadow-md overflow-y-auto ">
          <h2 className="text-xl font-semibold mb-4">
            Danh sách sản phẩm thuê
          </h2>
          <div className="grid grid-cols-5 text-gray-700 font-semibold border-b pb-2 mb-4">
            <p className="col-span-2"></p>
            <p className="text-center">Đơn giá</p>
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
                      src={item.toyImgUrls}
                      alt={item.toyName}
                      className="w-16 h-16 object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.toyName}</p>
                    </div>
                  </div>

                  <p className="text-center">
                    {(item.price || 0).toLocaleString()} ₫
                  </p>

                  <p className="text-center">
                    {item.orderTypeId === 4
                      ? item.price * 0.15
                      : item.orderTypeId === 5
                      ? item.price * 0.25
                      : item.orderTypeId === 6
                      ? item.price * 0.3
                      : item.price}
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
                      src={item.toyImgUrls}
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
            <button
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => handlePayment()}
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default Payment;
