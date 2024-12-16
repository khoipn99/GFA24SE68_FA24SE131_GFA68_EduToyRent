import React, { useState, useEffect } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const Notifications = ({ show }) => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    console.log("Checking token to get userId...");
    const token = Cookies.get("userToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const extractedUserId =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
        console.log("User ID decoded from token:", extractedUserId);
        setUserId(extractedUserId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.error("Token not found in cookies.");
    }
  }, []);

  useEffect(() => {
    console.log("Notifications component - show:", show, "userId:", userId);

    if (!show || !userId) {
      console.log(
        "Conditions not met (show && userId), not fetching notifications."
      );
      return;
    }

    console.log("Fetching notifications for userId:", userId);

    axios
      .get(
        `https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/Notifications/User/${userId}`
      )
      .then((response) => {
        console.log("Old notifications fetched:", response.data);
        const allNotifications = response.data.map((n) => ({
          id: n.id,
          message: n.notify,
          date: new Date(n.sentTime),
          isRead: n.isRead,
        }));
        setNotifications(allNotifications);
      })
      .catch((error) => {
        console.error(
          "Error fetching notifications:",
          error.response?.data || error.message
        );
      });

    console.log("Connecting to SignalR hub...");

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(
        "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/notificationHub"
      )
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("Connected to NotificationHub!");
        connection.on("ReceiveNotification", (notification) => {
          console.log("New Notification Received:", notification);
          setNotifications((prevNotifications) => [
            {
              id: notification.id,
              title: "Thông báo",
              message: notification.notify,
              date: new Date(notification.sentTime),
              isRead: notification.isRead || false,
            },
            ...prevNotifications,
          ]);
        });
      })
      .catch((err) => console.error("Error connecting to SignalR:", err));

    return () => {
      console.log(
        "Cleaning up Notifications component, stopping connection..."
      );
      connection.stop();
    };
  }, [show, userId]);

  if (!show) {
    console.log("Notifications component is hidden (show=false).");
    return null;
  }

  console.log("Rendering notifications. Count:", notifications.length);

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
