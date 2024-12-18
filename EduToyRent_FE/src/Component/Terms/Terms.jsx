import { Link } from "react-router-dom";
import HeaderForCustomer from "../HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../FooterForCustomer/FooterForCustomer";
import React, { useState, useEffect } from "react";
const Term = () => {
  const [selectedTab, setSelectedTab] = useState("1");
  const renderContent = () => {
    switch (selectedTab) {
      case "1":
        return (
          <div>
            <div class="rules-container">
              <h1 class="text-xl font-semibold mb-4">
                Quy Tắc Về Quy Trình Thuê và Mua Đồ Chơi
              </h1>
              <ul class="list-none pl-6">
                <li>
                  Các món đồ chơi thông minh của người dùng chỉ có thể xuất hiện
                  trên trang chủ sau khi được nhân viên của hệ thống phê duyệt.
                </li>
                <li></li>
                <li>
                  Nếu người thuê làm hỏng hoặc làm mất đồ chơi trong thời gian
                  thuê, họ sẽ phải hoàn trả toàn bộ tiền đặt cọc cho món đồ chơi
                  đó cho người cho thuê (sẽ được nhân viên kiểm tra sau khi hết
                  thời gian thuê).
                </li>
                <li>
                  Sau khi thời gian thuê kết thúc, người dùng có thể chọn trả
                  lại, tiếp tục thuê hoặc mua món đồ chơi.
                </li>
              </ul>
            </div>
          </div>
        );
      case "2":
        return (
          <div>
            <div class="rules-container">
              <h1 class="text-xl font-semibold mb-4">Hướng dẫn thuê đồ chơi</h1>
              <ol class="list-decimal pl-6">
                <li>
                  <strong>Bước 1:</strong> Chọn sản phẩm
                  <p>
                    Quý khách có thể dễ dàng tìm và chọn sản phẩm mình muốn thuê
                    một cách nhanh chóng và thuận tiện tại mục{" "}
                    <a
                      href="https://edu-toy-rent.vercel.app"
                      target="_blank"
                      class="text-blue-500"
                    >
                      SẢN PHẨM CHO THUÊ
                    </a>{" "}
                    của website. Các cách tìm sản phẩm bao gồm:
                  </p>
                  <ul class="list-disc pl-6">
                    <li>Tìm theo độ tuổi của bé</li>
                    <li>Tìm theo chủ đề sản phẩm</li>
                    <li>Tìm theo giá cho thuê sản phẩm</li>
                  </ul>
                </li>

                <li>
                  <strong>Bước 2:</strong> Lựa chọn
                  <p>
                    Sau khi chọn được sản phẩm vừa ý, quý khách bấm vào đồ chơi
                    để xem đầy đủ thông tin sản phẩm như: tên đồ chơi, hình ảnh,
                    mã sản phẩm, thương hiệu, giá cho thuê theo tuần/tháng, nội
                    dung và độ tuổi phù hợp. Sau đó, chọn nút{" "}
                    <strong>THUÊ</strong> để thêm vào giỏ hàng nhanh chóng.
                  </p>
                  <p>
                    Quý khách có thể tiếp tục lựa chọn thêm sản phẩm hoặc chọn{" "}
                    <strong>XEM GIỎ HÀNG</strong> để kiểm tra lại giỏ hàng.
                    Trong giỏ hàng, quý khách có thể:
                  </p>
                  <ul class="list-disc pl-6">
                    <li>Điều chỉnh số lượng sản phẩm</li>
                    <li>Xóa sản phẩm</li>
                  </ul>
                  <p>
                    Sau đó, chọn <strong>THANH TOÁN</strong>. Quý khách nhập Mã
                    giảm giá (nếu có) và điền đầy đủ thông tin đặt hàng rồi chọn
                    phương thức thanh toán.
                  </p>
                </li>

                <li>
                  <strong>Bước 3:</strong> Thanh toán
                  <p>
                    Thanh toán thông qua ví nền tảng EduToyRent. Quý khách vui
                    lòng nạp trước vào ví số tiền cần thanh toán.
                  </p>
                </li>

                <li>
                  <strong>Bước 4:</strong> Nhận hàng
                  <p>
                    Người cho thuê sẽ gửi hàng đến quý khách thông qua thông tin
                    mà quý khách đã cung cấp lúc thanh toán. Sau khi nhận được
                    hàng, quý khách vui lòng vào lại trang web, vào{" "}
                    <strong>THÔNG TIN NGƯỜI DÙNG</strong>{" "}
                    <strong>ĐƠN HÀNG THUÊ CỦA TÔI</strong>, nhấn vào nút{" "}
                    <strong>ĐÃ NHẬN HÀNG</strong> để xác nhận.
                  </p>
                </li>

                <li>
                  <strong>Bước 5:</strong> Trả hàng và nhận lại cọc
                  <p>
                    Shop sẽ có nhân viên liên hệ và đến tận nhà nhận lại sản
                    phẩm theo thời gian khách hàng đã thuê để kiểm tra tình
                    trạng đồ chơi.
                  </p>
                  <p>
                    Sau khi nhân viên kiểm tra tình trạng đồ chơi còn nguyên
                    vẹn, quý khách sẽ nhận lại tiền cọc vào ví nền tảng. Quý
                    khách có thể rút tiền về tài khoản của mình bất cứ lúc nào,
                    vui lòng cung cấp chính xác <strong>TÊN NGÂN HÀNG</strong>{" "}
                    và <strong>SỐ TÀI KHOẢN</strong>. Nếu có sai sót về thông
                    tin người dùng, chúng tôi sẽ{" "}
                    <strong>KHÔNG chịu trách nhiệm</strong>.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        );
      case "3":
        return (
          <div class="rules-container">
            <h2 class="text-lg font-semibold mb-2">Hình thức đặt cọc</h2>
            <p>
              Nhằm mong muốn quý khách hàng có ý thức giữ gìn sản phẩm đã thuê
              và đảm bảo sản phẩm được hoàn trả đúng thời gian thông báo,
              EduToyRent quy định mức đặt cọc như sau:
            </p>
            <p>
              <strong>
                Đặt cọc tiền thuê tương đương 100% giá trị gốc của sản phẩm.
              </strong>
            </p>
            <p>
              Nếu thời gian thuê thực tế của quý khách dài hơn thời gian trong
              đơn hàng, shop sẽ tính lại số tiền thuê thực tế và hoàn trả phần
              tiền cọc còn thừa cho quý khách tại thời điểm nhận lại sản phẩm.
            </p>
          </div>
        );
      case "4":
        return (
          <div class="rules-container">
            <h3>
              Để đảm bảo quá trình hợp tác diễn ra thuận lợi, chúng tôi kính
              mong quý khách vui lòng cung cấp các giấy tờ sau để trở thành nhà
              cung cấp:
            </h3>
            <ul>
              <li>
                <strong>Giấy chứng nhận đăng ký doanh nghiệp:</strong> Giấy tờ
                này chứng minh doanh nghiệp của quý khách đã được thành lập hợp
                pháp theo quy định của pháp luật.
              </li>
              <li>
                <strong>Giấy phép kinh doanh:</strong> Giấy phép này cho phép
                doanh nghiệp hoạt động trong lĩnh vực kinh doanh đồ chơi.
              </li>
              <li>
                <strong>Mã số thuế:</strong> Giấy tờ này chứng minh doanh nghiệp
                của quý khách đã đăng ký nộp thuế.
              </li>
              <li>
                <strong>Giấy phép đăng ký sản phẩm (nếu có):</strong> Nếu doanh
                nghiệp của quý khách tự sản xuất đồ chơi, chúng tôi cần giấy
                phép này để đảm bảo sản phẩm đáp ứng các tiêu chuẩn chất lượng
                và an toàn.
              </li>
            </ul>
            <p>
              Gửi về mail: <strong>Edutoyrent@gmail.com</strong> hoặc về Zalo
              SĐT: <strong>0969760721 (Khôi Nhật)</strong> để được cung cấp tài
              khoản.
            </p>
          </div>
        );
      case "5":
        return (
          <div class="rules-container">
            <h2 class="text-lg font-semibold mb-4 text-center text-blue-600">
              Điều khoản của người cho thuê
            </h2>
            <p class="mb-2">
              Lúc tạo sản phẩm cho thuê mới sẽ nhập tất cả thông tin của đồ chơi
              và giá trị gốc của đồ chơi.
            </p>
            <p class="mb-2">
              Hệ thống sẽ tự động hiển thị giá thuê với 3 mức giá:{" "}
              <strong>15%</strong>, <strong>25%</strong>, <strong>30%</strong>
              (1 tuần, 2 tuần, 1 tháng) giá trị gốc của sản phẩm làm tiền thuê.
            </p>
            <p class="mb-2">
              Khi có đơn thuê thì phí ship sẽ do{" "}
              <strong>2 bên tự thỏa thuận</strong>.
            </p>
            <p class="mb-2">
              Trong trường hợp trả hàng, bên người đi thuê và người cho thuê sẽ
              chịu mỗi bên <strong>30k tiền ship</strong>.
            </p>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header
        className="bg-white shadow-md p-4"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "white",
        }}
      >
        <HeaderForCustomer />
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-1/5 bg-white p-6 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <button
              onClick={() => setSelectedTab("1")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "1" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🏢</span> Quy Tắc Về Quy Trình
              Thuê và Mua Đồ Chơi
            </button>
            <button
              onClick={() => setSelectedTab("2")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "2" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🏢</span> Hướng dẫn thuê đồ chơi
            </button>
            <button
              onClick={() => setSelectedTab("3")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "3" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🏢</span> Hình thức đặt cọc
            </button>
            <button
              onClick={() => setSelectedTab("4")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "4" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🏢</span> Điều khoản trở thành
              nhà cung cấp
            </button>
            <button
              onClick={() => setSelectedTab("5")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "5" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🏢</span> Điều khoản của người
              cho thuê
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow w-4/5 bg-gray-50 p-6">
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <div className=" p-4 border-l">{renderContent()}</div>
          </div>
        </main>
      </div>
      <footer className="bg-white shadow-md p-4">
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default Term;
