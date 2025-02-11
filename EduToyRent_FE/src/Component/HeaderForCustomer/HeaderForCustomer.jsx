import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie
import axios from "axios";
import apiUser from "../../service/ApiUser";
import apiToys from "../../service/ApiToys";
import apiWallets from "../../service/ApiWallets";
import apiCart from "../../service/ApiCart";
import apiCartItem from "../../service/ApiCartItem";
import exampleImage from "../../assets/UserUnknow.png";
import Notifications from "../Notification/Notification";
import { jwtDecode } from "jwt-decode";
import Logo from "../../assets/logoETR.png";
import apiOrderTypes from "../../service/ApiOrderTypes";
const HeaderForCustomer = () => {
  const [cartVisible, setCartVisible] = useState(false);
  const [rentItems, setRentItems] = useState([]);
  const [buyItems, setBuyItems] = useState([]);
  const [totalRentPrice, setTotalRentPrice] = useState(0);
  const [totalBuyPrice, setTotalBuyPrice] = useState(0);
  const [userData, setUserData] = useState("");
  const [userWallets, setUserWallets] = useState();
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState({});
  const [userId, setUserId] = useState(null);
  const [userWallet, setUserWallet] = useState(""); // Thêm state này
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartId, setCartId] = useState("");
  const [loading, setLoading] = useState(false);
  const handleMouseEnter = () => setIsDropdownOpen(true);
  const handleMouseLeave = () => setIsDropdownOpen(false);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [orderType, setOrderType] = useState([]);
  const navigateTo = (url) => {
    navigate(url);
  };

  const handleTopUp = () => {
    navigate("/top-up");
  };
  useEffect(() => {
    const token = Cookies.get("userToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const extractedUserId =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
        console.log("Decoded user ID from token:", extractedUserId);
        setUserId(extractedUserId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.log("No token found in cookies.");
    }
  }, []);
  useEffect(() => {
    const userDataCookie = Cookies.get("userData");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);
      console.log(parsedUserData);

      //setUserData(parsedUserData);
      const email = parsedUserData.email;

      const fetchUserData = async () => {
        try {
          const token = Cookies.get("userToken");
          if (!token) {
            console.error("Token không hợp lệ hoặc hết hạn.");
            return;
          }

          // Gọi API lấy thông tin người dùng dựa trên email
          const response = await apiUser.get(
            `/ByEmail?email=${encodeURIComponent(
              email
            )}&pageIndex=1&pageSize=5`,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );

          console.log("Dữ liệu trả về:", response.data);

          console.log("Dữ liệu trả về đã lưu:", response.data);
          if (response.data && response.data.length > 0) {
            const user = response.data[0];
            setUserData(user);
            console.log(user);

            setUserId(user.id);
            setEditedData(user);

            // Sau khi có userId, gọi API giỏ hàng
            fetchUserCart(user.id); // Kiểm tra có cartId hay không

            // Sau khi có walletId, gọi API ví
            if (user.walletId) {
              fetchWalletData(user.walletId);
            } else {
              console.error("Không tìm thấy walletId cho người dùng.");
            }
          } else {
            console.error("Không tìm thấy thông tin người dùng.");
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
      };

      // Hàm lấy giỏ hàng của người dùng theo userId
      const fetchUserCart = async (userId) => {
        try {
          const response = await apiCart.get(`?pageIndex=1&pageSize=1000`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          });

          console.log("Tất cả giỏ hàng:", response.data);

          // Lọc giỏ hàng theo userId
          const userCart = response.data.filter(
            (cart) => cart.userId === userId
          );

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

      // Hàm lấy các mục trong giỏ hàng theo cartId
      const fetchCartItems = async (cartId) => {
        try {
          if (!cartId) {
            console.error("Không tìm thấy cartId");
            return;
          }

          const response = await apiCartItem.get(`/ByCartId/${cartId}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          });

          console.log("Các mục trong giỏ hàng:", response.data);
          // Thực hiện thêm các bước xử lý với dữ liệu CartItems (ví dụ: setCartItems(response.data))
        } catch (error) {
          //console.error("Lỗi khi lấy các mục trong giỏ hàng:", error);
        }
      };

      // Hàm lấy thông tin ví của người dùng dựa trên walletId
      const fetchWalletData = async (walletId) => {
        try {
          const response = await apiWallets.get(`/${walletId}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          });

          console.log("Thông tin ví của người dùng:", response.data);
          setUserWallet(response.data); // Lưu thông tin ví vào state nếu cần
        } catch (error) {
          console.error("Lỗi khi lấy thông tin ví của người dùng:", error);
        }
      };
      LoadOrderTypes();
      fetchUserData();
    } else {
      //console.error("Không tìm thấy thông tin người dùng trong cookie.");
    }

    const userWalletsCookie = Cookies.get("userData");
    if (userWalletsCookie) {
      const parsedUserWallets = JSON.parse(userWalletsCookie);
      setUserWallets(parsedUserWallets);
    } else {
      //console.error("Không tìm thấy thông tin người dùng trong cookie.");
    }
  }, []);
  const logOut = () => {
    // Log cookie trước khi xóa
    console.log("Trước khi xóa:", Cookies.get("userData"));

    // Xóa cookie userData
    Cookies.remove("userData", { path: "/" });
    Cookies.remove("userToken", { path: "/" });
    Cookies.remove("userDataReal", { path: "/" });

    // Log cookie sau khi xóa
    console.log("Sau khi xóa:", Cookies.get("userData")); // Kết quả nên là undefined nếu cookie đã bị xóa

    // Chuyển hướng về trang đăng nhập
    navigate("/");
  };

  const toggleCart = () => {
    // Mở hoặc đóng giỏ hàng
    setCartVisible(!cartVisible);
    if (!cartVisible) {
      loadCartFromDatabase(); // Tải lại giỏ hàng từ cookie khi mở giỏ hàng
    }
  };

  // Load giỏ hàng từ database
  const loadCartFromDatabase = async () => {
    setLoading(true);
    try {
      if (!cartId) {
        console.error("Không tìm thấy cartId");
        return;
      }

      const response = await apiCartItem.get(`/ByCartId/${cartId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Dữ liệu trả về từ API:", response.data);

      // Kiểm tra nếu giỏ hàng trống
      if (!response.data || response.data.length === 0) {
        console.log("Giỏ hàng trống");
        setRentItems([]);
        setBuyItems([]);
        return; // Giỏ hàng trống, có thể hiển thị thông báo cho người dùng
      }
      // Tạo các danh sách rentItems và buyItems dựa vào quantity
      const rentItems = response.data
        .filter((item) => item.quantity === -1)
        .map((item) => ({
          ...item,
          rentalDuration: calculateRentalDuration(item.orderTypeId),
        }));
      const buyItems = response.data.filter((item) => item.quantity >= 1);

      // Lưu vào state
      setRentItems(rentItems);
      setBuyItems(buyItems);

      console.log("Rental Items:", rentItems);
      console.log("Purchase Items:", buyItems);
    } catch (error) {
      // Kiểm tra lỗi 404 và xử lý giỏ hàng trống
      // if (error.response && error.response.status === 404) {
      //   console.log("Giỏ hàng trống với ID:", cartId);
      //   setRentItems([]);
      //   setBuyItems([]);
      //   return; // Xử lý giỏ hàng trống
      // }
      // console.error("Lỗi khi tải giỏ hàng từ cơ sở dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartQuantity = async (cartItemId, newQuantity, action) => {
    try {
      if (!cartId) {
        console.error("Không tìm thấy cartId");
        alert("Giỏ hàng không hợp lệ.");
        return;
      }

      // Nếu số lượng mới <= 0, không thực hiện cập nhật
      if (newQuantity <= 0) {
        alert("Số lượng phải lớn hơn 0");
        return;
      }

      // Gọi API để lấy danh sách sản phẩm trong giỏ hàng theo cartId
      const response = await apiCartItem.get(`/ByCartId/${cartId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      // Kiểm tra nếu có dữ liệu trong giỏ hàng
      const cartItems = response.data || [];
      const existingItem = cartItems.find((item) => item.id === cartItemId);

      if (!existingItem) {
        console.log("Không tìm thấy sản phẩm trong giỏ hàng.");
        alert("Không tìm thấy sản phẩm trong giỏ hàng.");
        return;
      }

      // Tạo đối tượng dữ liệu gửi đi với số lượng mới
      const updatedItemData = {
        price: existingItem.price,
        quantity: newQuantity, // Sử dụng số lượng mới
        status: existingItem.status,
        cartId: existingItem.cartId,
        toyId: existingItem.toyId,
        toyName: existingItem.toyName,
        orderTypeId: existingItem.orderTypeId,
        toyImgUrls: existingItem.toyImgUrls,
      };

      // Gửi yêu cầu PUT để cập nhật số lượng trong giỏ hàng
      const updateResponse = await apiCartItem.put(
        `/${existingItem.id}`, // URL yêu cầu API với ID sản phẩm
        updatedItemData // Dữ liệu gửi đi
      );

      // Kiểm tra phản hồi từ API
      if (updateResponse.status === 204) {
        console.log(`Số lượng sản phẩm đã được cập nhật: ${newQuantity}`);
        //alert("Số lượng sản phẩm đã được cập nhật!");
        // Sau khi cập nhật thành công, gọi lại hàm để tải lại giỏ hàng
        loadCartFromDatabase();
      } else {
        console.error("Lỗi khi cập nhật số lượng sản phẩm", updateResponse);
        alert("đã đạt giới hạn số lượng sản phẩm trong kho.");
      }
    } catch (error) {
      // Log lỗi khi gọi API lấy dữ liệu giỏ hàng
      console.error("Lỗi khi gọi API lấy giỏ hàng:", error);
      alert("đã đạt giới hạn số lượng sản phẩm trong kho.");
    }
  };

  useEffect(() => {
    console.log("Rent items:", rentItems);

    // Tính tổng giá thuê và tiền cọc
    const newTotalRentPrice = rentItems.reduce((total, item) => {
      console.log("Item:", item); // Log mỗi sản phẩm để kiểm tra

      // Tính giá thuê cho sản phẩm
      const rentalPrice = calculateRentalPrice(
        item.toyPrice,
        item.rentalDuration
      );
      console.log("Rental Price for this item:", rentalPrice); // Log giá thuê

      // Tính tiền cọc (cọc = giá thật của toy)
      const depositPrice = item.toyPrice;
      console.log("Deposit Price for this item:", depositPrice); // Log tiền cọc

      // Cộng cả tiền thuê và tiền cọc vào tổng
      return total + rentalPrice;
    }, 0);

    // Tính tổng tiền cọc cho tất cả các sản phẩm
    const newTotalDeposit = rentItems.reduce((total, item) => {
      return total + item.toyPrice; // Cộng tiền cọc (giá thật của toy) cho mỗi item
    }, 0);

    console.log("Total Rent Price including deposit:", newTotalRentPrice); // Log tổng giá thuê và tiền cọc
    console.log("Total Deposit:", newTotalDeposit); // Log tổng tiền cọc

    setTotalRentPrice(newTotalRentPrice); // Cập nhật state tổng giá thuê và tiền cọc
    setTotalDeposit(newTotalDeposit); // Cập nhật state tổng tiền cọc
  }, [rentItems]); // Hook này sẽ chạy lại mỗi khi rentItems thay đổi
  useEffect(() => {
    const newTotalBuyPrice = buyItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    setTotalBuyPrice(newTotalBuyPrice);
  }, [buyItems]);

  useEffect(() => {
    if (cartId) {
      loadCartFromDatabase(cartId);
    }
  }, [cartId]);

  const removeItem = async (itemId, type) => {
    try {
      const response = await apiCartItem.delete(`/${itemId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      if (response.status === 204) {
        if (type === "rent") {
          const updatedRentItems = rentItems.filter(
            (item) => item.id !== itemId
          );
          setRentItems(updatedRentItems);
          console.log("Đã xoá sản phẩm thuê khỏi giỏ hàng");
        } else {
          const updatedBuyItems = buyItems.filter((item) => item.id !== itemId);
          setBuyItems(updatedBuyItems);
          console.log("Đã xoá sản phẩm bán khỏi giỏ hàng");
        }

        loadCartFromDatabase();
      } else {
        console.error(
          "Lỗi khi xóa sản phẩm khỏi giỏ hàng:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Đã xảy ra lỗi khi xóa sản phẩm:", error);
    }
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
  const calculateRentalPrice = (price, duration) => {
    // Ánh xạ duration tiếng Việt sang tiếng Anh
    const durationMapping = {
      "1 tuần": "1 week",
      "2 tuần": "2 week",
      "1 tháng": "4 week",
      Mua: "buy",
    };

    const mappedDuration = durationMapping[duration];

    if (!mappedDuration) {
      console.error("Không tìm thấy ánh xạ cho thời gian thuê:", duration);
      return 0;
    }

    // Tìm đối tượng trong orderType dựa trên mappedDuration
    const matchingOrder = orderType.find(
      (item) => item.time === mappedDuration
    );

    if (!matchingOrder) {
      console.error("Không tìm thấy thời gian thuê phù hợp:", mappedDuration);
      return 0;
    }

    const rentalPrice = price * (matchingOrder.percentPrice || 0);
    console.log("Rental Price:", rentalPrice);

    return rentalPrice;
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
  // Hàm cập nhật thời gian thuê khi người dùng nhấn vào nút
  const updateOrderTypeId = async (cartItemId, newOrderTypeId) => {
    try {
      if (!cartId) {
        console.error("Không tìm thấy cartId");
        alert("Giỏ hàng không hợp lệ.");
        return;
      }

      const response = await apiCartItem.get(`/ByCartId/${cartId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const cartItems = response.data || [];
      const existingItem = cartItems.find((item) => item.id === cartItemId);

      if (!existingItem) {
        console.log("Không tìm thấy sản phẩm trong giỏ hàng.");
        alert("Không tìm thấy sản phẩm trong giỏ hàng.");
        return;
      }

      const updatedItemData = {
        ...existingItem,
        orderTypeId: newOrderTypeId, // Cập nhật orderTypeId
      };

      const updateResponse = await apiCartItem.put(
        `/${existingItem.id}`,
        updatedItemData
      );

      if (updateResponse.status === 204) {
        console.log(`OrderTypeId đã được cập nhật: ${newOrderTypeId}`);
        //alert("Thời gian thuê đã được cập nhật!");
        loadCartFromDatabase();
      } else {
        console.error("Lỗi khi cập nhật orderTypeId", updateResponse);
        alert("Có lỗi xảy ra khi cập nhật thời gian thuê.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      alert("Có lỗi xảy ra khi cập nhật giỏ hàng.");
    }
  };
  const updateRentalDuration = (itemId, duration) => {
    setRentItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, rentalDuration: duration } : item
      )
    );
  };

  const HandlePayment = () => {
    if (rentItems != "" || buyItems != "") {
      navigate("/payment");
    } else {
      alert("Bạn chưa chọn sản phẩm nào.");
    }
  };

  const HandleToyDetail = (item) => {
    console.log(item);
    if (item.quantity >= 0) {
      Cookies.set("toySaleDetailId", item.toyId, { expires: 30 });
      console.log("Toy Sale Detail ID:", Cookies.get("toySaleDetailId"));
      navigate("/toys-sale-details");
    } else if (item.quantity < 0) {
      Cookies.set("toyRentDetailId", item.toyId, { expires: 30 });
      console.log("Toy Rent Detail ID:", Cookies.get("toyRentDetailId"));
      navigate("/toys-rent-details");
    }
  };
  const toggleNotificationForm = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };
  return (
    <>
      {Cookies.get("userData") ? (
        <div className="bg-white shadow-md">
          <div className="flex items-center justify-between gap-8 p-6">
            <div className="flex items-center gap-4 text-[#0e161b]">
              {/* Nội dung cho người dùng đã đăng nhập a*/}
              <Link to="/">
                <img
                  src={Logo}
                  alt="User Avatar"
                  width="50px"
                  height="50px"
                  className="rounded-full"
                />
              </Link>
              <Link to="/">
                <h2 className="text-[#0e161b] text-lg font-bold leading-tight tracking-[-0.015em]">
                  EduToyRent
                </h2>
              </Link>
            </div>
            <div className="flex gap-2">
              <div className="flex justify-center items-center">
                <p>Số dư : {(userWallet.balance || 0).toLocaleString()} VND</p>
              </div>
              <button
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                onClick={handleTopUp} // Hàm xử lý khi nhấn vào nút
              >
                <div className="text-[#0e161b]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    {/* SVG biểu tượng phù hợp cho "Nạp tiền" */}
                    <path d="M128,8a120,120,0,1,0,120,120A120.14,120.14,0,0,0,128,8Zm56,120a8,8,0,0,1-8,8H136v40a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V80a8,8,0,0,1,16,0v40h40A8,8,0,0,1,184,128Z"></path>
                  </svg>
                </div>
                <span>Nạp tiền</span>
              </button>
              <div className="relative">
                {/* Nút Notification */}
                <button
                  className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                  onClick={toggleNotificationForm}
                >
                  <div className="text-[#0e161b]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20px"
                      height="20px"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C9.243 2 7 4.243 7 7v3.08C5.5 11.215 4 13.294 4 15.5V18l-2 2v1h20v-1l-2-2v-2.5c0-2.206-1.5-4.285-3-5.42V7c0-2.757-2.243-5-5-5zm-3 5c0-1.654 1.346-3 3-3s3 1.346 3 3v3h-6V7zm9 11H6v-2.5c0-1.38.966-2.733 2.578-3.345L9 12.806V13h6v-.194l.422.15C17.034 13.767 18 15.12 18 16.5V18zm-3.29 2a3.972 3.972 0 0 1-7.42 0h7.42z"></path>
                    </svg>
                  </div>
                </button>

                {/* Form Notification */}
                {isNotificationOpen && (
                  <div
                    className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg w-96 h-auto p-4"
                    style={{ zIndex: 1 }}
                  >
                    <Notifications show={isNotificationOpen} />
                  </div>
                )}
              </div>
              <button
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                onClick={toggleCart}
              >
                <div className="text-[#0e161b]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"></path>
                  </svg>
                </div>
              </button>
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative flex items-center space-x-2 "
                style={{ zIndex: 10 }}
              >
                {userData.avatarUrl ? (
                  <div className="text-[#0e161b]">
                    <img
                      src={userData.avatarUrl}
                      alt="User Avatar"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "50%", // làm tròn góc hình ảnh
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-[#0e161b]">
                    <img
                      src={exampleImage}
                      alt="User Avatar"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "50%", // làm tròn góc hình ảnh
                      }}
                    />
                  </div>
                )}

                <div className="flex justify-center items-center">
                  <p>{userData.fullName || userData.name}</p>
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full mt-0 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                    <button
                      onClick={() => navigateTo("/information-customer")}
                      className="block w-full text-left p-2 hover:bg-gray-100"
                    >
                      Thông tin người dùng
                    </button>
                    <button
                      onClick={() => navigateTo("/information-lessor")}
                      className="block w-full text-left p-2 hover:bg-gray-100"
                    >
                      Cửa hàng của tôi
                    </button>
                    <button
                      onClick={logOut}
                      className="block w-full text-left p-2 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
              {cartVisible && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50"
                  onClick={toggleCart}
                >
                  <div
                    className="cart-modal bg-white p-4 shadow-md rounded-md w-[700px] h-full flex flex-col justify-between z-[10000]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex-grow overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Giỏ hàng của bạn</h2>
                        <button
                          className="text-gray-600 hover:text-gray-800 text-2xl"
                          onClick={toggleCart}
                        >
                          &times;
                        </button>
                      </div>
                      <h3 className="font-bold mb-2 mt-4">Đơn Thuê Sản Phẩm</h3>
                      <div className="flex-grow overflow-y-auto max-h-72">
                        {rentItems.length === 0 ? (
                          <p>Không có sản phẩm nào.</p>
                        ) : (
                          rentItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center mb-4 relative"
                            >
                              {/* Thêm onClick cho ảnh */}
                              <img
                                src={item.toyImgUrls[0]}
                                alt={item.toyName}
                                className="w-20 h-20 object-cover mr-4 cursor-pointer"
                                onClick={() => HandleToyDetail(item)}
                              />
                              <div className="flex-grow">
                                {/* Thêm onClick cho tên sản phẩm */}
                                <h3
                                  className="font-bold cursor-pointer"
                                  onClick={() => HandleToyDetail(item)}
                                >
                                  {item.toyName}
                                </h3>
                                <div className="flex flex-col">
                                  {/* Chọn thời gian thuê */}
                                  <div className="flex justify-between items-center mb-2">
                                    <p className="mr-4">
                                      Giá gốc:{" "}
                                      {(item.toyPrice || 0).toLocaleString()}{" "}
                                      VNĐ
                                    </p>
                                  </div>
                                  <div className="flex space-x-4">
                                    <button
                                      className={`border px-4 py-2 ${
                                        item.rentalDuration === "1 tuần"
                                          ? "bg-blue-500 text-white"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        updateRentalDuration(item.id, "1 tuần");
                                        updateOrderTypeId(item.id, 4);
                                      }}
                                    >
                                      1 tuần
                                    </button>
                                    <button
                                      className={`border px-4 py-2 ${
                                        item.rentalDuration === "2 tuần"
                                          ? "bg-blue-500 text-white"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        updateRentalDuration(item.id, "2 tuần");
                                        updateOrderTypeId(item.id, 5);
                                      }}
                                    >
                                      2 tuần
                                    </button>
                                    <button
                                      className={`border px-4 py-2 ${
                                        item.rentalDuration === "1 tháng"
                                          ? "bg-blue-500 text-white"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        updateRentalDuration(
                                          item.id,
                                          "1 tháng"
                                        );
                                        updateOrderTypeId(item.id, 6);
                                      }}
                                    >
                                      1 tháng
                                    </button>
                                  </div>
                                  {/* Hiển thị giá thay đổi theo thời gian thuê */}
                                  <div className="mt-2">
                                    <p className="font-bold">
                                      Giá thuê:{" "}
                                      {(
                                        calculateRentalPrice(
                                          item.toyPrice,
                                          item.rentalDuration
                                        ) || 0
                                      ).toLocaleString()}{" "}
                                      VNĐ
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <button
                                className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-xl font-bold"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Bạn có chắc chắn muốn xóa sản phẩm này không?"
                                    )
                                  ) {
                                    removeItem(item.id, "rent");
                                  }
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <h3 className="font-bold mb-2 mt-4">Đơn Mua Sản Phẩm</h3>
                      <div className="flex-grow overflow-y-auto max-h-72">
                        {buyItems.length === 0 ? (
                          <p>Không có sản phẩm nào.</p>
                        ) : (
                          buyItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center mb-4 relative"
                            >
                              <img
                                src={item.toyImgUrls[0]}
                                alt={item.toyName}
                                className="w-20 h-20 object-cover mr-4 cursor-pointer"
                                onClick={() => HandleToyDetail(item)} // Thêm sự kiện click vào hình ảnh
                              />
                              <div className="flex-grow">
                                <h3
                                  className="font-bold cursor-pointer"
                                  onClick={() => HandleToyDetail(item)} // Thêm sự kiện click vào tên sản phẩm
                                >
                                  {item.toyName}
                                </h3>
                                <div className="flex justify-between items-center">
                                  <p className="mr-4">
                                    Giá: {(item.price || 0).toLocaleString()}{" "}
                                    VNĐ
                                  </p>
                                  <div className="flex items-center">
                                    {/* Nút giảm số lượng */}
                                    <button
                                      className="border px-2 py-1 mr-2"
                                      onClick={() =>
                                        updateCartQuantity(
                                          item.id, // ID sản phẩm
                                          item.quantity - 1, // Số lượng giảm đi 1
                                          "buy" // Hành động "mua"
                                        )
                                      }
                                      disabled={item.quantity <= 1} // Disable nếu quantity <= 1
                                    >
                                      -
                                    </button>
                                    <span>{item.quantity}</span>
                                    {/* Nút tăng số lượng */}
                                    <button
                                      className="border px-2 py-1 ml-2"
                                      onClick={() =>
                                        updateCartQuantity(
                                          item.id, // ID sản phẩm
                                          item.quantity + 1, // Số lượng tăng lên 1
                                          "buy" // Hành động "mua"
                                        )
                                      }
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <button
                                className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-xl font-bold"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Bạn có chắc chắn muốn xóa sản phẩm này không?"
                                    )
                                  ) {
                                    removeItem(item.id, "buy"); // Xóa item với id tương ứng
                                  }
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Phần tổng tiền nằm ở đáy */}
                    <div className="border-t border-gray-200 bg-white py-4 flex flex-col items-center justify-center">
                      <p className="text-sm self-start ml-4">
                        Tổng tiền thuê: {(totalRentPrice || 0).toLocaleString()}{" "}
                        VNĐ
                      </p>
                      <p className="text-sm self-start ml-4">
                        Tổng tiền cọc: {(totalDeposit || 0).toLocaleString()}{" "}
                        VNĐ
                      </p>
                      <p className="text-sm self-start ml-4">
                        Tổng tiền mua: {(totalBuyPrice || 0).toLocaleString()}{" "}
                        VNĐ
                      </p>

                      <h1 className="text-md font-semibold text-red-700">
                        Tổng tiền:{" "}
                        {(totalDeposit + totalBuyPrice || 0).toLocaleString()}{" "}
                        VNĐ
                      </h1>
                      <button
                        onClick={() => {
                          HandlePayment();
                        }}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                      >
                        Thanh toán
                      </button>
                    </div>
                  </div>
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      ) : (
        <div className="bg-white shadow-md">
          <div className="flex items-center justify-between gap-8 p-6">
            <div className="flex items-center gap-4 text-[#0e161b]">
              {/* Nội dung cho người dùng chưa đăng nhập */}
              <Link to="/">
                <img
                  src={Logo}
                  alt="User Avatar"
                  width="50px"
                  height="50px"
                  className="rounded-full"
                />
              </Link>
              <Link to="/">
                <h2 className="text-[#0e161b] text-lg font-bold leading-tight tracking-[-0.015em]">
                  EduToyRent
                </h2>
              </Link>
            </div>
            {/* <label className="flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
              <div className="text-[#507a95] flex border-none bg-[#e8eef3] items-center justify-center pl-4 rounded-l-xl border-r-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <input
                placeholder="Search"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e161b] focus:outline-0 focus:ring-0 border-none bg-[#e8eef3] h-full placeholder:text-[#507a95] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                value=""
              />
            </div>
          </label> */}
            <div className="flex gap-2">
              <Link to="/login">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#47a6e6] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Đăng nhập</span>
                </button>
              </Link>
              <Link to="/register">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Đăng ký</span>
                </button>
              </Link>
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                <div className="text-[#0e161b]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                  </svg>
                </div>
              </button>
              <button
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                onClick={toggleCart}
              >
                <div className="text-[#0e161b]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"></path>
                  </svg>
                </div>
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}
    </>
  );
};

export default HeaderForCustomer;
