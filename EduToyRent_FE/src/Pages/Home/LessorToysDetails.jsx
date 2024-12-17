import React, { useState, useEffect } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import apiToys from "../../service/ApiToys";
import apiMedia from "../../service/ApiMedia";
import apiRatings from "../../service/ApiRatings";
import apiCategory from "../../service/ApiCategory";
import apiCartItem from "../../service/ApiCartItem";
import apiUser from "../../service/ApiUser";

import apiCart from "../../service/ApiCart";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiConversations from "../../service/ApiConversations";
import ChatForm from "../Chat/ChatForm";

const LessorToysDetails = () => {
  const [ageGroup, setAgeGroup] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái cho tìm kiếm
  const [toyType, setToyType] = useState(""); // Trạng thái để lọc giữa đồ chơi bán và cho thuê
  const [filteredToys, setFilteredToys] = useState([]); // Trạng thái cho đồ chơi đã lọc
  const [userId, setUserId] = useState(null);
  // Thêm trạng thái cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18; // Số lượng đồ chơi mỗi trang
  const [owner, setOwner] = useState({});
  const [toysOfShop, setToysOfShop] = useState([]);
  const [toysRecomment, setToysRecomment] = useState([]);
  const navigate = useNavigate();
  const [cartId, setCartId] = useState(null);
  const [selectCategory, setSelectCategory] = useState("All");
  const [category, setCategory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToy, setSelectedToy] = useState(null);
  const [rentalDuration, setRentalDuration] = useState();
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    apiCategory.get("?pageIndex=1&pageSize=100").then((response) => {
      setCategory(response.data);
    });

    apiUser.get("/" + Cookies.get("PageShopRentId")).then((response) => {
      setOwner(response.data);
      console.log(response.data);
    });

    const userDataCookie1 = Cookies.get("userData");
    if (userDataCookie1) {
      const parsedUserData = JSON.parse(userDataCookie1);

      if (parsedUserData.roleId == 4) {
        navigate("/staff");
      } else if (parsedUserData.roleId == 1) {
        navigate("/admin");
      } else if (parsedUserData.roleId == 2) {
        navigate("/toySupplier");
      }
    }

    const userDataCookie = Cookies.get("userDataReal");
    if (userDataCookie) {
      var parsedUserData;
      try {
        parsedUserData = JSON.parse(userDataCookie);

        fetchUserCart(parsedUserData.id);
        setUserId(parsedUserData.id);
      } catch (error) {
        console.error("Error parsing userDataCookie:", error);
      }
    } else {
      console.warn("Cookie 'userDataReal' is missing or undefined.");
    }

    apiToys
      .get(
        "/user/" +
          Cookies.get("PageShopSaleId") +
          "?status=Active&pageIndex=1&pageSize=1000"
      )
      .then((response) => {
        setToysOfShop(response.data);
        console.log(response.data);
        console.log(Cookies.get("toySaleDetailId"));
      });

    apiToys
      .get(
        "/user/" +
          Cookies.get("PageShopSaleId") +
          "?status=Active&pageIndex=1&pageSize=6"
      )
      .then((response) => {
        setToysRecomment(response.data);
        console.log(response.data);
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

      // Log userId để đảm bảo giá trị userId được truyền vào đúng
      console.log("UserId cần lọc:", userId);

      // Lọc giỏ hàng theo userId
      const userCart = response.data.filter((cart) => cart.userId === userId);

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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedToy(null);
  };

  const openModal = (toy) => {
    setSelectedToy(toy);
    setIsModalOpen(true);
    setRentalDuration("1 tuần");
    const price = calculateRentalPrice(toy.price, "1 tuần"); // Tính giá thuê với thời gian 1 tuần
    setCalculatedPrice(price); // Lưu giá thuê vào state
  };
  const confirmAddToCart = () => {
    if (!Cookies.get("userToken")) {
      console.error("Không tìm thấy cartId");
      alert("Bạn cần đăng nhập để sử dụng chức năng này.");

      return;
    }

    if (selectedToy) {
      addToCart({ ...selectedToy, rentalDuration })
        .then(() => {
          console.log(
            `Đã thêm ${selectedToy.name} vào giỏ với thời gian thuê: ${rentalDuration} và giá thuê: ${calculatedPrice} VNĐ`
          );

          // Đóng modal sau khi thêm vào giỏ hàng
          closeModal();
        })
        .catch((error) => {
          console.error("Không thể thêm sản phẩm vào giỏ hàng:", error);
        });
    }
  };

  const addToCart = async (toy) => {
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

  const NextPage = (number) => {
    setFilteredToys(
      toysOfShop.slice(
        parseInt(number) * itemsPerPage - itemsPerPage,
        parseInt(number) * itemsPerPage
      )
    );

    setCurrentPage(parseInt(number));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredToys.slice(indexOfFirstItem, indexOfLastItem);

  // Tạo danh sách số trang
  const [pageNumbers, setPageNumbers] = useState([]);

  const loadPageNumber = (data) => {
    const pages = [];
    for (let i = 1; i <= Math.ceil(data.length / itemsPerPage); i++) {
      pages.push(i);
    }
    setPageNumbers(pages);
  };

  const HandleToyDetail = (toy) => {
    console.log(toy);
    if (toy.buyQuantity >= 0) {
      Cookies.set("toySaleDetailId", toy.id, { expires: 30 });
      navigate("/toys-sale-details");
    } else if (toy.buyQuantity < 0) {
      Cookies.set("toyRentDetailId", toy.id, { expires: 30 });
      navigate("/toys-rent-details");
    }
  };

  const handleDurationChange = (duration) => {
    if (selectedToy) {
      // Kiểm tra xem selectedToy có tồn tại không
      setRentalDuration(duration);
      const price = calculateRentalPrice(selectedToy.price, duration);
      setCalculatedPrice(price);
    }
  };

  const calculateRentalPrice = (price, duration) => {
    let rentalPrice = 0;
    switch (duration) {
      case "1 tuần":
        rentalPrice = price * 0.15;
        break;
      case "2 tuần":
        rentalPrice = price * 0.25;
        break;
      case "1 tháng":
        rentalPrice = price * 0.3;
        break;
      case "Mua":
        rentalPrice = price; // 100% giá
        break;
      default:
        rentalPrice = 0; // Giá trị mặc định nếu duration không hợp lệ
    }
    return rentalPrice;
  };

  const HandleAddChat = async () => {
    await apiConversations.post(
      `/check-or-create-conversation`,
      {
        user1Id: userId,
        user2Id: owner.id,
      },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }
    );
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

  const handleSearch = () => {
    // Dữ liệu bộ lọc từ người dùng
    const filters = [];
    Cookies.remove("ToyDetailFilter");
    Cookies.remove("ToyDetailCategory");
    if (maxPrice) {
      switch (maxPrice) {
        case "0":
          filters.push(`price ge 0 and price le 500000`);
          break;
        case "1":
          filters.push(`price ge 500000 and price le 1000000`);
          break;
        case "2":
          filters.push(`price gt 1000000 and price le 2000000`);
          break;
        case "3":
          filters.push(`price gt 2000000 and price le 3000000`);
          break;
        case "4":
          filters.push(`price gt 3000000 and price le 4000000`);
          break;
        case "5":
          filters.push(`price gt 4000000 and price le 5000000`);
          break;
        case "6":
          filters.push(`price gt 5000000`);
          break;
        default:
          break; // Không áp dụng bộ lọc giá nếu không có giá trị hợp lệ
      }
    }

    if (toyType == "1") {
      filters.push(`buyQuantity gt 0`);
    } else if (toyType == "-1") {
      filters.push(`buyQuantity le -1`);
    }
    if (selectCategory != "All")
      filters.push(`category/name eq '${selectCategory}'`);
    if (ageGroup) filters.push(`age eq '${ageGroup}'`);
    if (brand != "") filters.push(`contains(brand, '${brand}')`);
    if (searchTerm) filters.push(`contains(name, '${searchTerm}')`);

    // Kết hợp các bộ lọc
    const query =
      filters.length > 0
        ? `?$filter=Status eq 'Active' and ${filters.join(" and ")}`
        : "";

    if (query != "") {
      apiToys
        .get("/user/" + Cookies.get("PageShopSaleId") + query)
        .then((response) => {
          console.log(response.data);
          setToysOfShop(response.data);
          setFilteredToys(
            response.data.slice(
              1 * itemsPerPage - itemsPerPage,
              1 * itemsPerPage
            )
          );
          loadPageNumber(response.data);
        });

      setCurrentPage(1);
    } else {
      apiToys
        .get(
          "/user/" +
            Cookies.get("PageShopSaleId") +
            "?status=Active&pageIndex=1&pageSize=1000"
        )
        .then((response) => {
          console.log(response.data);
          setToysOfShop(response.data);
          setFilteredToys(
            response.data.slice(
              currentPage * itemsPerPage - itemsPerPage,
              currentPage * itemsPerPage
            )
          );
          loadPageNumber(response.data);
        });
    }
  };

  const addToPurchase = async (toy) => {
    if (!cartId) {
      console.error("Không tìm thấy cartId");
      alert("Bạn cần đăng nhập để sử dụng chức năng này.");

      return;
    }
    var existingItem;

    // Gọi API để kiểm tra giỏ hàng
    try {
      const response = await apiCartItem.get(`/ByCartId/${cartId}`);

      const cartItems = response.data || [];
      existingItem = cartItems.find((item) => item.toyId == toy.id);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào danh sách mua:", error);
      //alert("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
    }

    if (existingItem) {
      // Nếu sản phẩm đã tồn tại, tăng quantity lên 1
      try {
        const updatedQuantity = existingItem.quantity + 1;

        await apiCartItem.put(`/${existingItem.id}`, {
          ...existingItem,
          quantity: updatedQuantity,
        });

        console.log(`Đã cập nhật số lượng sản phẩm: ${updatedQuantity}`);
        alert("Số lượng sản phẩm đã được cập nhật!");
      } catch (error) {
        alert("Sản phẩm đã có trong giỏ hàng");
      }
    } else {
      // Nếu sản phẩm chưa tồn tại, thêm mới
      const purchaseData = {
        price: toy.price,
        quantity: 1, // Bắt đầu với số lượng 1
        cartId: cartId,
        toyId: toy.id,
        toyName: toy.name,
        toyPrice: toy.toyPrice,
        toyImgUrls: toy.imageUrls,
        status: "success",
        orderTypeId: 7, // Sử dụng orderTypeId thay cho startDate và endDate
      };

      try {
        await apiCartItem.post("", purchaseData);

        console.log("Sản phẩm đã được thêm vào danh sách mua mới.");
        alert("Sản phẩm đã được thêm vào giỏ hàng!");
      } catch (error) {
        alert("Sản phẩm này đã hết hàng");
      }
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
            <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
              <div className="flex items-center mb-2">
                <img
                  src={owner && owner.avatarUrl ? owner.avatarUrl : ""}
                  alt="Store Icon"
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    Cửa Hàng Đồ Chơi : {owner.fullName}
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
                    <div>địa chỉ: {owner.address}</div>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <span className="text-sm text-gray-500">
                    Điểm đánh giá trung bình: {owner.star}
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
                {toysRecomment.map((deal, index) => (
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
                            deal.media && deal.media[0].mediaUrl
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
                      <button
                        onClick={() => addToPurchase(deal)}
                        className="w-full bg-[#0e161b] text-white text-sm px-4 py-2 rounded-md hover:bg-[#507a95] transition-all"
                      >
                        Mua
                      </button>
                    ) : (
                      <button></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* <div
            className="relative flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 pb-10"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("${images[currentImageIndex]}")`,
            }}
          >
          
            <button
              onClick={previousImage}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-transparent text-white text-2xl"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            >
              ‹
            </button>

          
            <button
              onClick={nextImage}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-transparent text-white text-2xl"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            >
              ›
            </button>
          </div> */}

            <div
              className="relative flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 pb-10"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("${owner.avatarUrl}")`,
              }}
            ></div>

            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              <div>
                <div className="flex items-center justify-between px-4 pt-5">
                  <h2 className="text-[#0e161b] text-[22px] font-bold">
                    Các sản phẩm của TCS
                  </h2>
                </div>
                <div className="layout-content-container flex max-w-[1200px] w-full px-4 sm:px-6 lg:px-8">
                  {/* Thanh Filter bên trái */}

                  <div className="w-4/4 pl-6">
                    {/* <div className="mb-4">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="border rounded p-2 w-full"
                      placeholder="Tìm kiếm bằng tên đồ chơi"
                    />
                  </div> */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                                  {(deal.price * 0.15 || 0).toLocaleString()}{" "}
                                  VNĐ
                                </p>
                              )}
                            </div>
                            {deal.buyQuantity < 0 ? (
                              <button
                                onClick={() => openModal(deal)}
                                className="w-full bg-[#0e161b] text-white text-sm px-4 py-2 rounded-md hover:bg-[#507a95] transition-all"
                              >
                                Thuê
                              </button>
                            ) : (
                              <button></button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-[#0e161b] text-lg">
                          Không tìm thấy đồ chơi
                        </p>
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
                              Giá: {(selectedToy.price || 0).toLocaleString()}{" "}
                              VNĐ
                            </p>
                            <p className="text-lg font-bold text-[#0e161b] mb-2">
                              Giá thuê:{" "}
                              {(calculatedPrice || 0).toLocaleString()} VNĐ
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
                                  onClick={() =>
                                    handleDurationChange("1 tháng")
                                  }
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

                    {/* Phân trang */}
                    <div className="flex justify-center mt-4">
                      {pageNumbers.map((number) => (
                        <button
                          key={number}
                          onClick={() => NextPage(number)}
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
      <ChatForm />
      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default LessorToysDetails;
