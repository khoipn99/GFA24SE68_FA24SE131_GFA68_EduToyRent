import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import thư viện Cookies
import { Outlet } from "react-router-dom";

import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { Link } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // Import các biểu tượng sao
import { useNavigate } from "react-router-dom";
import apiToys from "../../service/ApiToys";

import apiCategory from "../../service/ApiCategory";
import apiCartItem from "../../service/ApiCartItem";

import apiCart from "../../service/ApiCart";
const PictureCategory = [
  {
    image:
      "https://dathangsi.vn/upload/products/2024/09/0832-do-choi-xep-hinh-cho-be,-lap-ghep-nha-khoi-3d-210-chi-tiet.jpg",
  },
  {
    image:
      "https://product.hstatic.net/1000319165/product/dk81163_01_b9ab24c40753428b97cff3a2f894211d_1024x1024.jpg",
  },
  {
    image:
      "https://bizweb.dktcdn.net/100/004/338/files/my-thuat-thu-cong-1.jpg?v=1466155461550",
  },
  {
    image:
      "https://sudo.vn1.vdrive.vn/babycuatoi/2023/08/clb-4-do-choi-xep-hinh-nam-cham-64-chi-tiet-cho-be.jpg",
  },
  {
    image:
      "https://down-vn.img.susercontent.com/file/e0653c8ef2185cdf98abb34da05f7827",
  },
  {
    image:
      "https://bizweb.dktcdn.net/thumb/1024x1024/100/226/134/products/5-3f4c04bb-20fa-4d98-b8e2-7647b4cda531.jpg?v=1658474391327",
  },
  {
    image:
      "https://bizweb.dktcdn.net/100/462/711/products/pothehk-60ad384c-5e3c-4948-a00e-0ef294800393.png?v=1669113673947",
  },
  {
    image:
      "https://mebi.vn/wp-content/uploads/2023/04/bang-viet-xoa-tu-dong-thong-minh-3.jpg",
  },
];

