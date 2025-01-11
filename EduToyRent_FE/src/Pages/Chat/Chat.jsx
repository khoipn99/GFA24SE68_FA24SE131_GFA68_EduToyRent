import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { HubConnectionBuilder } from "@microsoft/signalr";
import "./ChatPage.css";
import apiConversations from "../../service/ApiConversations";

const ChatPage = () => {
  const [userId, setUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const [connectionStarted, setConnectionStarted] = useState(false);

  const lastMessageRef = useRef(null);

  useEffect(() => {
    const token = Cookies.get("userToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const extractedUserId =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
        const extractedUserName =
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
        setUserId(extractedUserId);
        console.log("Decoded user ID:", extractedUserId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.error("Token not found in cookies.");
    }
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(
          `https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/Conversations/user/${userId}`,
          //`https://localhost:44350/api/v1/Conversations/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        setConversations(data);
      } catch (error) {}
    };
    if (userId) fetchConversations();
  }, [userId]);

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(
        `https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/Messages/conversation/${conversationId}`,
        //`https://localhost:44350/api/v1/Messages/conversation/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      if (!response.ok) throw new Error();
      const data = await response.json();

      setMessages(data);
    } catch (error) {}
  };

  const markAllMessagesAsRead = async (conversationId) => {
    try {
      await fetch(
        `https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/v1/Messages/markread/${conversationId}`,
        //`https://localhost:44350/api/v1/Messages/markread/${conversationId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) {}
  };

  const handleSelectConversation = async (conversationId) => {
    setSelectedConversationId(conversationId);
    await fetchMessages(conversationId);
    await markAllMessagesAsRead(conversationId);
  };

  useEffect(() => {
    if (userId) {
      const connect = new HubConnectionBuilder()
        .withUrl(
          "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/chatHub",
          // "https://localhost:44350/chatHub",
          {
            accessTokenFactory: () => Cookies.get("userToken"),
          }
        )
        .withAutomaticReconnect()
        .build();

      setConnection(connect);

      connect
        .start()
        .then(() => {
          setConnectionStarted(true);
          connect.on("ReceiveMessage", (message) => {
            if (message.conversationId === selectedConversationId) {
              setMessages((prev) =>
                [...prev, message].map((m) => ({ ...m, isRead: true }))
              );
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === message.conversationId
                    ? {
                        ...c,
                        lastMessage: message.content,
                        lastSentTime: message.sentTime,
                        unreadCount: 0,
                      }
                    : c
                )
              );
            } else {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === message.conversationId
                    ? {
                        ...c,
                        lastMessage: message.content,
                        lastSentTime: message.sentTime,
                        unreadCount: (c.unreadCount || 0) + 1,
                      }
                    : c
                )
              );
            }
          });
        })
        .catch(() => {});

      return () => {
        connect.stop();
      };
    }
  }, [userId, selectedConversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!connectionStarted) return;
    try {
      await connection.invoke(
        "SendMessage",
        selectedConversationId,
        newMessage
      );
      setNewMessage("");
    } catch (error) {}
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      requestAnimationFrame(() => {
        lastMessageRef.current.scrollIntoView({ behavior: "auto" });
      });
    }
  }, [messages]);

  return (
    <div className="flex h-full bg-gray-100 font-sans">
      {/* Sidebar: Danh sách các cuộc trò chuyện */}
      <div className="w-2/6 bg-gray-800 text-white p-6 overflow-y-auto">
        <h3 className="text-xl font-normal mb-4 text-gray-200">Danh sách</h3>
        <ul>
          {conversations.map((conversation) => {
            const participantNames = conversation.participantResponse
              ? conversation.participantResponse.map((p) => p.name).join(", ")
              : "No participants";

            return (
              <li
                key={conversation.id}
                className={`relative p-2 mb-2 rounded-lg cursor-pointer transition-colors ${
                  conversation.id === selectedConversationId
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                {conversation.participantResponse &&
                  conversation.participantResponse.length > 0 && (
                    <div className="flex items-center mb-1 flex-wrap">
                      {conversation.participantResponse.map((participant) => {
                        const avatarSrc =
                          participant.avatarUrl &&
                          participant.avatarUrl.trim() !== ""
                            ? participant.avatarUrl
                            : "https://t4.ftcdn.net/jpg/03/59/58/91/360_F_359589186_JDLl8dIWoBNf1iqEkHxhUeeOulx0wOC5.jpg";
                        return (
                          <img
                            key={participant.userId}
                            src={avatarSrc}
                            alt={participant.name}
                            className="w-8 h-8 rounded-full mr-2 object-cover"
                          />
                        );
                      })}
                    </div>
                  )}

                {conversation.unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}

                <p className="font-semibold text-sm truncate text-white mb-1">
                  {participantNames}
                </p>

                <p className="font-semibold text-sm truncate text-base">
                  {conversation.lastMessage || "No messages yet"}
                </p>

                <span className="text-xs text-gray-300">
                  {conversation.lastSentTime
                    ? new Date(conversation.lastSentTime).toLocaleString()
                    : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Nội dung cuộc trò chuyện */}
      <div className="flex-1 flex flex-col bg-white p-6 shadow-lg">
        {selectedConversationId ? (
          <>
            <div className="flex-1 overflow-y-auto mb-4">
              {messages.map((message, index) => {
                const isLast = index === messages.length - 1;

                return (
                  <div
                    key={message.id}
                    ref={isLast ? lastMessageRef : null}
                    className={`flex mb-3 ${
                      message.senderId == userId
                        ? "justify-end"
                        : "justify-start"
                    }`} // Tin nhắn nằm bên phải nếu là của userId, bên trái nếu không
                  >
                    <div
                      className={`p-4 rounded-lg ${
                        message.senderId == userId
                          ? "bg-teal-500" // Màu nền xanh và chữ trắng cho tin nhắn của bạn
                          : "bg-gray-200 text-gray-900" // Màu nền xám và chữ đen cho tin nhắn của người khác
                      } break-words max-w-xs`} // Giới hạn chiều rộng của tin nhắn
                    >
                      <p className="font-bold text-sm mb-1">
                        {message.senderId == userId
                          ? ""
                          : message.senderName || "Unknown"}
                      </p>
                      <p className="text-base whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <span className="text-xs block mt-1 ">
                        {new Date(message.sentTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Thay input thành textarea để gõ tin dài */}
            <div className="flex items-center gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base resize-none"
                rows={3}
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-200 text-base font-semibold"
              >
                Gửi
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-500 text-lg">
              Bạn chưa chọn cuộc trò chuyện nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
