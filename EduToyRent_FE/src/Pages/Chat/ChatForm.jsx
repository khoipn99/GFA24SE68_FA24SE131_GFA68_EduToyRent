import React, { useState } from "react";
import { Link } from "react-router-dom";
import ChatPage from "../Chat/Chat";

const ChatForm = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => {
    setIsChatOpen(true); // Mở form chat
  };

  const closeChat = () => {
    setIsChatOpen(false); // Đóng form chat
  };

  return (
    <>
      {/* Nút chat */}
      {!isChatOpen && (
        <div
          to="#"
          onClick={openChat} // Mở form chat khi nhấn
          className="fixed bottom-10 right-10 p-4 bg-[#00aaff] text-white rounded-full shadow-2xl hover:bg-[#0099cc] transition duration-300 flex items-center justify-center cursor-pointer"
          style={{
            zIndex: 500, // Đảm bảo nút Chat nằm trên tất cả các phần tử khác
            width: "80px", // Kích thước nút
            height: "80px", // Kích thước nút
          }}
        >
          <span className="icon-class text-3xl">💬</span>{" "}
          {/* Biểu tượng chat */}
        </div>
      )}

      {/* Form chat */}
      {isChatOpen && (
        <div
          className="fixed bottom-0 right-10 bg-white shadow-lg rounded-lg flex flex-col"
          style={{ zIndex: 600, width: "500px", height: "500px" }}
        >
          <ChatPage />
          {/* Nút đóng */}
          <button
            onClick={closeChat} // Đóng form chat khi nhấn
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
          >
            ✖
          </button>
        </div>
      )}
    </>
  );
};

export default ChatForm;
