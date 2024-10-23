import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Cookies from "js-cookie"; // Đảm bảo bạn đã import js-cookie
const HeaderForCustomer = () => {
  const [cartVisible, setCartVisible] = useState(false);
  const [rentItems, setRentItems] = useState([]);
  const [buyItems, setBuyItems] = useState([]);
  const [totalRentPrice, setTotalRentPrice] = useState(0);
  const [totalBuyPrice, setTotalBuyPrice] = useState(0);

  const toggleCart = () => {
    // Mở hoặc đóng giỏ hàng
    setCartVisible(!cartVisible);
    if (!cartVisible) {
      loadCartFromCookies(); // Tải lại giỏ hàng từ cookie khi mở giỏ hàng
    }
  };

  const loadCartFromCookies = () => {
    // Lấy sản phẩm thuê từ cookie
    const rentalCart = JSON.parse(Cookies.get("cart") || "[]");
    console.log("Rental Cart:", rentalCart);
    setRentItems(rentalCart);

    //Lấy sản phẩm mua từ cookie (giả sử bạn lưu chúng trong cookie khác hoặc sử dụng cùng một cookie)
    const buyCart = JSON.parse(Cookies.get("purchases") || "[]");
    setBuyItems(buyCart);
  };

  const updateQuantity = (id, newQuantity, type) => {
    if (type === "rent") {
      setRentItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } else {
      setBuyItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  useEffect(() => {
    const newTotalRentPrice = rentItems.reduce((total, item) => {
      const rentalPrice = calculateRentalPrice(item.price, item.rentalDuration);
      return total + rentalPrice;
    }, 0);
    setTotalRentPrice(newTotalRentPrice);
  }, [rentItems]);

  useEffect(() => {
    const newTotalBuyPrice = buyItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    setTotalBuyPrice(newTotalBuyPrice);
  }, [buyItems]);

  useEffect(() => {
    // Tải giỏ hàng từ cookie khi component được mount lần đầu
    loadCartFromCookies();
  }, []);

  function removeItem(itemId, type) {
    if (type === "rent") {
      // Xóa sản phẩm khỏi danh sách giỏ hàng "rent"
      const updatedRentItems = rentItems.filter((item) => item.id !== itemId);
      setRentItems(updatedRentItems);

      // Cập nhật lại cookie sau khi xóa sản phẩm
      Cookies.set("cart", JSON.stringify(updatedRentItems));
      console.log(`Đã xoá sản phẩm thuê khỏi giỏ hàng`);
    } else {
      // Xóa sản phẩm khỏi danh sách giỏ hàng "buy"
      const updatedBuyItems = buyItems.filter((item) => item.id !== itemId);
      setBuyItems(updatedBuyItems);

      // Cập nhật lại cookie sau khi xóa sản phẩm
      Cookies.set("purchases", JSON.stringify(updatedBuyItems));
      console.log(`Đã xoá sản phẩm bán khỏi giỏ hàng`);
    }

    // Sau khi xóa, tải lại giỏ hàng từ cookie để hiển thị thông tin chính xác
    loadCartFromCookies();
  }

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
    <div className="bg-white shadow-md">
      <div className="flex items-center justify-between gap-8 p-6">
        <div className="flex items-center gap-4 text-[#0e161b]">
          <Link to="/">
            <div className="size-4">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </Link>
          <Link to="/">
            <h2 className="text-[#0e161b] text-lg font-bold leading-tight tracking-[-0.015em]">
              Edutoys
            </h2>
          </Link>
        </div>
        {/* <label className="flex flex-col min-w-40 !h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
            <div className="text-[#507a95] flex border-none bg-[#e8eef3] items-center justify-center pl-4 rounded-l-xl border-r-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input
              placeholder="Search"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e161b] focus:outline-0 focus:ring-0 border-none bg-[#e8eef3] h-full placeholder:text-[#507a95] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              value=""
            />
          </div>
        </label> */}
        <div className="flex gap-2">
          <Link to="/login">
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#47a6e6] text-white text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Đăng nhập</span>
            </button>
          </Link>
          <Link to="/register">
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e8eef3] text-[#0e161b] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Đăng ký</span>
            </button>
          </Link>
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
            <div className="text-[#0e161b]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20px"
                height="20px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
              </svg>
            </div>
          </button>
          <button
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#e8eef3] text-[#0e161b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
            onClick={toggleCart}
          >
            <div className="text-[#0e161b]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20px"
                height="20px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"></path>
              </svg>
            </div>
          </button>
          {cartVisible && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50"
              onClick={toggleCart}
            >
              <div
                className="cart-modal bg-white p-4 shadow-md rounded-md w-[700px] h-full flex flex-col justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex-grow overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Giỏ hàng của bạn</h2>
                    <button
                      className="text-gray-600 hover:text-gray-800 text-2xl"
                      onClick={toggleCart}
                    >
                      &times;
                    </button>
                  </div>
                  <h3 className="font-bold mb-2 mt-4">Đơn Thuê Sản Phẩm</h3>
                  <div className="flex-grow overflow-y-auto max-h-72">
                    {rentItems.length === 0 ? (
                      <p>Giỏ hàng thuê trống.</p>
                    ) : (
                      rentItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center mb-4 relative"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover mr-4"
                          />
                          <div className="flex-grow">
                            <h3 className="font-bold">{item.name}</h3>
                            <div className="flex flex-col">
                              {/* Chọn thời gian thuê */}
                              <div className="flex justify-between items-center mb-2">
                                <p className="mr-4">
                                  Giá gốc: {item.price} VNĐ
                                </p>
                              </div>
                              <div className="flex space-x-4">
                                <button
                                  className={`border px-4 py-2 ${
                                    item.rentalDuration === "1 tuần"
                                      ? "bg-blue-500 text-white"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    updateRentalDuration(item.id, "1 tuần")
                                  }
                                >
                                  1 tuần
                                </button>
                                <button
                                  className={`border px-4 py-2 ${
                                    item.rentalDuration === "2 tuần"
                                      ? "bg-blue-500 text-white"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    updateRentalDuration(item.id, "2 tuần")
                                  }
                                >
                                  2 tuần
                                </button>
                                <button
                                  className={`border px-4 py-2 ${
                                    item.rentalDuration === "1 tháng"
                                      ? "bg-blue-500 text-white"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    updateRentalDuration(item.id, "1 tháng")
                                  }
                                >
                                  1 tháng
                                </button>
                              </div>
                              {/* Hiển thị giá thay đổi theo thời gian thuê */}
                              <div className="mt-2">
                                <p className="font-bold">
                                  Giá thuê:{" "}
                                  {calculateRentalPrice(
                                    item.price,
                                    item.rentalDuration
                                  )}{" "}
                                  VNĐ
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-xl font-bold"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Bạn có chắc chắn muốn xóa sản phẩm này không?"
                                )
                              ) {
                                removeItem(item.id, "rent"); // Xóa item với id tương ứng
                              }
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <h3 className="font-bold mb-2 mt-4">Đơn Mua Sản Phẩm</h3>
                  <div className="flex-grow overflow-y-auto max-h-72">
                    {buyItems.length === 0 ? (
                      <p>Giỏ hàng mua trống.</p>
                    ) : (
                      buyItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center mb-4 relative"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover mr-4"
                          />
                          <div className="flex-grow">
                            <h3 className="font-bold">{item.name}</h3>
                            <div className="flex justify-between items-center">
                              <p className="mr-4">Giá: {item.price} VNĐ</p>
                              <div className="flex items-center">
                                <button
                                  className="border px-2 py-1 mr-2"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity - 1,
                                      "buy"
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                  className="border px-2 py-1 ml-2"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity + 1,
                                      "buy"
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-xl font-bold"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Bạn có chắc chắn muốn xóa sản phẩm này không?"
                                )
                              ) {
                                removeItem(item.id, "buy"); // Xóa item với id tương ứng
                              }
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Phần tổng tiền nằm ở đáy */}
                <div className="border-t border-gray-200 bg-white py-4">
                  <h4 className="text-md font-semibold">
                    Tổng tiền thuê: {totalRentPrice} VNĐ
                  </h4>
                  <h4 className="text-md font-semibold">
                    Tổng tiền mua: {totalBuyPrice} VNĐ
                  </h4>
                  <h4 className="text-md font-semibold">
                    Tổng tiền: {totalRentPrice + totalBuyPrice} VNĐ
                  </h4>
                  <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                    Thanh toán
                  </button>
                </div>
              </div>
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

export default HeaderForCustomer;
