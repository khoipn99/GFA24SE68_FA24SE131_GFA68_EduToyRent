import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="text-red-700 flex flex-col">

      <Link to="/staff/dashboard">Dashboard</Link>
      <Link to="/staff/detail">Detail</Link>
      <Link to="/staff/detail/detail2">Siuu</Link>

    </div>
  );
};

export default Sidebar;
