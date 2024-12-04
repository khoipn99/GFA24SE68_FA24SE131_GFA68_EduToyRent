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
        const extractedUserId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const extractedUserName = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
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
        const response = await fetch(`https://localhost:44350/api/v1/Conversations/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
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
        .catch((error) => console.error("Error connecting to SignalR hub:", error));

      return () => {
        connect.stop();
      };
    }
  }, [userId, selectedConversationId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await connection.invoke("SendMessage", selectedConversationId, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar: Conversations */}
      <div className="chat-sidebar">
        <h3>Conversations</h3>
        <ul>
          {conversations.map((conversation) => (
            <li
              key={conversation.id}
              className={conversation.id === selectedConversationId ? "active" : ""}
              onClick={() => handleSelectConversation(conversation.id)}
            >
              <p>{conversation.lastMessage || "No messages yet"}</p>
              <span>{new Date(conversation.lastSentTime).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Messages Panel */}
      <div className="chat-messages">
        {selectedConversationId ? (
          <>
            <div className="message-list">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.senderId === userId ? "message-sent" : "message-received"}
                >
                  <p>{message.content}</p>
                  <p>"SenderId: "{message.senderId } - {new Date(message.sentTime).toLocaleString()}</p>
                  <span></span>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p>Select a conversation to view messages</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
