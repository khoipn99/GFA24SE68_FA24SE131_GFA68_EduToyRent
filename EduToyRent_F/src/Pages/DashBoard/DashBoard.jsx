import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Component/Sidebar/Sidebar";
const DashBoard = () => {
  return (
    <div className="flex">
      <div className="">
        <Sidebar />
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default DashBoard;
