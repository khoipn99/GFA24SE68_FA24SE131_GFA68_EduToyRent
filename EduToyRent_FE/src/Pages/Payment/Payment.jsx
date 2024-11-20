import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import thư viện Cookies
import { Outlet } from "react-router-dom";
import Sidebar from "../../Component/Sidebar/Sidebar";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  return (
    <div>
      <header>
        <HeaderForCustomer />
      </header>
      <div className="flex flex-1 justify-center py-5 bg-white shadow-md">
        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 px-4 sm:px-6 lg:px-8"></div>
      </div>
      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default Payment;
