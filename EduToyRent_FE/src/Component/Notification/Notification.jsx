import React, { useState, useEffect } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Đơn hàng đã được xác nhận",
      message: "Đơn hàng #12345 đã được xác nhận và đang chuẩn bị giao.",
      date: new Date(),
      isRead: false,
    },
    {
      id: 2,
      title: "Đơn hàng đã giao thành công",
      message: "Đơn hàng #12344 đã được giao thành công. Cảm ơn bạn!",
      date: new Date(Date.now() - 10000000),
      isRead: true,
    },
    {
      id: 3,
      title: "Đơn hàng bị hủy",
      message:
        "Đơn hàng #12343 đã bị hủy do không xác nhận trong thời gian quy định.",
      date: new Date(Date.now() - 50000000),
      isRead: false,
    },
  ]);

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-4 bg-gray-100 text-gray-500 text-center rounded-lg shadow-md">
        Không có thông báo nào.
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Thông báo</h3>
      <ul className="space-y-3">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`p-3 rounded-lg transition-colors ${
              notification.isRead ? "bg-gray-200" : "bg-blue-50"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-gray-800">{notification.title}</p>
            </div>
            <p className="text-sm text-gray-600">{notification.message}</p>
            <span className="text-xs text-gray-400">
              {new Date(notification.date).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
