import React, { useState } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { Link } from "react-router-dom";

const ToysDetails = () => {
  const starRating = 4.0; // Số sao (giả sử)
  const reviewCount = 25; // Số lượt đánh giá (giả sử)
  const ratings = [
    { score: 5, percentage: 60 },
    { score: 4, percentage: 20 },
    { score: 3, percentage: 10 },
    { score: 2, percentage: 5 },
    { score: 1, percentage: 5 },
  ];

  // Giá thuê theo thời gian
  const prices = {
    week: 15, // Giá thuê cho 1 tuần
    twoWeeks: 25, // Giá thuê cho 2 tuần
    month: 50, // Giá thuê cho 1 tháng
  };

  // State để lưu giá hiện tại và thời gian thuê đã chọn
  const [currentPrice, setCurrentPrice] = useState(prices.week);
  const [selectedDuration, setSelectedDuration] = useState("week"); // Mặc định chọn 1 tuần

  // Hàm thay đổi giá khi nhấn nút
  const handlePriceChange = (duration) => {
    setCurrentPrice(prices[duration]);
    setSelectedDuration(duration); // Cập nhật thời gian thuê đã chọn
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số lượng đánh giá hiển thị trên mỗi trang

  const indexOfLastReview = currentPage * itemsPerPage;
  const indexOfFirstReview = indexOfLastReview - itemsPerPage;
  const currentReviews = ratings.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviewCount / itemsPerPage);

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 p-9">
      <header>
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
                Rainbow Stacker
              </span>
            </div>
            <div className="container">
              <div className="flex flex-col lg:flex-row gap-6 px-4 py-10">
                <div
                  className="w-full lg:w-1/2 bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                  style={{
                    backgroundImage:
                      'url("https://cdn.usegalileo.ai/sdxl10/122ecb42-c292-4141-a041-c800f08a9fd3.png")',
                  }}
                ></div>
                <div className="flex flex-col lg:w-1/2 gap-6 justify-center">
                  <h1 className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                    Rainbow Stacker
                  </h1>
                  {/* Hiển thị số lượng sao và số lượt đánh giá */}
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, index) => (
                        <img
                          key={index}
                          src={
                            index < Math.floor(starRating)
                              ? "https://cdn-icons-png.flaticon.com/512/616/616489.png" // Hình ảnh sao đầy
                              : "https://cdn-icons-png.flaticon.com/512/616/616505.png" // Hình ảnh sao rỗng
                          }
                          alt="Star"
                          className="w-5 h-5"
                        />
                      ))}
                      <span className="text-[#0e141b] ml-2">{starRating}</span>
                    </div>
                    <span className="text-[#0e141b] text-sm">
                      ({reviewCount} đánh giá)
                    </span>
                  </div>
                  <h2 className="text-[#0e141b] text-sm font-normal leading-normal">
                    Địa chỉ :
                  </h2>
                  <p className="text-[#0e141b] text-lg font-bold mt-2">
                    Giá gốc: 100$
                  </p>

                  {/* Nút thời gian thuê */}
                  <div className="flex gap-4 mt-4">
                    <button
                      className={`flex-1 h-10 rounded ${
                        selectedDuration === "week"
                          ? "bg-[#0e141b] text-white"
                          : "bg-[#1980e6] text-white"
                      } font-bold`}
                      onClick={() => handlePriceChange("week")}
                    >
                      1 Tuần
                    </button>
                    <button
                      className={`flex-1 h-10 rounded ${
                        selectedDuration === "twoWeeks"
                          ? "bg-[#0e141b] text-white"
                          : "bg-[#1980e6] text-white"
                      } font-bold`}
                      onClick={() => handlePriceChange("twoWeeks")}
                    >
                      2 Tuần
                    </button>
                    <button
                      className={`flex-1 h-10 rounded ${
                        selectedDuration === "month"
                          ? "bg-[#0e141b] text-white"
                          : "bg-[#1980e6] text-white"
                      } font-bold`}
                      onClick={() => handlePriceChange("month")}
                    >
                      1 Tháng
                    </button>
                  </div>

                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] mt-4">
                    <span className="truncate">
                      Thêm vào giỏ hàng với giá ${currentPrice}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
              <div className="flex items-center mb-2">
                <img
                  src="https://cdn.iconscout.com/icon/free/png-256/user-1194416-1003670.png" // Thay thế bằng đường dẫn đến ảnh đại diện của cửa hàng
                  alt="Store Icon"
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Người Cho Thuê: TCS</h3>

                  <div className="flex space-x-2 mt-2">
                    <button className="border border-blue-500 text-blue-500 font-semibold px-4 py-2 rounded">
                      Chat ngay
                    </button>
                    <Link to="/lessor-toys-details">
                      <button className="border border-green-500 text-green-500 font-semibold px-4 py-2 rounded">
                        Xem shop
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <span className="text-sm text-gray-500 mr-4">
                    Sản phẩm: 608
                  </span>
                  <span className="text-sm text-gray-500 mr-4">
                    Đánh giá: 252,8k
                  </span>
                  <span className="text-sm text-gray-500">
                    Điểm đánh giá trung bình: 5.0
                  </span>
                </div>
              </div>
            </div>

            <h2 class="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              CHI TIẾT SẢN PHẨM
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="mb-2">
                <span className="font-semibold">Danh Mục:</span> Đồ chơi trí não
              </div>
              <div className="mb-2">
                <span className="font-semibold">Kho:</span> 1
              </div>
              <div className="mb-2">
                <span className="font-semibold">Thương hiệu:</span> Lego
              </div>
              <div className="mb-2">
                <span className="font-semibold">Gửi từ:</span> Hà Nội
              </div>
            </div>

            <h2 class="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              MÔ TẢ SẢN PHẨM
            </h2>
            <p class="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-1 px-4">
              This classic wooden stacking toy is perfect for kids aged 1-3. It
              helps develop fine motor skills, hand-eye coordination, and
              cognitive thinking. The bright colors and fun shapes will keep
              your little one entertained for hours.
            </p>

            <h2 class="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              ĐÁNH GIÁ SẢN PHẨM
            </h2>
            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                  {starRating}
                </p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="text-[#1980e6]"
                      data-icon="Star"
                      data-size="18px"
                      data-weight={
                        index < Math.floor(starRating) ? "fill" : "regular"
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
                            index < Math.floor(starRating)
                              ? "M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                              : "M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z"
                          }
                        />
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="text-[#0e141b] text-base font-normal leading-normal">
                  {reviewCount} Đánh giá
                </p>
              </div>
              <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
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
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-6 p-0">
                {currentReviews.map((rating, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 bg-slate-50 border border-gray-300 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{
                          backgroundImage:
                            'url("https://cdn.usegalileo.ai/stability/8a587c11-2887-4ea5-a001-d4e843282f31.png")',
                        }}
                      ></div>
                      <div className="flex-1">
                        <p className="text-[#0e141b] text-base font-medium leading-normal">
                          Sarah {/* Tên người đánh giá */}
                        </p>
                        <p className="text-[#4e7397] text-sm font-normal leading-normal">
                          Sep 20, 2023 {/* Ngày đánh giá */}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array(5)
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
                      My son loves this toy! The colors are vibrant, and the
                      pieces are just the right size for his little hands. I
                      highly recommend it to other parents.
                    </p>
                  </div>
                ))}
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
                  {recommendedToys.map((toy, index) => (
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default ToysDetails;
