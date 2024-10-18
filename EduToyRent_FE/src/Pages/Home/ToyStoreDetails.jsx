import React, { useState, useEffect } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";

const ToyStoreDetails = () => {
  const images = [
    "https://cdn.usegalileo.ai/sdxl10/53c88725-ec48-4320-81f5-e34d4c105caf.png",
    "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
    // Thay thế bằng URL hình ảnh thứ ba
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

  const toys = [
    {
      name: "Đồ chơi phát triển tư duy",
      ageGroup: "Ages 3-5",
      brand: "Brand A",
      price: "19.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forSale",
    },
    {
      name: "Remote Control Car",
      ageGroup: "Ages 4-6",
      brand: "Brand B",
      price: "29.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forRent",
    },
    {
      name: "Đồ chơi phát triển tư duy",
      ageGroup: "Ages 3-5",
      brand: "Brand A",
      price: "19.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forSale",
    },
    {
      name: "Remote Control Car",
      ageGroup: "Ages 4-6",
      brand: "Brand B",
      price: "29.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forRent",
    },
    {
      name: "Đồ chơi phát triển tư duy",
      ageGroup: "Ages 3-5",
      brand: "Brand A",
      price: "19.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forSale",
    },
    {
      name: "Remote Control Car",
      ageGroup: "Ages 4-6",
      brand: "Brand B",
      price: "29.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forRent",
    },
    {
      name: "Remote Control Car",
      ageGroup: "Ages 4-6",
      brand: "Brand B",
      price: "29.99",
      image:
        "https://cdn.usegalileo.ai/sdxl10/7d365c36-d63a-4aff-9e34-b111fb44eddd.png",
      type: "forRent",
    },
    // Thêm nhiều đồ chơi khác tại đây
  ];

  const [ageGroup, setAgeGroup] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái cho tìm kiếm
  const [toyType, setToyType] = useState(""); // Trạng thái để lọc giữa đồ chơi bán và cho thuê
  const [filteredToys, setFilteredToys] = useState(toys); // Trạng thái cho đồ chơi đã lọc

  // Thêm trạng thái cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Số lượng đồ chơi mỗi trang

  const handleSearch = () => {
    const newFilteredToys = toys.filter((toy) => {
      const matchesAge = ageGroup ? toy.ageGroup === ageGroup : true;
      const matchesPrice = maxPrice
        ? parseFloat(toy.price) <= parseFloat(maxPrice)
        : true;
      const matchesBrand = brand ? toy.brand === brand : true;
      const matchesSearch = toy.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = toyType ? toy.type === toyType : true;

      return (
        matchesAge &&
        matchesPrice &&
        matchesBrand &&
        matchesSearch &&
        matchesType
      );
    });
    setFilteredToys(newFilteredToys); // Cập nhật danh sách đồ chơi đã lọc
    setCurrentPage(1); // Reset trang về 1 khi tìm kiếm
  };

  // Tính toán phần tử trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredToys.slice(indexOfFirstItem, indexOfLastItem);

  // Tạo danh sách số trang
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredToys.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

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
          <div className="flex flex-col gap-6">
            <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
              <div className="flex items-center mb-2">
                <img
                  src="https://cdn.iconscout.com/icon/free/png-256/user-1194416-1003670.png" // Thay thế bằng đường dẫn đến ảnh đại diện của cửa hàng
                  alt="Store Icon"
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    Cửa Hàng Đồ Chơi : TCS
                  </h3>

                  <div className="flex space-x-2 mt-2">
                    <button className="border border-blue-500 text-blue-500 font-semibold px-4 py-2 rounded">
                      Chat ngay
                    </button>
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

            <div>
              <div className="flex items-center justify-between px-4 pt-5">
                <h2 className="text-[#0e161b] text-[22px] font-bold">
                  GỢI Ý CHO BẠN
                </h2>
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

            <h2 className="text-[#0e161b] text-[22px] font-bold">
              Thông tin cửa hàng
            </h2>
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
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="mb-2">
                <span className="font-semibold">
                  Tại sao nên mua hàng Xiaomi tại Cửa Hàng TCS
                </span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">
                  Cam kết hàng chính hãng 100%,khách có thể đến cửa hàng mua
                  hàng xem hàng và kiểm tra thật giả bằng mọi cách
                </span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">
                  Cửa Hàng có địa chỉ rõ ràng tại Hà Nội và TP Hồ Chí Minh, bạn
                  có thể yên tâm mua hàng
                </span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">
                  Cửa hàng nhận ship hàng toàn quốc
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              <div>
                <div className="flex items-center justify-between px-4 pt-5">
                  <h2 className="text-[#0e161b] text-[22px] font-bold">
                    Các sản phẩm của TCS
                  </h2>
                </div>
                <div className="layout-content-container flex max-w-[1200px] w-full px-4 sm:px-6 lg:px-8">
                  {/* Thanh Filter bên trái */}
                  <div className="w-1/4 p-4 bg-gray-100 rounded-lg shadow-sm">
                    <h2 className="text-[#0e161b] text-xl font-bold mb-4">
                      Filters
                    </h2>

                    <div className="mb-4">
                      <label className="mb-1">Age Group:</label>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        className="border rounded p-2 w-full"
                      >
                        <option value="">All</option>
                        <option value="Ages 3-5">Ages 3-5</option>
                        <option value="Ages 4-6">Ages 4-6</option>
                        <option value="Ages 6-8">Ages 6-8</option>
                        <option value="Ages 9-12">Ages 9-12</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="mb-1">Max Price:</label>
                      <select
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="border rounded p-2 w-full"
                      >
                        <option value="">All</option>
                        <option value="10">Up to $10</option>
                        <option value="20">Up to $20</option>
                        <option value="30">Up to $30</option>
                        <option value="40">Up to $40</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="mb-1">Brand:</label>
                      <select
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="border rounded p-2 w-full"
                      >
                        <option value="">All</option>
                        <option value="Brand A">Brand A</option>
                        <option value="Brand B">Brand B</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSearch}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Apply Filters
                    </button>
                  </div>

                  {/* Phần hiển thị sản phẩm bên phải */}
                  <div className="w-3/4 pl-6">
                    <div className="mb-4">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded p-2 w-full"
                        placeholder="Tìm kiếm bằng tên đồ chơi"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentItems.length > 0 ? (
                        currentItems.map((toy, index) => (
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
                              <p className="text-[#0e161b] text-sm">
                                Brand: {toy.brand}
                              </p>
                              <p className="text-[#0e161b] text-lg font-bold">
                                ${toy.price}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#0e161b] text-lg">No toys found</p>
                      )}
                    </div>

                    {/* Phân trang */}
                    <div className="flex justify-center mt-4">
                      {pageNumbers.map((number) => (
                        <button
                          key={number}
                          onClick={() => setCurrentPage(number)}
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
      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default ToyStoreDetails;