const images = [
  "https://cafefcdn.com/2018/12/17/banner-hinh-do-choi-1545016993587208100840.jpg",
  "https://dochoigohanoi.com/public/media/media/files/slide/slider-2.jpg",
  "https://salt.tikicdn.com/ts/tmp/ea/08/af/baea61f75fdcb77f0d88bbec3ecc0ca8.jpg",
  // Thay thế bằng URL hình ảnh thứ ba
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedToy, setSelectedToy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rentalDuration, setRentalDuration] = useState("1 tuần"); // Giá trị mặc định là "1 tuần"
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [rentItems, setRentItems] = useState([]); // Khởi tạo giỏ hàng
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [toysForRent, setToysForRent] = useState([]);
  const [toysForSale, setToysForSale] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [userId, setUserId] = useState(null);
  const [featuredToys, setFeaturedToys] = useState([]);
  const [dealsOfTheDay, setdealsOfTheDay] = useState([]);
  const [cartId, setCartId] = useState(null);

  useEffect(() => {
    apiToys
      .get("/AvailableForPurchase?pageIndex=1&pageSize=18")
      .then((response) => {
        console.log(response.data);
        setToysForSale(response.data);
      });

    apiToys
      .get("/AvailableForRent?pageIndex=1&pageSize=18")
      .then((response) => {
        console.log(response.data);
        setToysForRent(response.data);
      });

    apiToys.get("/active?pageIndex=1&pageSize=18").then((response) => {
      console.log(response.data);
      setdealsOfTheDay(response.data);
    });

    apiCategory.get("?pageIndex=1&pageSize=100").then((response) => {
      console.log(response.data);
      setFeaturedToys(response.data);
    });
  }, []);

  useEffect(() => {
    const userDataCookie = Cookies.get("userDataReal");
    if (userDataCookie) {
      var parsedUserData;
      try {
        parsedUserData = JSON.parse(userDataCookie);
        setUserData(parsedUserData); // Adjust based on expected structure
        console.log(parsedUserData);
        fetchUserCart(parsedUserData.id);
        setUserId(parsedUserData.id);
      } catch (error) {
        console.error("Error parsing userDataCookie:", error);
      }
    } else {
      console.warn("Cookie 'userDataReal' is missing or undefined.");
    }
  }, []);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Thay đổi hình ảnh mỗi 3 giâya

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
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
  // Hàm thêm sản phẩm vào giỏ hàng
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

  // Mở modal, đặt thời gian thuê mặc định và tính giá
  const openModal = (toy) => {
    setSelectedToy(toy);
    setIsModalOpen(true);
    handleDurationChange("1 tuần"); // Đặt thời gian thuê mặc định là 1 tuần
    const price = calculateRentalPrice(toy.price, "1 tuần"); // Tính giá thuê với thời gian 1 tuần
    setCalculatedPrice(price); // Lưu giá thuê vào state
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedToy(null); // Reset món đồ đã chọn
    setRentalDuration("1 tuần"); // Đặt lại thời gian thuê về mặc định
    setCalculatedPrice(0); // Reset giá thuê
  };

  // Cập nhật giá khi người dùng chọn thời gian thuê
  const handleDurationChange = (duration) => {
    if (selectedToy) {
      setRentalDuration(duration); // Cập nhật thời gian thuê trong state
      const price = calculateRentalPrice(selectedToy.price, duration); // Tính giá thuê
      setCalculatedPrice(price); // Cập nhật giá thuê đã tính vào state
    }
  };
  // Hàm xác nhận thêm vào giỏ hàng
  const confirmAddToCart = () => {
    if (!cartId) {
      console.error("Không tìm thấy cartId");
      alert("Bạn cần đăng nhập để sử dụng chức năng này.");
      closeModal();
      navigate("/");
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
  // Hàm tính giá thuê
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

  // Hàm tính toán orderTypeId từ rentalDuration
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

  // H
  const updateRentalDuration = (itemId, duration) => {
    setRentItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, rentalDuration: duration } : item
      )
    );
  };

  const FilterCategory = (category) => {
    navigate("/filter-toys");
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

  const HandleToyDetailFilterRent = () => {
    Cookies.set("ToyDetailFilter", "Rent", { expires: 3 });
    navigate("/filter-toys");
  };

  const HandleToyDetailFilterSale = () => {
    Cookies.set("ToyDetailFilter", "Sale", { expires: 3 });
    navigate("/filter-toys");
  };

  const HandleToyDetailFilterCategory = (e) => {
    console.log(e);

    Cookies.set("ToyDetailFilter", "Category", { expires: 3 });
    Cookies.set("ToyDetailCategory", e, { expires: 3 });
    navigate("/filter-toys");
  };

  const HandleToyDetailFilter = () => {
    Cookies.set("ToyDetailFilter", "All", { expires: 3 });

    navigate("/filter-toys");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 p-9">
      <header>
        <HeaderForCustomer />
      </header>
      <div className="flex flex-1 justify-center py-5 bg-white shadow-md">
        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 px-4 sm:px-6 lg:px-8">
          {" "}
          {/* Tăng chiều rộng */}
          <div className="flex flex-col gap-6">
            <div
              className="relative flex flex-col gap-6 overflow-hidden"
              style={{ height: "480px", width: "100%" }}
            >
              {/* Container chứa tất cả các ảnh */}
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(${-currentImageIndex * 100}%)`,
                  width: `${images.length * 40}%`,
                }}
              >
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="min-w-full flex-shrink-0 h-[480px]"
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundSize: "contain", // Show the full image
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  ></div>
                ))}
              </div>

              {/* Nút Previous Image */}
              <button
                onClick={previousImage}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-transparent text-white text-2xl"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              >
                ‹
              </button>

              {/* Nút Next Image */}
              <button
                onClick={nextImage}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-transparent text-white text-2xl"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              >
                ›
              </button>
            </div>

            <div className="flex justify-between items-center p-4">
              <p className="text-[#0e161b] text-4xl font-black">
                Khám Phá Danh Mục
              </p>
            </div>

            <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-stretch p-4 gap-3">
                {featuredToys.map((category, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg cursor-pointer"
                    onClick={() => HandleToyDetailFilterCategory(category.name)}
                  >
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl hover:opacity-90 transition duration-300"
                      style={{
                        backgroundImage: `url(${PictureCategory[index].image})`,
                      }}
                    ></div>

                    <div>
                      <p className="text-[#0e161b] text-base font-medium">
                        {category.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-[#0e161b] text-[22px] font-bold px-4 pt-5">
              Các Nhãn Hàng Đối Tác
            </h2>
            <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-stretch p-4 gap-3">
                {featuredToys.map((category, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg cursor-pointer"
                    onClick={() => FilterCategory(category.id)}
                  >
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl hover:opacity-90 transition duration-300"
                      style={{
                        backgroundImage: `url(${PictureCategory[index].image})`,
                      }}
                    ></div>

                    <div>
                      <p className="text-[#0e161b] text-base font-medium">
                        {category.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <h2 className="text-[#0e161b] text-[22px] font-bold px-4 pt-5">
              Sản phẩm mới nhất
            </h2>
            <div className="grid grid-cols-6 gap-3 p-4">
              {dealsOfTheDay.map((deal, index) => (
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
                    <button
                      onClick={() => openModal(deal)}
                      className="w-full bg-[#0e161b] text-white text-sm px-4 py-2 rounded-md hover:bg-[#507a95] transition-all"
                    >
                      Thuê
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold"
              onClick={() => {
                HandleToyDetailFilter();
              }}
            >
              <span className="truncate">Xem tất cả </span>
            </button>

            <h2 className="text-[#0e161b] text-[22px] font-bold px-4 pt-5">
              Sản phẩm cho thuê mới nhất
            </h2>
            <div className="grid grid-cols-6 gap-3 p-4">
              {toysForRent.map((toy) => (
                <div
                  key={toy.id}
                  className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg cursor-pointer"
                >
                  <div
                    onClick={() => {
                      HandleToyDetail(toy);
                    }}
                  >
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                      style={{
                        backgroundImage: `url(${
                          toy.media && toy.media[0].mediaUrl
                            ? toy.media[0].mediaUrl
                            : ""
                        })`,
                      }}
                    ></div>

                    <div>
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
                        {toy.name}
                      </p>
                      <p className="text-[#507a95] text-sm">
                        Nhóm tuổi: {toy.age}
                      </p>
                      <div className="flex items-center gap-1">
                        {renderStars(toy.star)}
                      </div>
                      <p className="text-[#0e161b] text-lg font-bold">
                        {(toy.price * 0.15 || 0).toLocaleString()} VNĐ
                      </p>
                    </div>
                  </div>
                  <button
                    className="w-full bg-[#0e161b] text-white text-sm px-4 py-2 rounded-md hover:bg-[#507a95] transition-all"
                    onClick={() => openModal(toy)}
                  >
                    Thuê
                  </button>
                </div>
              ))}
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
                      Giá Cọc: {(selectedToy.price || 0).toLocaleString()} VNĐ
                    </p>
                    <p className="text-lg font-bold text-[#0e161b] mb-2">
                      Giá thuê: {(calculatedPrice || 0).toLocaleString()} VNĐ
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

            <button
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold"
              onClick={() => {
                HandleToyDetailFilterRent();
              }}
            >
              <span className="truncate">Xem tất cả</span>
            </button>

            <h2 className="text-[#0e161b] text-[22px] font-bold px-4 pt-5">
              Sản phẩm bán mới nhất
            </h2>
            <div className="grid grid-cols-6 gap-3 p-4">
              {" "}
              {/* Thay đổi thành 6 cột */}
              {toysForSale.map((toy) => (
                <div
                  key={toy.id}
                  className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg cursor-pointer"
                >
                  <div
                    onClick={() => {
                      HandleToyDetail(toy);
                    }}
                  >
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                      style={{
                        backgroundImage: `url(${
                          toy.media && toy.media[0].mediaUrl
                            ? toy.media[0].mediaUrl
                            : ""
                        })`,
                      }}
                    ></div>

                    <div>
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
                        {toy.name}
                      </p>
                      <p className="text-[#507a95] text-sm">
                        Nhóm tuổi: {toy.age}
                      </p>
                      <div className="flex items-center gap-1">
                        {renderStars(toy.star)}
                      </div>
                      <p className="text-[#0e161b] text-lg font-bold">
                        {(toy.price || 0).toLocaleString()} VNĐ
                      </p>
                    </div>
                  </div>
                  {/* Nút thêm vào giỏ hàng */}
                  <button
                    className="w-full bg-[#0e161b] text-white text-sm px-4 py-2 rounded-md hover:bg-[#507a95] transition-all"
                    onClick={() => addToPurchase(toy)} // Gọi hàm addToCart khi bấm nút
                  >
                    Mua
                  </button>
                </div>
              ))}
            </div>
            <button
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold"
              onClick={() => {
                HandleToyDetailFilterSale();
              }}
            >
              <span className="truncate">Xem tất cả </span>
            </button>
          </div>
        </div>
      </div>

      {/* Nút Chat */}
      <Link
        to="/chat" // Đường dẫn tới trang chat
        className="fixed bottom-10 right-10 p-4 bg-[#00aaff] text-white rounded-full shadow-2xl hover:bg-[#0099cc] transition duration-300 flex items-center justify-center"
        style={{
          zIndex: 1000, // Đảm bảo nút Chat nằm trên tất cả các phần tử khác
          width: "80px", // Kích thước nút
          height: "80px", // Kích thước nút
        }}
      >
        <span className="icon-class text-3xl">💬</span> {/* Biểu tượng chat */}
      </Link>
      <footer>
        <FooterForCustomer />
      </footer>
      <Outlet />
    </div>
  );
};

export default Home;
