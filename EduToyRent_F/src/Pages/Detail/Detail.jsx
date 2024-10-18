import React from "react";
import { Outlet } from "react-router";
import { Link } from "react-router-dom";

const Detail = () => {
  return (
    <div className="flex gap-2">
      <Link to="detail2">Detail</Link>

      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Detail;
