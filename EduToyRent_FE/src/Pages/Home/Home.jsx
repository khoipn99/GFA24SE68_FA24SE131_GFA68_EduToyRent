import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import thư viện Cookies
import { Outlet } from "react-router-dom";
import Sidebar from "../../Component/Sidebar/Sidebar";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { Link } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // Import các biểu tượng sao
import { useNavigate } from "react-router-dom";
import apiToys from "../../service/ApiToys";
import axios from "axios";
import apiCategory from "../../service/ApiCategory";

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
  const [userData, setUserData] = useState("");
  const [toysForRent, setToysForRent] = useState([]);
  const [toysForSale, setToysForSale] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [userId, setUserId] = useState(null);
  const [featuredToys, setFeaturedToys] = useState([]);
  const [dealsOfTheDay, setdealsOfTheDay] = useState([]);

  useEffect(() => {
    apiToys
      .get("/AvailableForPurchase?pageIndex=1&pageSize=18")
      .then((response) => {
        console.log(response.data);
        setToysForSale(response.data);
      });

    apiToys
      .get("/AvailableForRent?pageIndex=1&pageSize=100")
      .then((response) => {
        console.log(response.data);
        setToysForRent(response.data);
      });

    apiToys.get("/active?pageIndex=1&pageSize=18").then((response) => {
      console.log(response.data);
      setdealsOfTheDay(response.data);
    });

    apiCategory.get("?pageIndex=1&pageSize=8").then((response) => {
      console.log(response.data);
      setFeaturedToys(response.data);
    });
  }, []);

  useEffect(() => {
    const userDataCookie = Cookies.get("userData");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);
      setUserData(parsedUserData);
      const email = parsedUserData.email;

      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Token không hợp lệ hoặc hết hạn.");
            return;
          }

          // Gọi API lấy thông tin người dùng dựa trên email
          const response = await axios.get(
            `https://localhost:44350/api/v1/Users/ByEmail?email=${encodeURIComponent(
              email
            )}&pageIndex=1&pageSize=5`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
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

      // Hàm lấy giỏ hàng của người dùng theo userId
      const fetchUserCart = async (userId) => {
        try {
          const response = await axios.get(
            `https://localhost:44350/api/v1/Carts?userId=${userId}&pageIndex=1&pageSize=5`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          console.log("Giỏ hàng của người dùng:", response.data);

          if (response.data && response.data.length > 0) {
            const cart = response.data[0]; // Lấy giỏ hàng đầu tiên trong danh sách giỏ hàng
            const cartId = cart.id;

            // Sau khi có cartId, gọi API CartItems
            fetchCartItems(cartId);
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
          const response = await axios.get(
            `https://localhost:44350/api/v1/CartItems/ByCartId/${cartId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          console.log("Các mục trong giỏ hàng:", response.data);
          // Thực hiện thêm các bước xử lý với dữ liệu CartItems (ví dụ: setCartItems(response.data))
        } catch (error) {
          console.error("Lỗi khi lấy các mục trong giỏ hàng:", error);
        }
      };

      fetchUserData();
    } else {
      console.error("Không tìm thấy thông tin người dùng trong cookie.");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Thay đổi hình ảnh mỗi 3 giâya

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, []);

  useEffect(() => {
    const cart = JSON.parse(Cookies.get("cart") || "[]");
    setRentItems(cart); // Khôi phục trạng thái giỏ hàng từ cookie
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
  const addToCart = (toy) => {
    const cart = JSON.parse(Cookies.get("cart") || "[]");

    // Tìm kiếm sản phẩm đã có trong giỏ hàng
    const existingToyIndex = cart.findIndex((item) => item.id === toy.id);

    if (existingToyIndex !== -1) {
      // Nếu sản phẩm đã có, cập nhật số lượng và thời gian thuê
      cart[existingToyIndex].quantity += 1;
      if (rentalDuration) {
        cart[existingToyIndex].rentalDuration = rentalDuration; // Cập nhật thời gian thuê
      }
    } else {
      // Nếu chưa có, thêm sản phẩm mới vào giỏ hàng cùng với thời gian thuê
      cart.push({ ...toy, quantity: 1, rentalDuration });
    }

    // Lưu lại giỏ hàng vào cookie
    Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
    alert("Sản phẩm đã được thêm vào giỏ hàng!");
  };

  const addToPurchase = (toy) => {
    const purchases = JSON.parse(Cookies.get("purchases") || "[]");

    const existingToy = purchases.find((item) => item.id === toy.id);

    if (existingToy) {
      existingToy.quantity = (existingToy.quantity || 1) + 1;
    } else {
      purchases.push({ ...toy, quantity: 1 });
    }

    Cookies.set("purchases", JSON.stringify(purchases), { expires: 7 });
    alert("Sản phẩm đã được thêm vào danh sách mua!");
    console.log(`Đã thêm ${toy.name} vào giỏ hàng`);
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
    if (selectedToy) {
      // Gọi hàm addToCart để thêm sản phẩm vào giỏ hàng
      addToCart({ ...selectedToy, rentalDuration });
      console.log(
        `Đã thêm ${selectedToy.name} vào giỏ với thời gian thuê: ${rentalDuration} và giá thuê: ${calculatedPrice} VNĐ`
      );

      // Đóng modal sau khi thêm vào giỏ hàng
      closeModal();
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
      default:
        rentalPrice = 0;
    }
    return rentalPrice;
  };
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
                    className="flex h-full flex-1 flex-col gap-4 rounded-lg hover:shadow-lg hover:bg-gray-100 transition duration-300"
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
              Các Nhãn Hàng Đối Tác
            </h2>
            <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-stretch p-4 gap-3">
                {featuredToys.map((category, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg"
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
              Khuyễn mãi hôm nay
            </h2>
            <div className="grid grid-cols-6 gap-3 p-4">
              {dealsOfTheDay.map((deal, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg"
                >
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                    style={{
                      backgroundImage: `url(https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png)`,
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
                      {deal.name}
                    </p>

                    <p className="text-[#507a95] text-sm">
                      Age group: {deal.age}
                    </p>
                    <div className="flex items-center gap-1">
                      {renderStars(deal.star)}
                    </div>
                    {deal.buyQuantity >= 0 ? (
                      <p className="text-[#0e161b] text-lg font-bold">
                        {deal.price} VNĐ
                      </p>
                    ) : (
                      <p className="text-[#0e161b] text-lg font-bold">
                        {deal.price} VNĐ
                      </p>
                    )}
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
                </div>
              ))}
            </div>

            <h2 className="text-[#0e161b] text-[22px] font-bold px-4 pt-5">
              Sản phẩm cho thuê mới nhất
            </h2>
            <div className="grid grid-cols-6 gap-3 p-4">
              {toysForRent.map((toy) => (
                <div
                  key={toy.id}
                  className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg"
                >
                  <Link to="/toys-rent-details">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                      style={{
                        backgroundImage: `url(https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png)`,
                      }}
                    ></div>
                  </Link>
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
                      Age group: {toy.ageGroup}
                    </p>
                    <div className="flex items-center gap-1">
                      {renderStars(toy.star)}
                    </div>
                    <p className="text-[#0e161b] text-lg font-bold">
                      {toy.price} VNĐ
                    </p>
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
                      src={selectedToy.image}
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
                      Giá: {selectedToy.price} VNĐ
                    </p>
                    <p className="text-lg font-bold text-[#0e161b] mb-2">
                      Giá thuê: {calculatedPrice} VNĐ
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

            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold">
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
                  className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg"
                >
                  <Link to="/toys-sale-details">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                      style={{
                        backgroundImage: `url(https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png)`,
                      }}
                    ></div>
                  </Link>
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
                      Age group: {toy.age}
                    </p>
                    <div className="flex items-center gap-1">
                      {renderStars(toy.star)}
                    </div>
                    <p className="text-[#0e161b] text-lg font-bold">
                      {toy.price} VNĐ
                    </p>
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
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold">
              <span className="truncate">Xem tất cả </span>
            </button>
          </div>
        </div>
      </div>
      <footer>
        <FooterForCustomer />
      </footer>
      <Outlet />
    </div>
  );
};

export default Home;
