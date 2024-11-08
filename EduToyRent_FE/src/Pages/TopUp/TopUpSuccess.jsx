import React, { useState } from "react";
import HeaderForCustomer from "../../Component/HeaderForCustomer/HeaderForCustomer";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import apiPayment from "../../service/ApiPayment";

const TopUpSuccess = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-200 p-9">
      <header>
        <HeaderForCustomer />
      </header>

      <main className="flex-grow flex justify-center items-center"></main>

      <footer>
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default TopUpSuccess;
