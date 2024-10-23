import React, { useState, useEffect } from "react";

import { Outlet } from "react-router-dom";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";

import { Link } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // Import các biểu tượng sao

const featuredToys = [
  {
    name: "Đồ chơi phát triển tư duy",
    ageGroup: "Ages 3-5",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Đồ chơi STEM",
    ageGroup: "Ages 6-8",
    image:
      "https://cdn.usegalileo.ai/stability/600f7d73-b2c4-4ef5-a065-4968a5ee23d4.png",
  },
  {
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
    rating: 5,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Dinosaur Play Set",
    ageGroup: "Ages 3-6",
    price: "39.99",
    rating: 3,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
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
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
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
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
];

const recommendedToys = [
  {
    name: "Kids Play Kitchen",
    ageGroup: "Ages 4-6",
    price: "49.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Outdoor Adventure Set",
    ageGroup: "Ages 5-8",
    price: "34.99",
    rating: 5,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Musical Instruments",
    ageGroup: "Ages 6-9",
    price: "59.99",
    rating: 3,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
];

const SaleToys = [
  {
    name: "Kids Play Kitchen",
    ageGroup: "Ages 4-6",
    price: "49.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Outdoor Adventure Set",
    ageGroup: "Ages 5-8",
    price: "34.99",
    rating: 4,
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Thay đổi hình ảnh mỗi 3 giây

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
              {" "}
              {/* Thay đổi thành 6 cột */}
              {recommendedToys.map((deal, index) => (
                <Link to="/toys-rent-details">
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
                </Link>
              ))}
            </div>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold">
              <span className="truncate">Xem tất cả</span>
            </button>

            <h2 className="text-[#0e161b] text-[22px] font-bold px-4 pt-5">
              Sản phẩm bán mới nhất
            </h2>
            <div className="grid grid-cols-6 gap-3 p-4">
              {SaleToys.map((deal, index) => (
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
