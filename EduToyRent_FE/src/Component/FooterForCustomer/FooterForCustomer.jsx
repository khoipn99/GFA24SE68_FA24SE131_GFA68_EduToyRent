import React from "react";
import { Link } from "react-router-dom";

const FooterForCustomer = () => {
  return (
    <footer className="bg-gray-100 py-8 mt-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Cột 1: Về công ty */}
          <div>
            <h4 className="font-bold text-lg mb-4">Về Chúng Tôi</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Giới thiệu về công ty
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 2: Hỗ trợ khách hàng */}
          <div>
            <h4 className="font-bold text-lg mb-4">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Trả hàng & Hoàn tiền
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link
                  to="/payment"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Hướng dẫn thanh toán
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Kết nối với chúng tôi */}
          <div>
            <h4 className="font-bold text-lg mb-4">Kết Nối Với Chúng Tôi</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://facebook.com"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  className="text-gray-600 hover:text-orange-600"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Tải ứng dụng */}
          <div>
            <h4 className="font-bold text-lg mb-4">Tải Ứng Dụng</h4>
            <div className="flex flex-col space-y-2">
              <img
                src="https://cdn.iconscout.com/icon/free/png-256/google-play-1865407-1582902.png"
                alt="Google Play"
                className="w-32"
              />
              <img
                src="https://cdn.iconscout.com/icon/free/png-256/apple-app-store-1865406-1582901.png"
                alt="App Store"
                className="w-32"
              />
            </div>
          </div>
        </div>

        {/* Dòng dưới cùng của footer */}
        <div className="border-t mt-8 pt-4">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Công Ty TNHH Đồ Chơi Trẻ Em. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterForCustomer;
