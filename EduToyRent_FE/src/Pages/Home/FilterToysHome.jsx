import React, { useState } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";

// Giả sử bạn đã có danh sách đồ chơi
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
  // Thêm nhiều đồ chơi khác tại đây
];

const FilterToys = () => {
  const [ageGroup, setAgeGroup] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái cho tìm kiếm
  const [toyType, setToyType] = useState(""); // Trạng thái để lọc giữa đồ chơi bán và cho thuê
  const [filteredToys, setFilteredToys] = useState(toys); // Trạng thái cho đồ chơi đã lọc

  // Thêm trạng thái cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Số lượng đồ chơi mỗi trang

  // Lọc đồ chơi theo tiêu chí
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 p-9">
      <header>
        <HeaderForCustomer />
      </header>
      <div className="flex flex-1 justify-center py-5 bg-white shadow-md">
        <div className="layout-content-container flex max-w-[1200px] w-full px-4 sm:px-6 lg:px-8">
          {/* Thanh Filter bên trái */}
          <div className="w-1/4 p-4 bg-gray-100 rounded-lg shadow-sm">
            <h2 className="text-[#0e161b] text-xl font-bold mb-4">Filters</h2>

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

            {/* Nút lọc đồ chơi bán và cho thuê */}
            <div className="mb-4">
              <button
                onClick={() => setToyType("forSale")}
                className={`${
                  toyType === "forSale" ? "bg-green-800" : "bg-green-500"
                } text-white px-4 py-2 rounded mb-2 w-full`}
              >
                Đồ chơi bán
              </button>
              <button
                onClick={() => setToyType("forRent")}
                className={`${
                  toyType === "forRent" ? "bg-green-800" : "bg-green-500"
                } text-white px-4 py-2 rounded w-full`}
              >
                Đồ chơi cho thuê
              </button>
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
            <h3 className="text-[#0e161b] text-2xl font-bold mt-4 mb-2">
              Kết quả tìm kiếm cho từ khóa '{searchTerm}'
            </h3>
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
                    currentPage === number ? "bg-blue-800" : "bg-blue-500"
                  } text-white px-3 py-2 mx-1 rounded`}
                >
                  {number}
                </button>
              ))}
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

export default FilterToys;
