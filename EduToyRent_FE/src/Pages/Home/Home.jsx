
import React, { useState, useEffect } from "react";

import { Outlet } from "react-router-dom";
import Sidebar from "../../Component/Sidebar/Sidebar";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { Link } from "react-router-dom";

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
];

const recommendedToys = [
  {
    name: "Kids Play Kitchen",
    ageGroup: "Ages 4-6",
    price: "49.99",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Outdoor Adventure Set",
    ageGroup: "Ages 5-8",
    price: "34.99",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Musical Instruments",
    ageGroup: "Ages 6-9",
    price: "59.99",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
];

const SaleToys = [
  {
    name: "Kids Play Kitchen",
    ageGroup: "Ages 4-6",
    price: "49.99",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Outdoor Adventure Set",
    ageGroup: "Ages 5-8",
    price: "34.99",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
  {
    name: "Musical Instruments",
    ageGroup: "Ages 6-9",
    price: "59.99",
    image:
      "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  },
];

const images = [
  "https://cdn.usegalileo.ai/sdxl10/53c88725-ec48-4320-81f5-e34d4c105caf.png",
  "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
  // Thay thế bằng URL hình ảnh thứ ba
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Thay đổi hình ảnh mỗi 3 giây

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
              className="relative flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 pb-10"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("${images[currentImageIndex]}")`,
              }}
            >
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
              {" "}
              {/* Thay đổi thành 6 cột */}
              {dealsOfTheDay.map((deal, index) => (
                <div key={index} className="flex flex-col gap-3 pb-3">
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
                    <p className="text-[#0e161b] text-lg font-bold">
                      ${deal.price}
                    </p>
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
              {recommendedToys.map((toy, index) => (
                <Link to="/toys-rent-details">
                  <div key={index} className="flex flex-col gap-3 pb-3">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                      style={{ backgroundImage: `url(${toy.image})` }}
                    ></div>
                    <div>
                      <p className="text-[#0e161b] text-base font-medium">
                        {toy.name}
                      </p>
                      <p className="text-[#507a95] text-sm">
                        Age group: {toy.ageGroup}
                      </p>
                      <p className="text-[#0e161b] text-lg font-bold">
                        ${toy.price}
                      </p>
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
              {" "}
              {/* Thay đổi thành 6 cột */}
              {SaleToys.map((toy, index) => (
                <Link to="/toys-sale-details">
                  <div key={index} className="flex flex-col gap-3 pb-3">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                      style={{ backgroundImage: `url(${toy.image})` }}
                    ></div>
                    <div>
                      <p className="text-[#0e161b] text-base font-medium">
                        {toy.name}
                      </p>
                      <p className="text-[#507a95] text-sm">
                        Age group: {toy.ageGroup}
                      </p>
                      <p className="text-[#0e161b] text-lg font-bold">
                        ${toy.price}
                      </p>
                    </div>
                  </div>
                </Link>
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
