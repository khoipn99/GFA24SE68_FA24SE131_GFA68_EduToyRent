// CartPage.js
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Cookies from "js-cookie";
const CartPage = () => {
  const [cartVisible, setCartVisible] = useState(false);
  const [rentItems, setRentItems] = useState([]);
  const [buyItems, setBuyItems] = useState([]);
  const [totalRentPrice, setTotalRentPrice] = useState(0);
  const [totalBuyPrice, setTotalBuyPrice] = useState(0);
  const [orderNote, setOrderNote] = useState(""); // State để lưu ghi chú
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
    <div className="flex flex-col min-h-screen bg-gray-200 p-9">
      <header>
        <HeaderForCustomer />
      </header>
      <div className="flex flex-1  py-5 bg-white shadow-md">
        <div className="layout-content-container flex flex-row max-w-[100%] flex-1 px-4 sm:px-6 lg:px-8">
          {/* Phần giỏ hàng chiếm 9 phần */}
          <div className="flex-grow flex-1 pr-4 w-[80%]">
            {" "}
            {/* Thay đổi đây */}
            <div className="flex-grow overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Giỏ hàng của bạn</h2>
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
                            <p className="mr-4">Giá gốc: {item.price} VNĐ</p>
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
              <h3 className="font-bold mb-2 mt-4">Ghi chú đơn hàng</h3>
              <textarea
                className="border rounded p-2 w-full max-h-80"
                placeholder="Nhập ghi chú tại đây..."
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
            </div>
          </div>
          {/* Đường kẻ giữa */}
          <div className="w-px bg-gray-300 mx-4"></div>
          {/* Phần tổng tiền chiếm 1 phần */}
          <div className="flex justify-center items-center flex-shrink-0 w-[20%]">
            <div className="py-4 w-full">
              <h4 className="text-md font-semibold">
                Tổng tiền thuê: {totalRentPrice} VNĐ
              </h4>
              <h4 className="text-md font-semibold">
                Tổng tiền mua: {totalBuyPrice} VNĐ
              </h4>
              <h4 className="text-md font-semibold">
                Tổng tiền: {totalRentPrice + totalBuyPrice} VNĐ
              </h4>
              <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-red-600">
                Thanh toán
              </button>
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

export default CartPage;
