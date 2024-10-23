import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import thư viện Cookies
import { Outlet } from "react-router-dom";
import Sidebar from "../../Component/Sidebar/Sidebar";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { Link } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // Import các biểu tượng sao

const featuredToys = [
  {
    id: 1,
    name: "Đồ chơi phát triển tư duy",
    ageGroup: "Ages 3-5",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    id: 2,
    name: "Đồ chơi STEM",
    ageGroup: "Ages 6-8",
    image:
      "https://cdn.usegalileo.ai/stability/600f7d73-b2c4-4ef5-a065-4968a5ee23d4.png",
  },
  {
    id: 3,
    name: "Đồ chơi ngôn ngữ",
    ageGroup: "Ages 9-12",
    image:
      "https://cdn.usegalileo.ai/stability/94e0bca4-abc6-4700-8e82-cf72b95d7a27.png",
  },
  {
    name: "Đồ chơi nghệ thuật và sáng tạo",
    ageGroup: "Ages 10+",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Đồ chơi toán học",
    ageGroup: "Ages 10+",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Đồ chơi cho thuê",
    ageGroup: "Ages 10+",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Đồ chơi bán",
    ageGroup: "Ages 10+",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "",
    ageGroup: "Ages 10+",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
];

const dealsOfTheDay = [
  {
    name: "Remote Control Car",
    ageGroup: "Ages 4-6",
    price: "29.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Magic Markers",
    ageGroup: "Ages 5-7",
    price: "14.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Dinosaur Play Set",
    ageGroup: "Ages 3-6",
    price: "39.99",
    rating: 5,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Remote Control Car",
    ageGroup: "Ages 4-6",
    price: "29.99",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Magic Markers",
    ageGroup: "Ages 5-7",
    price: "14.99",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Dinosaur Play Set",
    ageGroup: "Ages 3-6",
    price: "39.99",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Remote Control Car",
    ageGroup: "Ages 4-6",
    price: "29.99",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Magic Markers",
    ageGroup: "Ages 5-7",
    price: "14.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Dinosaur Play Set",
    ageGroup: "Ages 3-6",
    price: "39.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
];

const recommendedToys = [
  {
    id: 1,
    name: "Kids Play Kitchen",
    ageGroup: "Ages 4-6",
    price: "49.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    id: 2,
    name: "Outdoor Adventure Set",
    ageGroup: "Ages 5-8",
    price: "34.99",
    rating: 5,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    id: 3,
    name: "Musical Instruments",
    ageGroup: "Ages 6-9",
    price: "59.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
];

const SaleToys = [
  {
    id: 1,
    name: "Kids Play Kitchen",
    ageGroup: "Ages 4-6",
    price: "49.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    id: 2,
    name: "Outdoor Adventure Set",
    ageGroup: "Ages 5-8",
    price: "34.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    id: 3,
    name: "Musical Instruments",
    ageGroup: "Ages 6-9",
    price: "59.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
];

const images = [
  "https://cdn.usegalileo.ai/sdxl10/53c88725-ec48-4320-81f5-e34d4c105caf.png",
  "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  "https://cdn.usegalileo.ai/stability/94e0bca4-abc6-4700-8e82-cf72b95d7a27.png",
  // Thay thế bằng URL hình ảnh thứ ba
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedToy, setSelectedToy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rentalDuration, setRentalDuration] = useState(); // Giá trị mặc định là "1 tuần"
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [rentItems, setRentItems] = useState([]); // Khởi tạo giỏ hàng

  const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  };

  const getCookie = (cname) => {
    const name = cname + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Thay đổi hình ảnh mỗi 3 giây

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
  const addToCart = (toy) => {
    const cart = JSON.parse(Cookies.get("cart") || "[]");

    // Tìm kiếm sản phẩm đã có trong giỏ hàng
    const existingToyIndex = cart.findIndex((item) => item.id === toy.id);

    if (existingToyIndex !== -1) {
      // Nếu sản phẩm đã có, cập nhật số lượng và thời gian thuê
      cart[existingToyIndex].quantity += 1;
      // Cập nhật thời gian thuê nếu người dùng đã chọn
      if (rentalDuration) {
        cart[existingToyIndex].rentalDuration = rentalDuration;
      }
    } else {
      // Nếu chưa có, thêm sản phẩm mới vào giỏ hàng cùng với thời gian thuê
      cart.push({ ...toy, quantity: 1, rentalDuration }); // Lưu rentalDuration
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
  const openModal = (toy) => {
    setSelectedToy(toy);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedToy(null);
  };

  // Cập nhật giá khi người dùng chọn thời gian thuê
  const handleDurationChange = (duration) => {
    if (selectedToy) {
      // Kiểm tra xem selectedToy có tồn tại không
      setRentalDuration(duration);
      const price = calculateRentalPrice(selectedToy.price, duration);
      setCalculatedPrice(price);
    }
  };
  const confirmAddToCart = () => {
    if (selectedToy) {
      // Kiểm tra xem selectedToy có tồn tại không
      updateRentalDuration(selectedToy.id, rentalDuration);

      // Gọi hàm addToCart để thêm sản phẩm vào giỏ hàng
      addToCart({ ...selectedToy, rentalDuration }); // Thêm rentalDuration vào sản phẩm
      console.log(
        `Đã thêm ${selectedToy.name} vào giỏ với thời gian thuê: ${rentalDuration} và giá thuê: ${calculatedPrice} VNĐ`
      );

      closeModal();
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
                  width: `${images.length * 100}%`,
                }}
              >
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="min-w-full flex-shrink-0"
                    style={{
                      backgroundImage: `url("${image}")`,
                      backgroundSize: "cover", // Thay đổi thành cover
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      height: "480px",
                      width: "100%",
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
                {featuredToys.map((toy, index) => (
                  <div
                    key={index}
                    className="flex h-full flex-1 flex-col gap-4 rounded-lg"
                  >
                    <Link to="/filter-toys">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                        style={{ backgroundImage: `url(${toy.image})` }}
                      ></div>
                    </Link>
                    <div>
                      <p className="text-[#0e161b] text-base font-medium">
                        {toy.name}
                      </p>
                      <p className="text-[#507a95] text-sm">{toy.ageGroup}</p>
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
                    style={{ backgroundImage: `url(${deal.image})` }}
                  ></div>
                  <div>
                    <p className="text-[#0e161b] text-base font-medium">
                      {deal.name}
                    </p>
                    <p className="text-[#507a95] text-sm">
                      Age group: {deal.ageGroup}
                    </p>
                    <div className="flex items-center gap-1">
                      {renderStars(deal.rating)}
                    </div>
                    <p className="text-[#0e161b] text-lg font-bold">
                      ${deal.price}
                    </p>

                    <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold">
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-[#0e161b] text-[22px] font-bold px-4 pt-5">
              Sản phẩm cho thuê mới nhất
            </h2>
            <div className="grid grid-cols-6 gap-3 p-4">
              {recommendedToys.map((toy) => (
                <div
                  key={toy.id}
                  className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg"
                >
                  <Link to="/toys-rent-details">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                      style={{ backgroundImage: `url(${toy.image})` }}
                    ></div>
                  </Link>
                  <div>
                    <p className="text-[#0e161b] text-base font-medium">
                      {toy.name}
                    </p>
                    <p className="text-[#507a95] text-sm">
                      Age group: {toy.ageGroup}
                    </p>
                    <div className="flex items-center gap-1">
                      {renderStars(toy.rating)}
                    </div>
                    <p className="text-[#0e161b] text-lg font-bold">
                      ${toy.price}
                    </p>
                  </div>
                  <button
                    className="bg-[#0e161b] text-white text-sm px-4 py-2 rounded-md hover:bg-[#507a95] transition-all"
                    onClick={() => openModal(toy)}
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              ))}
            </div>

            {isModalOpen && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                onClick={closeModal}
              >
                <div
                  className="cart-modal bg-white p-4 shadow-md rounded-lg w-[700px] h-[500px] flex relative" // Thêm "relative" để định vị nút "x"
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
                      {renderStars(selectedToy.rating)}
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
              {SaleToys.map((toy) => (
                <div
                  key={toy.id}
                  className="flex flex-col gap-3 pb-3 transition-transform transform hover:scale-105 hover:shadow-lg hover:border hover:border-[#00aaff] hover:bg-[#f5faff] p-2 rounded-lg"
                >
                  <Link to="/toys-sale-details">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                      style={{ backgroundImage: `url(${toy.image})` }}
                    ></div>
                  </Link>
                  <div>
                    <p className="text-[#0e161b] text-base font-medium">
                      {toy.name}
                    </p>
                    <p className="text-[#507a95] text-sm">
                      Age group: {toy.ageGroup}
                    </p>
                    <div className="flex items-center gap-1">
                      {renderStars(toy.rating)}
                    </div>
                    <p className="text-[#0e161b] text-lg font-bold">
                      ${toy.price}
                    </p>
                  </div>
                  {/* Nút thêm vào giỏ hàng */}
                  <button
                    className="bg-[#0e161b] text-white text-sm px-4 py-2 rounded-md hover:bg-[#507a95] transition-all"
                    onClick={() => addToPurchase(toy)} // Gọi hàm addToCart khi bấm nút
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              ))}
            </div>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold">
              <span className="truncate">Xem tất cả</span>
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
