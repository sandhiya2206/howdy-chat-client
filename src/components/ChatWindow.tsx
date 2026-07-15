import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MessageInput from "./MessageInput";
import socket from "../socket/socket";
import {
  FiCopy,
  FiCornerUpLeft,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiSmile,
  FiChevronDown,
} from "react-icons/fi";
import {
  deleteMessage as deleteReduxMessage,
  setConversations
} from "../redux/chatSlice";
import {
  deleteMessage as deleteApiMessage
} from "../services/messageService";
import {
  forwardMessage as forwardApi,
} from "../services/messageService";
import {
  editMessage,
  getMessages,
  sendMessage,
} from "../services/messageService";
import EmojiPicker from "emoji-picker-react";
import {
  addMessage,
  setMessages,
  updateMessage,
  addReaction
} from "../redux/chatSlice";
import { BsThreeDotsVertical } from "react-icons/bs";
import { getConversations } from "../services/chatService";

interface Props {
  setShowSidebar: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

function ChatWindow({
  setShowSidebar,
}: Props) {
  const dispatch = useDispatch();

  const selectedConversation = useSelector(
    (state: any) => state.chat.selectedConversation
  );

  const messages = useSelector(
    (state: any) => state.chat.messages
  );

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const [deliveredMessages, setDeliveredMessages] = useState<number[]>([]);
  const [seenMessages, setSeenMessages] = useState<number[]>([]);

  const [messageSearch, setMessageSearch] = useState("");
  const [replyMessage, setReplyMessage] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  );
  const [showForward, setShowForward] = useState(false);

