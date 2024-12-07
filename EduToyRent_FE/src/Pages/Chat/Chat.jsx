import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { HubConnectionBuilder } from "@microsoft/signalr";
import "./ChatPage.css";

const ChatPage = () => {
  const [userId, setUserId] = useState(null); // Decoded userId from token
  const [conversations, setConversations] = useState([]); // List of conversations
  const [selectedConversationId, setSelectedConversationId] = useState(null); // Selected conversation
  const [messages, setMessages] = useState([]); // Messages of the selected conversation
  const [newMessage, setNewMessage] = useState(""); // New message content
  const [connection, setConnection] = useState(null); // SignalR connection

  // Decode token and set userId on component mount
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

  // Fetch conversations by userId
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(
          `https://localhost:44350/api/v1/Conversations/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }
        const data = await response.json();
        setConversations(data);
        console.log("Conversations fetched:", data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  // Fetch messages for the selected conversation
  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(
        `https://localhost:44350/api/v1/Messages/conversation/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
      console.log("Messages fetched:", data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    fetchMessages(conversationId);
  };

  // Establish SignalR connection
  useEffect(() => {
    if (userId) {
      const connect = new HubConnectionBuilder()
        .withUrl("https://localhost:44350/chatHub", {
          accessTokenFactory: () => Cookies.get("userToken"),
        })
        .withAutomaticReconnect()
        .build();

      setConnection(connect);

      connect
        .start()
        .then(() => {
          console.log("Connected to SignalR hub");
          connect.on("ReceiveMessage", (message) => {
            if (message.conversationId === selectedConversationId) {
              setMessages((prevMessages) => [...prevMessages, message]);
            }
          });
        })
        .catch((error) =>
          console.error("Error connecting to SignalR hub:", error)
        );

      return () => {
        connect.stop();
      };
    }
  }, [userId, selectedConversationId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await connection.invoke(
        "SendMessage",
        selectedConversationId,
        newMessage
      );
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar: Conversations */}
      <div className="w-1/4 bg-white text-gray-900 p-4 overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Conversations</h3>
        <ul>
          {conversations.map((conversation) => (
            <li
              key={conversation.id}
              className={`p-4 mb-2 rounded-lg cursor-pointer ${
                conversation.id === selectedConversationId
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleSelectConversation(conversation.id)}
            >
              <p className="font-semibold truncate">
                {conversation.lastMessage || "No messages yet"}
              </p>
              <span className="text-sm text-gray-400">
                {new Date(conversation.lastSentTime).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Messages Panel */}
      <div className="flex-1 flex flex-col bg-white p-6 shadow-lg">
        {selectedConversationId ? (
          <>
            <div className="flex-1 overflow-y-auto mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-3 ${
                    message.senderId === userId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {/* Tin nhắn */}
                  <div
                    className={`p-4 rounded-lg max-w-sm ${
                      message.senderId === userId
                        ? "bg-blue-500 text-white" // Người gửi: bên phải, màu xanh
                        : "bg-gray-200 text-gray-900" // Người nhận: bên trái, màu xám
                    }`}
                  >
                    {/* Tên người gửi */}
                    <p className="font-bold text-sm mb-1">
                      {message.senderId === userId
                        ? "You"
                        : message.senderName || "Unknown"}
                    </p>
                    {/* Nội dung tin nhắn */}
                    <p>{message.content}</p>
                    {/* Thời gian gửi */}
                    <span className="text-xs text-gray-400 block mt-1">
                      {new Date(message.sentTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-200"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-500 text-lg">
              Select a conversation to view messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
