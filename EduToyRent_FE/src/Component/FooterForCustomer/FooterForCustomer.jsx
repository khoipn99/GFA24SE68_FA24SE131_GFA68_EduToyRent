import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/logoETR.png";
const FooterForCustomer = () => {
  return (
    <footer className="bg-gray-100 py-8 mt-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Cột 1: Về công ty */}
          <div>
            <h4 className="font-bold text-lg mb-4">Về Chúng Tôi</h4>
            <ul className="space-y-2">
              <li>Giới thiệu về công ty</li>
              <li>Tuyển dụng</li>
              <li>
                <Link
                  to="/term"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Điều khoản
                </Link>
              </li>
              <li>Chính sách bảo mật</li>
            </ul>
          </div>

          {/* Cột 2: Hỗ trợ khách hàng */}
          <div>
            <h4 className="font-bold text-lg mb-4">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-2">
              <li>Trung tâm trợ giúp</li>
              <li>Trả hàng & Hoàn tiền</li>
              <li>Chính sách vận chuyển</li>
              <li>Hướng dẫn thanh toán</li>
            </ul>
          </div>

          {/* Cột 3: Kết nối với chúng tôi */}
          <div>
            <h4 className="font-bold text-lg mb-4">Kết Nối Với Chúng Tôi</h4>
            <ul className="space-y-2">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>Twitter</li>
              <li>YouTube</li>
            </ul>
          </div>

          {/* Cột 4: Tải ứng dụng */}
          <div>
            <h4 className="font-bold text-lg mb-4"></h4>
            <div className="flex flex-col space-y-2">
              <img src={Logo} alt="App Store" className="w-32" />
            </div>
          </div>
        </div>

        {/* Dòng dưới cùng của footer */}
        <div className="border-t mt-8 pt-4">
          <p className="text-center text-gray-500 text-sm">
            © 2024 EduToyRent.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterForCustomer;