  const [forwardMessageData, setForwardMessageData] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);

  const [editText, setEditText] = useState("");
  const [showReaction, setShowReaction] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);

  const [menuMessage, setMenuMessage] = useState<number | null>(null);
  const startEdit = (msg: any) => {

    setEditingMessage(msg);

    setEditText(msg.message);

  }

  const deleteMessage = async (
    id: number
  ) => {

    const token =
      localStorage.getItem("token");

    if (!token) return;

    await deleteApiMessage(
      id,
      token
    );

    dispatch(
      deleteReduxMessage({
        id
      })
    );

  }

  const sendForward = async (
    conversationId: number
  ) => {

    const token = localStorage.getItem("token");

    if (!token || !forwardMessageData) return;

    await forwardApi(
      forwardMessageData.id,
      conversationId,
      token
    );

    setShowForward(false);

    setForwardMessageData(null);

  };

  const handleReaction = (
    msg: any,
    emoji: any
  ) => {

    socket.emit("add-reaction", {

      messageId: msg.id,

      conversationId: selectedConversation.conversationId,

      userId: currentUser.id,

      reaction: emoji.emoji

    });

    dispatch({
      type: "chat/addReaction",
      payload: {
        id: msg.id,
        reaction: emoji.emoji,
        userId: currentUser.id
      }
    });

    setShowReaction(null);

  };

  const forwardMessage = (msg: any) => {
    setForwardMessageData(msg);
    setShowForward(true);
  };

  const conversations = useSelector(
    (state: any) => state.chat.conversations
  );

  console.log("Conversations:", conversations);

  const openReaction = (msg: any) => {
    console.log("Reaction", msg);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Join selected room
  useEffect(() => {
    if (!selectedConversation) return;

    socket?.emit(
      "join-room",
      selectedConversation.conversationId
    );
    setTyping(false);
    setTypingUser("");

    return () => {
      socket?.emit(
        "leave-room",
        selectedConversation.conversationId
      );
    };

  }, [selectedConversation]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", (message) => {
      console.log("Socket received:", message);
      dispatch(addMessage(message));
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  useEffect(() => {
  loadConversations();
}, []);

  const loadConversations = async () => {
  const token = localStorage.getItem("token");

  if (!token) return;

  const data = await getConversations(token);

  dispatch(setConversations(data.conversations));
};

  useEffect(() => {
    if (!selectedConversation) return;

    socket?.emit(
      "join-room",
      selectedConversation.conversationId
    );

    // loadMessages();

    // Reset pagination for the new conversation
    setPage(1);
    setHasMore(true);

    loadMessages(1);


    return () => {
      socket?.emit(
        "leave-room",
        selectedConversation.conversationId
      );
    };
  }, [selectedConversation]);

  useEffect(() => {
    setMessageSearch("");
  }, [selectedConversation?.conversationId]);

  // Listen for socket messages
  useEffect(() => {

    if (!socket) return;

    socket.on("receive-message", (message) => {
      dispatch(addMessage(message));
    });
    socket.on("typing", (data) => {
      console.log("Received typing:", data);

      if (
        data.conversationId === selectedConversation?.conversationId &&
        data.userId !== currentUser.id
      ) {
        setTyping(true);
        setTypingUser(data.name);
      }
    });

    socket.on("stop-typing", (data) => {
      if (
        data.conversationId === selectedConversation?.conversationId
      ) {
        setTyping(false);
        setTypingUser("");
      }
    });

    socket.on("message-delivered", (data) => {
      setDeliveredMessages((prev) => [...prev, data.messageId]);
    });

    socket.on("message-seen", (data) => {
      setSeenMessages((prev) => [...prev, data.messageId]);
    });

    socket.on("reaction-added", (data) => {
      dispatch(
        addReaction({
          id: data.messageId,
          userId: data.userId,
          reaction: data.reaction,
        })
      );
    });



    return () => {
      socket.off("receive-message");
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("message-delivered");
      socket.off("message-seen");
      socket.off("reaction-added");
    };
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    messages.forEach((msg: any) => {
      if (msg.senderId !== currentUser.id) {
        socket?.emit("message-read", {
          messageId: msg.id,
          conversationId: selectedConversation.conversationId,
          userId: currentUser.id,
        });
      }
    });
  }, [messages]);



  const loadMessages = async (
    pageNumber = 1,
    append = false
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token || !selectedConversation) return;

      const data = await getMessages(
        selectedConversation.conversationId,
        token,
        pageNumber
      );

      if (data.messages.length < 20) {
        setHasMore(false);
      }

      if (append) {
        dispatch(
          setMessages([
            ...data.messages,
            ...messages,
          ])
        );
      } else {
        dispatch(setMessages(data.messages));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const saveEdit = async () => {

    if (!editingMessage) return;

    const token = localStorage.getItem("token");

    if (!token) return;

    await editMessage(
      editingMessage.id,
      editText,
      token
    );

    dispatch(
      updateMessage({
        id: editingMessage.id,
        message: editText
      })
    );

    setEditingMessage(null);

  }

  const handleScroll = async (
    e: React.UIEvent<HTMLDivElement>
  ) => {
    const container = e.currentTarget;

    if (
      container.scrollTop <= 10 &&
      hasMore &&
      !loadingMore
    ) {
      setLoadingMore(true);

      const oldHeight = container.scrollHeight;

      const nextPage = page + 1;

      await loadMessages(nextPage, true);

      setPage(nextPage);

      requestAnimationFrame(() => {
        if (messageContainerRef.current) {
          const newHeight =
            messageContainerRef.current.scrollHeight;

          messageContainerRef.current.scrollTop =
            newHeight - oldHeight;
        }

        setLoadingMore(false);
      });
    }
  };

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      alert("Message copied");
    } catch (err) {
      console.log(err);
    }
  };
  const handleSend = (
    message: string,
    messageType: "text" | "image" | "file" = "text"
  ) => {
    console.log("handleSend called");
    socket.emit("send-message", {
      conversationId: selectedConversation.conversationId,
      senderId: currentUser.id,
      message,
      messageType,
      replyTo: replyMessage?.id || null,
    });

    setReplyMessage(null);
  };
  if (!selectedConversation) {
    return (
      <div
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          fontSize: "24px",
        }}
      >
        Select a conversation
      </div>
    );
  }

  const filteredMessages = messages.filter((msg: any) =>
    msg.message
      ?.toLowerCase()
      .includes(messageSearch.toLowerCase())
  );

  return (
    <div

      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "70px",
          display: "flex",
          alignItems: "center",
          padding: isMobile ? "10px" : "20px",
          borderBottom: "1px solid #ddd",
          fontWeight: "bold",
          fontSize: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          {isMobile && (
            <button
              onClick={() => setShowSidebar(true)}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "22px",
              }}
            >
              ←
            </button>
          )}

          <span>{selectedConversation.name}</span>

        </div>
      </div>
      {typing && (
        <div
          style={{
            padding: isMobile ? "8px 10px" : "8px 20px",
            color: "green",
            fontStyle: "italic",
            borderBottom: "1px solid #ddd",
          }}
        >
          {typingUser} is typing...
        </div>
      )}

      <div
        style={{
          padding: "10px",
          borderBottom: "1px solid #ddd",
          background: "#fff",
        }}
      >
        <input
          type="text"
          placeholder="Search messages..."
          value={messageSearch}
          onChange={(e) => setMessageSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        />
      </div>



      {/* Messages */}
      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobile ? "10px" : "20px",
          background: "#f5f5f5",
        }}
      >
        {loadingMore && (
          <div
            style={{
              textAlign: "center",
              padding: 10,
              color: "#777",
            }}
          >
            Loading older messages...
          </div>
        )}
        {filteredMessages.map((msg: any) => {
          const isMine = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMessage(msg.id)}
              onMouseLeave={() => setHoveredMessage(null)}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                marginBottom: 12,
                alignItems: "flex-start",
              }}
            >
              {/* Left side menu (received messages) */}
              {!isMine && hoveredMessage === msg.id && (
                <button
                  onClick={() =>
                    setMenuMessage(menuMessage === msg.id ? null : msg.id)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    marginRight: 6,
                    marginTop: 8,
                    color: "#667781",
                  }}
                >
                  <BsThreeDotsVertical size={18} />
                </button>
              )}

              {/* Message Bubble */}
              <div
                style={{
                  background: isMine ? "#DCF8C6" : "#fff",
                  padding: "12px",
                  borderRadius: "10px",
                  maxWidth: isMobile ? "90%" : "65%",
                  position: "relative",
                  boxShadow: "0 1px 3px rgba(0,0,0,.15)",
                }}
              >
                {/* Popup Menu */}
                {menuMessage === msg.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: isMine ? "105%" : "-185px",
                      width: 180,
                      background: "#fff",
                      borderRadius: 8,
                      boxShadow: "0 5px 20px rgba(0,0,0,.25)",
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="menu-item"
                      onClick={() => {
                        copyMessage(msg.message);
                        setMenuMessage(null);
                      }}
                    >
                      📋 Copy
                    </div>

                    <div
                      className="menu-item"
                      onClick={() => {
                        setReplyMessage(msg);
                        setMenuMessage(null);
                      }}
                    >
                      ↩ Reply
                    </div>

                    {isMine && (
                      <div
                        className="menu-item"
                        onClick={() => {
                          startEdit(msg);
                          setMenuMessage(null);
                        }}
                      >
                        ✏ Edit
                      </div>
                    )}

                    {isMine && (
                      <div
                        className="menu-item"
                        onClick={() => {
                          deleteMessage(msg.id);
                          setMenuMessage(null);

                        }}
                      >
                        🗑 Delete
                      </div>
                    )}

                    <div
                      className="menu-item"
                      onClick={() => {
                        forwardMessage(msg);
                        setMenuMessage(null);
                      }}
                    >
                      ➜ Forward
                    </div>

                    <div
                      className="menu-item"
                      onClick={() => {
                        setShowReaction(msg.id);
                        setMenuMessage(null);
                      }}
                    >
                      😀 React
                    </div>
                  </div>
                )}

                {!isMine && (
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: 5,
                    }}
                  >
                    {msg.name}
                  </div>
                )}

                {msg.is_deleted ? (
                  <div
                    style={{
                      fontStyle: "italic",
                      color: "#777",
                    }}
                  >
                    🚫 This message was deleted
                  </div>
                ) : msg.message_type === "text" ? (
                  <div>{msg.message}</div>
                ) : msg.message_type === "image" ? (
                  <img
                    src={`http://localhost:5000${msg.message}`}
                    alt="chat"
                    style={{
                      maxWidth: 250,
                      borderRadius: 10,
                    }}
                  />
                ) : msg.message_type === "file" ? (
                  (() => {
                    try {
                      const file = JSON.parse(msg.message);

                      return (
                        <a
                          href={`http://localhost:5000${file.url}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          📄 {file.originalName}
                        </a>
                      );
                    } catch {
                      return (
                        <div
                          style={{
                            fontStyle: "italic",
                            color: "#777",
                          }}
                        >
                          🚫 This message was deleted
                        </div>
                      );
                    }
                  })()
                ) : null}

                {showReaction === msg.id && (

                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      zIndex: 1000
                    }}
                  >

                    <EmojiPicker
                      onEmojiClick={(emoji) =>
                        handleReaction(msg, emoji)
                      }
                    />

                  </div>

                )}
                {msg.reactions && (

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 5,
                      flexWrap: "wrap"
                    }}
                  >

                    {
                      msg.reactions
                        .split(",")
                        .map((r: string, index: number) => {

                          const emoji = r.split(":")[1];

                          return (

                            <div
                              key={index}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 20,
                                background: "#eee",
                                fontSize: 18
                              }}
                            >
                              {emoji}
                            </div>

                          );

                        })
                    }

                  </div>

                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 5,
                    marginTop: 8,
                    fontSize: 11,
                    color: "#777",
                  }}
                >
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>

                  {isMine && (
                    <span>
                      {seenMessages.includes(msg.id)
                        ? "✓✓"
                        : deliveredMessages.includes(msg.id)
                          ? "✓✓"
                          : "✓"}
                    </span>
                  )}
                </div>
              </div>

              {/* Right side menu (your messages) */}
              {isMine && hoveredMessage === msg.id && (
                <button
                  onClick={() =>
                    setMenuMessage(menuMessage === msg.id ? null : msg.id)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    marginLeft: 6,
                    marginTop: 8,
                    color: "#667781",
                  }}
                >
                  <BsThreeDotsVertical size={18} />
                </button>
              )}
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {editingMessage && (

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >

          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 10,
              width: 400
            }}
          >

            <h3>Edit Message</h3>

            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{
                width: "100%",
                padding: 10
              }}
            />

            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10
              }}
            >

              <button
                onClick={() => setEditingMessage(null)}
              >
                Cancel
              </button>

              <button
                onClick={saveEdit}
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

      {showForward && (

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >

          <div
            style={{
              width: 400,
              background: "#fff",
              borderRadius: 10,
              padding: 20
            }}
          >

            <h3>Forward Message</h3>

            <div
              style={{
                maxHeight: 400,
                overflowY: "auto"
              }}
            >

              {conversations.map((chat: any) => (

                <div
                  key={chat.conversationId}
                  onClick={() =>
                    sendForward(chat.conversationId)
                  }
                  style={{
                    padding: 15,
                    cursor: "pointer",
                    borderBottom: "1px solid #eee"
                  }}
                >

                  <div
                    style={{
                      fontWeight: "bold"
                    }}
                  >
                    {chat.name}
                  </div>

                </div>

              ))}

            </div>

            <button
              onClick={() => setShowForward(false)}
              style={{
                marginTop: 15
              }}
            >
              Cancel
            </button>

          </div>

        </div>

      )}

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        conversationId={selectedConversation.conversationId}
        userId={currentUser.id}
        replyMessage={replyMessage}
        clearReply={() => setReplyMessage(null)}
      />
    </div>
  );
}

export default ChatWindow;