import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import axios from "../api/axios";
import socket, {
  disconnectSocket,
} from "../socket/socket";
import { getConversations } from "../services/chatService";
import { getMessages } from "../services/messageService";
import { getUsers } from "../services/userService";
import { useNavigate } from "react-router-dom";
import {
  setMessages,
  setSelectedConversation,
} from "../redux/chatSlice";


interface Conversation {
  conversationId: number;
  userId: number;
  name: string;
  email: string;
  avatar: string | null;
  lastMessage: string;
  is_online: number;
  unreadCount: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Props {
  setShowSidebar: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

function Sidebar({ setShowSidebar }: Props) {

  const dispatch = useDispatch();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const navigate = useNavigate();


  const logout = () => {
    disconnectSocket();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  useEffect(() => {

    socket?.on("user-online", (userId: number) => {
      setConversations(prev =>
        prev.map(chat =>
          chat.userId === userId
            ? { ...chat, is_online: 1 }
            : chat
        )
      );
    });

    socket?.on("user-offline", (userId: number) => {
      setConversations(prev =>
        prev.map(chat =>
          chat.userId === userId
            ? { ...chat, is_online: 0 }
            : chat
        )
      );
    });

    return () => {
      socket?.off("user-online");
      socket?.off("user-offline");
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("unread-message", (data) => {
      console.log("Unread received", data);

      setConversations((prev) =>
        prev.map((chat) =>
          chat.conversationId === data.conversationId
            ? {
              ...chat,
              unreadCount: (chat.unreadCount || 0) + 1,
            }
            : chat
        )
      );
    });

    return () => {
      socket.off("unread-message");
    };
  }, []);

  const loadData = async () => {
    await loadConversations();
    await loadUsers();
  };

  // Load Conversation List
  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const data = await getConversations(token);

      setConversations(data.conversations);
    } catch (err) {
      console.log(err);
    }
  };

  // Load Users
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const usersResponse = await getUsers(token);

      const conversationsResponse =
        await getConversations(token);

      const conversationUserIds =
        conversationsResponse.conversations.map(
          (item: any) => item.userId
        );

      const availableUsers =
        usersResponse.users.filter(
          (user: any) =>
            !conversationUserIds.includes(user.id)
        );

      setUsers(availableUsers);
    } catch (err) {
      console.log(err);
    }
  };

  // Select Conversation
  const selectConversation = async (
    conversation: Conversation
  ) => {

    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
    try {

      setConversations(prev =>
        prev.map(chat =>
          chat.conversationId === conversation.conversationId
            ?
            {
              ...chat,
              unreadCount: 0
            }
            : chat
        )
      );

      dispatch(setSelectedConversation(conversation));

      // Reset unread count
      setConversations((prev) =>
        prev.map((chat) =>
          chat.conversationId === conversation.conversationId
            ? {
              ...chat,
              unreadCount: 0,
            }
            : chat
        )
      );

      const token = localStorage.getItem("token");

      if (!token) return;

      const data = await getMessages(
        conversation.conversationId,
        token
      );

      dispatch(setMessages(data.messages));
    } catch (err) {
      console.log(err);
    }
  };


  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", (message: any) => {
      setConversations(prev => {
        const updated = prev.map(chat =>
          chat.conversationId === message.conversationId
            ? {
              ...chat,
              lastMessage:
                message.message_type === "text"
                  ? message.message
                  : message.message_type === "image"
                    ? "📷 Photo"
                    : "📄 Document",
            }
            : chat
        );

        updated.sort((a, b) =>
          a.conversationId === message.conversationId
            ? -1
            : b.conversationId === message.conversationId
              ? 1
              : 0
        );

        return [...updated];
      });
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);
  // Create Conversation
  const createConversation = async (
    receiverId: number
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      await axios.post(
        "/conversations",
        {
          receiverId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadData();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredConversations = conversations.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* Header */}

      <div
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Chats</h2>

        <button
          onClick={logout}
          style={{
            padding: "8px 12px",
            background: "#ff4d4f",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Search */}

      <div
        style={{
          padding: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        />
      </div>

      {/* New Chat */}

      <div
        style={{
          background: "#f5f5f5",
          padding: "12px",
          fontWeight: "bold",
        }}
      >
        New Chat
      </div>

      {filteredUsers.map((user) => (
        <div
          key={user.id}
          onClick={() =>
            createConversation(user.id)
          }
          style={{
            padding: "15px",
            cursor: "pointer",
            borderBottom: "1px solid #eee",
          }}
        >
          👤 {user.name}
        </div>
      ))}

      {/* Conversations */}

      <div
        style={{
          background: "#f5f5f5",
          padding: "12px",
          fontWeight: "bold",
          marginTop: "10px",
        }}
      >
        Conversations
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {conversations.length === 0 ? (
          <div
            style={{
              padding: "20px",
            }}
          >
            No Conversations
          </div>
        ) : (
          filteredConversations.map((chat) => (
            <div
              key={chat.conversationId}
              onClick={() =>
                selectConversation(chat)
              }
              style={{
                padding: "15px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: chat.is_online ? "green" : "gray",
                    }}
                  />

                  <h3>{chat.name}</h3>
                </div>

                {chat.unreadCount !== undefined &&
                  chat.unreadCount > 0 && (
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "#25D366",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {chat.unreadCount}
                    </div>
                  )}
              </div>

              <p
                style={{
                  color: "#777",
                  marginTop: "5px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {(() => {
                  if (!chat.lastMessage) return "No messages yet";

                  try {
                    const file = JSON.parse(chat.lastMessage);

                    if (file.url) {
                      if (
                        file.mimeType &&
                        file.mimeType.startsWith("image/")
                      ) {
                        return "📷 Photo";
                      }

                      return `📄 ${file.originalName}`;
                    }
                  } catch {
                    // Normal text message
                  }

                  return chat.lastMessage;
                })()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;