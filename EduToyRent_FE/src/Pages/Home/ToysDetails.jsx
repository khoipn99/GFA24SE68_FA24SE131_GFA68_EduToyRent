import React, { useState, useEffect } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import apiToys from "../../service/ApiToys";
import apiRatings from "../../service/ApiRatings";
import apiCategory from "../../service/ApiCategory";
import apiCartItem from "../../service/ApiCartItem";
import apiUser from "../../service/ApiUser";
import apiMedia from "../../service/ApiMedia";
import apiWallets from "../../service/ApiWallets";
import apiCart from "../../service/ApiCart";
import apiConversations from "../../service/ApiConversations";
import ChatForm from "../Chat/ChatForm";
import { useNavigate } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // Import các biểu tượng sao
import apiOrderTypes from "../../service/ApiOrderTypes";
const ToysDetails = () => {
  const [userData, setUserData] = useState("");
  const [userId, setUserId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [cartId, setCartId] = useState(null);
  const navigate = useNavigate();
  const [rentalDuration, setRentalDuration] = useState("1 tuần");
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [selectedToy, setSelectedToy] = useState(null);
  const starRating = 4.0; // Số sao (giả sử)
  const reviewCount = 25; // Số lượt đánh giá (giả sử)
  const ratings = [
    { score: 5, percentage: 60 },
    { score: 4, percentage: 20 },
    { score: 3, percentage: 10 },
    { score: 2, percentage: 5 },
    { score: 1, percentage: 5 },
  ];

  const [prices, setPrices] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentToy, setCurrentToy] = useState({});
  const [owner, setOwner] = useState({});
  const [reviews, setReviews] = useState([]);
  const [currentPicture, setCurrentPicture] = useState([]);
  const [currentMedia, setCurrentMedia] = useState([]);
  const [toysOfShop, setToysOfShop] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rentItems, setRentItems] = useState([]);
  const [orderType, setOrderType] = useState([]);
  // Mặc định tính giá thuê 1 tuần khi mở trang
  useEffect(() => {
    if (currentToy) {
      handleDurationChange("1 tuần");
    }
  }, [currentToy]); // Chỉ chạy khi currentToy thay đổi
  const handleMediaClick = (mediaUrl) => {
    setCurrentMedia(mediaUrl);
  };

  const isVideoUrl = (url) => {
    if (url != "") {
      const fileExtension = url.mediaUrl.split("?")[0];
      return /\.(mp4|mov|avi|mkv)$/i.test(fileExtension);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    apiToys.get("/" + Cookies.get("toyRentDetailId")).then((response) => {
      console.log(response.data);
      setOwner(response.data.owner);
      setCurrentToy(response.data);
      setCurrentPrice(response.data.price * 0.15);
      setPrices(response.data.price);
      loadReviews(response.data.id);

      setCurrentMedia(response.data.media[0]);
      setCurrentPicture(response.data.media);
      apiToys
        .get(
          "/user/" +
            response.data.owner.id +
            "?status=Active&pageIndex=1&pageSize=6"
        )
        .then((response) => {
          setToysOfShop(response.data);
        });
    });
  }, []);

  const loadReviews = async (id) => {
    try {
      const response = await apiRatings.get("/ByToyId/" + id, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      setReviews(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const itemsPerPage = 5;

  const indexOfLastReview = currentPage * itemsPerPage;
  const indexOfFirstReview = indexOfLastReview - itemsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  useEffect(() => {
    const userDataCookie = Cookies.get("userData");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);
      setUserData(parsedUserData);
      const email = parsedUserData.email;

      if (parsedUserData.roleId == 4) {
        navigate("/staff");
      } else if (parsedUserData.roleId == 1) {
        navigate("/admin");
      } else if (parsedUserData.roleId == 2) {
        navigate("/toySupplier");
      }

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

          if (response.data && response.data.length > 0) {
            const user = response.data[0]; // Lấy đối tượng người dùng đầu tiên trong mảng
            setUserData(user);
            setUserId(user.id);
            setEditedData(user); // Cập nhật dữ liệu chỉnh sửa với thông tin của người dùng

            // Sau khi có userId, gọi API giỏ hàng
            fetchUserCart(user.id);
          } else {
            console.error("Không tìm thấy thông tin người dùng.");
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
      };

      const fetchUserCart = async (userId) => {
        try {
          const response = await apiCart.get(`?pageIndex=1&pageSize=50`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          });

          console.log("Tất cả giỏ hàng:", response.data);

          // Log userId để đảm bảo giá trị userId được truyền vào đúng
          console.log("UserId cần lọc:", userId);

          // Lọc giỏ hàng theo userId
          const userCart = response.data.filter(
            (cart) => cart.userId === userId
          );

          // Log kết quả của userCart sau khi lọc
          console.log("Giỏ hàng sau khi lọc theo userId:", userCart);

          if (userCart.length > 0) {
            const cart = userCart[0];
            const cartId = cart.id;

            console.log("CartId được chọn:", cartId);

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
          const response = await apiCartItem.get(`/ByCartId/${cartId}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          });

          console.log("Các mục trong giỏ hàng:", response.data);
          // Thực hiện thêm các bước xử lý với dữ liệu CartItems (ví dụ: setCartItems(response.data))
        } catch (error) {
          console.error("Lỗi khi lấy các mục trong giỏ hàng:", error);
        }
      };
      LoadOrderTypes();
      fetchUserData();
    } else {
      console.error("Không tìm thấy thông tin người dùng trong cookie.");
    }
  }, []);
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
  const calculatePriceWithOneWeekPercent = (price, orderType) => {
    if (!orderType || orderType.length === 0) {
      console.error("orderType không hợp lệ:", orderType);
      return 0;
    }

    const oneWeekType = orderType.find((type) => type.time === "1 week");
    if (!oneWeekType) {
      console.error("Không tìm thấy orderType cho '1 week'");
      return 0;
    }

    const percentPrice = oneWeekType.percentPrice || 0;
    console.log("Phần trăm giá cho '1 week':", percentPrice);

    return price * percentPrice;
  };

  const HandleToyDetail = (toy) => {
    console.log(toy);

    Cookies.set("toyRentDetailId", toy.id, { expires: 30 });
    //navigate("/toys-rent-details", { replace: true });
    navigate(0);
  };

  const openModal = (toy) => {
    setSelectedToy(toy);
    setIsModalOpen(true);
    setRentalDuration("1 tuần");
    const price = calculateRentalPrice(toy.price, "1 tuần"); // Tính giá thuê với thời gian 1 tuần
    setCalculatedPrice(price); // Lưu giá thuê vào state
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedToy(null);
  };

  const confirmAddToCart = () => {
    if (!Cookies.get("userToken")) {
      console.error("Không tìm thấy cartId");
      alert("Bạn cần đăng nhập để sử dụng chức năng này.");

      return;
    }

    if (selectedToy) {
      // Kiểm tra xem selectedToy có tồn tại không
      updateRentalDuration(selectedToy.id, rentalDuration);

      // Gọi hàm addToCart để thêm sản phẩm vào giỏ hàng
      addToCart2({ ...selectedToy, rentalDuration }); // Thêm rentalDuration vào sản phẩm
      console.log(
        `Đã thêm ${selectedToy.name} vào giỏ với thời gian thuê: ${rentalDuration} và giá thuê: ${calculatedPrice} VNĐ`
      );

      closeModal();
    }
  };

  const updateRentalDuration = (itemId, duration) => {
    setRentItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, rentalDuration: duration } : item
      )
    );
  };

  const addToCart2 = async (toy) => {
    if (!cartId) {
      console.error("Không tìm thấy cartId");
      alert("Bạn cần đăng nhập để sử dụng chức năng này.");

      return;
    }

    if (toy.owner.id !== userId) {
      // Kiểm tra giỏ hàng hiện tại
      var existingItem;
      try {
        const response = await apiCartItem.get(`/ByCartId/${cartId}`);
        const cartItems = response.data || [];

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        existingItem = cartItems.find((item) => item.toyId == toy.id);
      } catch (error) {
        console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
        //alert("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
      }

      if (existingItem) {
        // Nếu sản phẩm đã có trong giỏ hàng, thông báo cho người dùng
        alert("Sản phẩm đã có trong giỏ hàng!");
        console.log("Sản phẩm đã có trong giỏ hàng.");
      } else {
        // Kiểm tra giá trị orderTypeId và tính giá thuê
        const orderTypeId = rentalDuration
          ? calculateOrderTypeId(rentalDuration)
          : 1; // 7 là giá trị mặc định cho "Mua"

        // Tính giá thuê dựa trên rentalDuration (orderTypeId)
        let rentalPrice = 0;
        if (rentalDuration) {
          rentalPrice = calculateRentalPrice(toy.price, rentalDuration); // Tính giá thuê
        }

        const cartItemData = {
          price: toy.price, // Sử dụng giá thuê
          quantity: toy.buyQuantity,
          status: "success",
          cartId: cartId,
          toyId: toy.id,
          toyName: toy.name,
          toyPrice: toy.price, // Lưu giá thuê vào database
          toyImgUrls: toy.imageUrls,
          orderTypeId: orderTypeId, // Sử dụng orderTypeId thay cho startDate và endDate
        };
        try {
          console.log("Quantity before saving: " + cartItemData.quantity);
          const addResponse = await apiCartItem.post("", cartItemData);

          console.log("Sản phẩm đã được thêm vào giỏ hàng:", addResponse.data);
          alert("Sản phẩm đã được thêm vào giỏ hàng!");
        } catch (error) {
          alert("Sản phẩm này đã hết hàng");
        }
      }
    } else {
      alert("Bạn không thể thuê đồ chơi của chính mình");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-500" />); // Sao đầy
      } else if (i - 0.5 === rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />); // Sao nửa
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />); // Sao rỗng
      }
    }
    return stars;
  };

  const addToCart = async () => {
    if (!cartId) {
      console.error("Không tìm thấy cartId");
      alert("Bạn cần đăng nhập để sử dụng chức năng này.");

      return;
    }
    if (currentToy.owner.id !== userId) {
      var existingItem;
      try {
        const response = await apiCartItem.get(`/ByCartId/${cartId}`);
        const cartItems = response.data || [];

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        existingItem = cartItems.find((item) => item.toyId == currentToy.id);
      } catch (error) {
        // console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
        //alert("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
      }
      if (existingItem) {
        // Nếu sản phẩm đã có trong giỏ hàng, thông báo cho người dùng
        alert("Sản phẩm đã có trong giỏ hàng!");
        console.log("Sản phẩm đã có trong giỏ hàng.");
      } else {
        // Kiểm tra giá trị orderTypeId và tính giá thuê
        const orderTypeId = rentalDuration
          ? calculateOrderTypeId(rentalDuration)
          : 1; // 7 là giá trị mặc định cho "Mua"

        // Tính giá thuê dựa trên rentalDuration (orderTypeId)
        let rentalPrice = 0;
        if (rentalDuration) {
          rentalPrice = calculateRentalPrice(currentToy.price, rentalDuration); // Tính giá thuê
        }

        const cartItemData = {
          price: currentToy.price, // Sử dụng giá thuê
          quantity: currentToy.buyQuantity, // Đảm bảo có số lượng mặc định nếu không có
          status: "success",
          cartId: cartId,
          toyId: currentToy.id,
          toyName: currentToy.name,
          toyPrice: currentToy.price, // Lưu giá thuê vào database
          toyImgUrls: currentToy.media.map((m) => m.url), // Chuyển đổi media thành danh sách URL
          orderTypeId: orderTypeId, // Sử dụng orderTypeId thay cho startDate và endDate
        };

        console.log("Quantity before saving: " + cartItemData.quantity);
        const response = await apiCartItem.post("", cartItemData);

        console.log("Sản phẩm đã được thêm vào giỏ hàng:", response.data);
        alert("Sản phẩm đã được thêm vào giỏ hàng!");
      }
    } else {
      alert("Bạn không thể thuê đồ chơi của chính mình");
    }
  };
  const calculateOrderTypeId = (rentalDuration) => {
    switch (rentalDuration) {
      case "1 tuần":
        return 4; // orderTypeId cho 1 tuần
      case "2 tuần":
        return 5; // orderTypeId cho 2 tuần
      case "1 tháng":
        return 6; // orderTypeId cho 1 tháng
      case "Mua":
        return 7; // orderTypeId cho mua
      default:
        return 1; // Nếu không có rentalDuration, mặc định là mua
    }
  };
  // Cập nhật giá khi người dùng chọn thời gian thuê
  const handleDurationChange = (duration) => {
    if (currentToy) {
      setRentalDuration(duration); // Cập nhật thời gian thuê trong state
      const price = calculateRentalPrice(currentToy.price, duration); // Tính giá thuê
      setCalculatedPrice(price); // Cập nhật giá thuê đã tính vào state
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

  const HandleShopPage = () => {
    Cookies.set("PageShopRentId", owner.id, { expires: 7 });
    navigate("/lessor-toys-details");
  };

  const HandleAddChat = async () => {
    await apiConversations.post(
      `/check-or-create-conversation`,
      {
        user1Id: userData.id,
        user2Id: owner.id,
      },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }
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
      <div className="flex flex-1 justify-center py-5 bg-white shadow-md">
        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2 p-4">
              <a
                className="text-[#4e7397] text-base font-medium leading-normal"
                href="/"
              >
                Trang Chủ
              </a>
              <span className="text-[#4e7397] text-base font-medium leading-normal">
                /
              </span>
              <span className="text-[#0e141b] text-base font-medium leading-normal">
                {currentToy.name}
              </span>
            </div>
            <div className="container">
              <div className="flex flex-col lg:flex-row gap-6 px-4 py-10">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {
                    !isVideoUrl(currentMedia) ? (
                      <div
                        className="media-container"
                        style={{
                          width: "550px", // Chiều rộng cố định
                          height: "400px", // Chiều cao cố định
                          backgroundImage: `url(${
                            currentMedia.mediaUrl ? currentMedia.mediaUrl : ""
                          })`,
                          backgroundSize: "contain", // Đảm bảo toàn bộ hình ảnh nằm gọn trong thẻ
                          backgroundRepeat: "no-repeat", // Không lặp lại hình ảnh
                          backgroundPosition: "center", // Căn giữa hình ảnh
                          borderRadius: "12px",
                          display:
                            currentMedia.mediaUrl && !isVideoUrl(currentMedia)
                              ? "block"
                              : "none", // Hiển thị nếu không phải video
                        }}
                      ></div>
                    ) : currentMedia ? (
                      <video
                        controls
                        className="media-container"
                        style={{
                          width: "550px", // Chiều rộng cố định
                          height: "400px", // Chiều cao cố định
                          borderRadius: "12px",
                          objectFit: "cover", // Đảm bảo video lấp đầy khung
                        }}
                      >
                        <source src={currentMedia.mediaUrl} type="video/mp4" />
                        Trình duyệt của bạn không hỗ trợ thẻ video.
                      </video>
                    ) : (
                      <div>Đang tải video...</div> // Placeholder hoặc loader
                    ) // Không render gì nếu là video
                  }

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "20px",
                    }}
                  >
                    {currentPicture &&
                      currentPicture.map(
                        (url, index) =>
                          !isVideoUrl(url) ? ( // Kiểm tra nếu không phải là video
                            <div
                              key={index}
                              style={{
                                marginRight: "10px",
                                cursor: "pointer",
                                border:
                                  currentMedia.mediaUrl === url.mediaUrl
                                    ? "2px solid blue"
                                    : "none",
                              }}
                              onClick={() => handleMediaClick(url)}
                            >
                              <img
                                src={url.mediaUrl}
                                alt="Thumbnail"
                                style={{
                                  width: "80px",
                                  height: "auto",
                                  borderRadius: "8px",
                                }}
                              />
                            </div>
                          ) : url ? (
                            <div
                              key={index}
                              style={{
                                marginRight: "10px",
                                cursor: "pointer",
                                border:
                                  currentMedia.mediaUrl === url.mediaUrl
                                    ? "2px solid blue"
                                    : "none",
                              }}
                              onClick={() => handleMediaClick(url)}
                            >
                              <video
                                controls
                                style={{
                                  width: "80px",
                                  height: "auto",
                                  borderRadius: "8px",
                                }}
                              >
                                <source src={url.mediaUrl} type="video/mp4" />
                                Trình duyệt của bạn không hỗ trợ thẻ video.
                              </video>
                            </div>
                          ) : (
                            <div>Đang tải video...</div> // Placeholder hoặc loader
                          ) // Không render gì nếu là video
                      )}
                  </div>
                </div>

                <div className="flex flex-col lg:w-1/2 gap-6 justify-center">
                  <h1 className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                    {currentToy.name}
                  </h1>
                  {/* Hiển thị số lượng sao và số lượt đánh giá */}
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, index) => (
                        <img
                          key={index}
                          src={
                            index < Math.floor(currentToy.star)
                              ? "https://cdn-icons-png.flaticon.com/512/616/616489.png" // Hình ảnh sao đầy
                              : "https://cdn-icons-png.flaticon.com/512/616/616505.png" // Hình ảnh sao rỗng
                          }
                          alt="Star"
                          className="w-5 h-5"
                        />
                      ))}
                      <span className="text-[#0e141b] ml-2">
                        {currentToy.star}
                      </span>
                    </div>
                    {/* <span className="text-[#0e141b] text-sm">
                      ({reviewCount} đánh giá)
                    </span> */}
                  </div>
                  <h2 className="text-[#0e141b] text-sm font-normal leading-normal">
                    Địa chỉ :{owner.address}
                  </h2>
                  <p className="text-[#0e141b] text-lg font-bold mt-2">
                    Giá cọc: {(currentToy.price || 0).toLocaleString()} VNĐ
                  </p>
                  <p className="text-[#0e141b] text-lg font-bold mt-2">
                    Giá thuê: {(calculatedPrice || 0).toLocaleString()} VNĐ
                  </p>

                  {/* Nút thời gian thuê */}
                  <div className="flex gap-4 mt-4">
                    <button
                      className={`flex-1 h-10 rounded ${
                        rentalDuration === "1 tuần"
                          ? "bg-[#0e141b] text-white"
                          : "bg-[#1980e6] text-white"
                      } font-bold`}
                      onClick={() => handleDurationChange("1 tuần")}
                    >
                      1 Tuần
                    </button>
                    <button
                      className={`flex-1 h-10 rounded ${
                        rentalDuration === "2 tuần"
                          ? "bg-[#0e141b] text-white"
                          : "bg-[#1980e6] text-white"
                      } font-bold`}
                      onClick={() => handleDurationChange("2 tuần")}
                    >
                      2 Tuần
                    </button>
                    <button
                      className={`flex-1 h-10 rounded ${
                        rentalDuration === "1 tháng"
                          ? "bg-[#0e141b] text-white"
                          : "bg-[#1980e6] text-white"
                      } font-bold`}
                      onClick={() => handleDurationChange("1 tháng")}
                    >
                      1 Tháng
                    </button>
                  </div>

                  <button
                    className="bg-[red] text-white px-4 py-2  w-full rounded-md transition duration-200 hover:bg-[#507a95]"
                    onClick={addToCart}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
              <div className="flex items-center mb-2">
                <img
                  src={
                    currentToy.owner && currentToy.owner.avatarUrl
                      ? currentToy.owner.avatarUrl
                      : ""
                  }
                  alt="Store Icon"
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    Người Cho Thuê:{" "}
                    {currentToy.owner && currentToy.owner.fullName
                      ? currentToy.owner.fullName
                      : ""}
                  </h3>

                  <div className="flex space-x-2 mt-2">
                    <button
                      className="border border-blue-500 text-blue-500 font-semibold px-4 py-2 rounded"
                      onClick={() => {
                        HandleAddChat();
                      }}
                    >
                      Chat ngay
                    </button>

                    <button
                      className="border border-green-500 text-green-500 font-semibold px-4 py-2 rounded"
                      onClick={() => {
                        HandleShopPage();
                      }}
                    >
                      Xem shop
                    </button>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <span className="text-sm text-gray-500">
                    Điểm đánh giá trung bình:{" "}
                    {currentToy.owner && currentToy.owner.star
                      ? currentToy.owner.star
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            <h2 class="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              CHI TIẾT SẢN PHẨM
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="mb-2">
                <span className="font-semibold">Danh Mục:</span>{" "}
                {currentToy.category && currentToy.category.name
                  ? currentToy.category.name
                  : ""}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Độ tuổi:</span> {currentToy.age}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Kho:</span> 1
              </div>
              <div className="mb-2">
                <span className="font-semibold">Thương hiệu:</span>{" "}
                {currentToy.brand}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Nguồn gốc:</span>{" "}
                {currentToy.origin}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Gửi từ:</span> {owner.address}
              </div>
            </div>

            <h2 class="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              MÔ TẢ SẢN PHẨM
            </h2>
            <p class="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {currentToy.description}
            </p>

            <h2 class="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              ĐÁNH GIÁ SẢN PHẨM
            </h2>
            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                  {currentToy.star}
                </p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="text-[#1980e6]"
                      data-icon="Star"
                      data-size="18px"
                      data-weight={
                        index < Math.floor(currentToy.star) ? "fill" : "regular"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18px"
                        height="18px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path
                          d={
                            index < Math.floor(currentToy.star)
                              ? "M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                              : "M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z"
                          }
                        />
                      </svg>
                    </div>
                  ))}
                </div>
                {/* <p className="text-[#0e141b] text-base font-normal leading-normal">
                  {reviewCount} Đánh giá
                </p> */}
              </div>
              {/* <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                {ratings.map((rating) => (
                  <React.Fragment key={rating.score}>
                    <p className="text-[#0e141b] text-sm font-normal leading-normal">
                      {rating.score}
                    </p>
                    <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]">
                      <div
                        className="rounded-full bg-[#1980e6]"
                        style={{ width: `${rating.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">
                      {rating.percentage}%
                    </p>
                  </React.Fragment>
                ))}
              </div> */}

              <div className="w-full flex flex-wrap gap-x-8 gap-y-6 p-0">
                {currentReviews != "" &&
                  currentReviews.map((rating, index) => (
                    <div
                      key={index}
                      className="w-full flex flex-col gap-3 bg-slate-50 border border-gray-300 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                          style={{
                            backgroundImage:
                              'url(" ' + rating.avartarUrl + '")',
                          }}
                        ></div>
                        <div className="flex-1">
                          <p className="text-[#0e141b] text-base font-medium leading-normal">
                            {rating.userName}
                          </p>
                          <p className="text-[#4e7397] text-sm font-normal leading-normal">
                            {
                              new Date(rating.ratingDate)
                                .toISOString()
                                .split("T")[0]
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array(rating.star)
                          .fill(0)
                          .map((_, starIndex) => (
                            <div key={starIndex} className="text-[#1980e6]">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20px"
                                height="20px"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                              >
                                <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                              </svg>
                            </div>
                          ))}
                      </div>
                      <p className="text-[#0e141b] text-base font-normal leading-normal">
                        {rating.comment}
                      </p>
                    </div>
                  ))}
                {currentReviews == "" && (
                  <div>
                    <p>Chưa có đánh giá cho đồ chơi này</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#1980e6] text-white rounded"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#1980e6] text-white rounded"
                >
                  Next
                </button>
              </div>
              <div>
                <div className="flex items-center justify-between px-4 pt-5">
                  <h2 className="text-[#0e161b] text-[22px] font-bold">
                    Các sản phẩm khác của Shop
                  </h2>
                  <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold">
                    <span className="truncate">Xem tất cả</span>
                  </button>
                </div>

                <div className="grid grid-cols-6 gap-3 p-4">
                  {" "}
                  {toysOfShop.length > 0 ? (
                    toysOfShop.map((deal, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg cursor-pointer"
                      >
                        <div
                          onClick={() => {
                            HandleToyDetail(deal);
                          }}
                        >
                          <div
                            className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                            style={{
                              backgroundImage: `url(${
                                deal.media[0] && deal.media[0].mediaUrl
                                  ? deal.media[0].mediaUrl
                                  : ""
                              })`,
                            }}
                          ></div>

                          <p
                            className="text-[#0e161b] text-base font-medium overflow-hidden text-ellipsis"
                            style={{
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2,
                              lineClamp: 2,
                              maxHeight: "3rem", // Ensures space for two lines
                              lineHeight: "1.5rem", // Each line takes up 1.5rem height
                            }}
                          >
                            {deal.name}
                          </p>

                          <p className="text-[#507a95] text-sm">
                            Nhóm tuổi: {deal.age}
                          </p>
                          <div className="flex items-center gap-1">
                            {renderStars(deal.star)}
                          </div>
                          {deal.buyQuantity >= 0 ? (
                            <p className="text-[#0e161b] text-lg font-bold">
                              {(deal.price || 0).toLocaleString()} VNĐ
                            </p>
                          ) : (
                            <p className="text-[#0e161b] text-lg font-bold">
                              {(deal.price * 0.15 || 0).toLocaleString()} VNĐ
                            </p>
                          )}
                        </div>
                        {deal.buyQuantity >= 0 ? (
                          <button></button>
                        ) : (
                          <button
                            onClick={() => openModal(deal)}
                            className="w-full bg-[#0e161b] text-white text-sm px-4 py-2 rounded-md hover:bg-[#507a95] transition-all"
                          >
                            Thuê
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[#0e161b] text-lg">No toys found</p>
                  )}
                </div>
                {isModalOpen && (
                  <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onClick={closeModal}
                  >
                    <div
                      className="cart-modal bg-white p-4 shadow-md rounded-lg w-[700px] h-[500px] flex relative z-50" // Thêm "relative" để định vị nút "x"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="absolute top-0 right-2 text-gray-600 hover:text-gray-800 text-2xl" // Thêm "absolute" và điều chỉnh vị trí
                        onClick={closeModal}
                      >
                        &times; {/* Dấu "X" để đóng modal */}
                      </button>
                      {selectedToy && (
                        <img
                          src={selectedToy.media[0].mediaUrl}
                          alt={selectedToy.name}
                          className="w-1/2 h-full object-cover rounded-l-lg"
                        />
                      )}
                      <div className="pl-4 pt-0 flex-grow">
                        <h2 className="text-2xl font-bold mb-2">
                          {selectedToy.name}
                        </h2>
                        <p className="text-sm text-gray-600 mb-2">
                          Nhóm tuổi: {selectedToy.ageGroup}
                        </p>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(selectedToy.star)}
                        </div>
                        <p className="text-lg font-bold text-[#0e161b] mb-2">
                          Giá: {(selectedToy.price || 0).toLocaleString()} VNĐ
                        </p>
                        <p className="text-lg font-bold text-[#0e161b] mb-2">
                          Giá thuê: {(calculatedPrice || 0).toLocaleString()}{" "}
                          VNĐ
                        </p>

                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">
                            Thời gian thuê:
                          </p>
                          <div className="flex gap-4">
                            <button
                              className={`border px-4 py-2 ${
                                rentalDuration === "1 tuần"
                                  ? "bg-blue-500 text-white"
                                  : ""
                              }`}
                              onClick={() => handleDurationChange("1 tuần")}
                            >
                              1 tuần
                            </button>
                            <button
                              className={`border px-4 py-2 ${
                                rentalDuration === "2 tuần"
                                  ? "bg-blue-500 text-white"
                                  : ""
                              }`}
                              onClick={() => handleDurationChange("2 tuần")}
                            >
                              2 tuần
                            </button>
                            <button
                              className={`border px-4 py-2 ${
                                rentalDuration === "1 tháng"
                                  ? "bg-blue-500 text-white"
                                  : ""
                              }`}
                              onClick={() => handleDurationChange("1 tháng")}
                            >
                              1 tháng
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4 w-full">
                          <button
                            className="bg-[red] text-white px-4 py-2  w-full rounded-md transition duration-200 hover:bg-[#507a95]"
                            onClick={confirmAddToCart}
                          >
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

export default ToysDetails;
