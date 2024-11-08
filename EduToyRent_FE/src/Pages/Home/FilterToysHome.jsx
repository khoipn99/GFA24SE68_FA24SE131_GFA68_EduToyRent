import React, { useEffect, useState } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import apiToys from "../../service/ApiToys";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // Import các biểu tượng sao
import Cookies from "js-cookie"; // Import thư viện Cookies

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
  const [Toys, setToys] = useState([]);
  const [selectedToy, setSelectedToy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [rentalDuration, setRentalDuration] = useState(); // Giá trị mặc định là "1 tuần"
  const [rentItems, setRentItems] = useState([]); // Khởi tạo giỏ hàng

  // Thêm trạng thái cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Số lượng đồ chơi mỗi trang

  useEffect(() => {
    apiToys.get("?pageIndex=1&pageSize=20").then((response) => {
      console.log(response.data);
      setToys(response.data);
    });
  }, []);
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

  const openModal = (toy) => {
    setSelectedToy(toy);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedToy(null);
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
              {Toys.length > 0 ? (
                Toys.map((deal, index) => (
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
