import { useRef, useState, useEffect } from "react";
import socket from "../socket/socket";
import { uploadImage, uploadFile } from "../services/uploadService";
import EmojiPicker from "emoji-picker-react";


interface Props {
  onSend: (
    message: string,
    messageType?: "text" | "image" | "file"
  ) => void;

  conversationId: number;
  userId: number;

  replyMessage: any;
  clearReply: () => void;
}
function MessageInput({
  onSend,
  conversationId,
  userId,
  replyMessage,
  clearReply,
}: Props) {

  const [message, setMessage] = useState("");

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [messageType, setMessageType] = useState<
    "text" | "image" | "file"
  >("text");
  const [showEmoji, setShowEmoji] = useState(false);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessage("");
    setSelectedImage("");
    setSelectedFile(null);
    setMessageType("text");
  }, [conversationId]);

  const handleImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const data = await uploadImage(file, token);

      setSelectedImage(data.imageUrl);

      setMessageType("image");

    } catch (err) {
      console.log(err);
    }
  };

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMessage(e.target.value);

    socket.emit("typing", {
      conversationId,
      userId,
    });

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    typingTimer.current = setTimeout(() => {
      socket.emit("stop-typing", {
        conversationId,
        userId,
      });
    }, 1000);
  };

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const uploaded = await uploadFile(file, token);

      setSelectedFile(uploaded);

      if (file.type.startsWith("image/")) {
        setMessageType("image");
      } else {
        setMessageType("file");
      }

      // Clear input so the same file can be selected again later
      e.target.value = "";
    } catch (err) {
      console.log(err);
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
  };



  const handleSend = () => {

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    socket.emit("stop-typing", {
      conversationId,
      userId,
    });

    if (messageType === "file") {

      onSend(
        JSON.stringify(selectedFile),
        "file"
      );

      setSelectedFile(null);

      setMessageType("text");

      return;

    }

    if (messageType === "image") {

      onSend(
        selectedImage,
        "image"
      );

      setSelectedImage("");

      setMessageType("text");

      return;

    }

    if (!message.trim()) return;

    onSend(message, "text");

    setMessage("");
    setSelectedImage("");
    setSelectedFile(null);
    setMessageType("text");

  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        borderTop: "1px solid #ddd",
        background: "#fff",
      }}
    >

      {showEmoji && (
        <div
          style={{
            position: "absolute",
            bottom: "70px",
            left: "20px",
            zIndex: 100,
          }}
        >
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      {replyMessage && (
        <div
          style={{
            padding: "10px",
            background: "#f3f3f3",
            borderTop: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Replying to</strong>
            <br />
            {replyMessage.message_type === "text"
              ? replyMessage.message
              : replyMessage.message_type === "image"
                ? "📷 Image"
                : "📄 File"}
          </div>

          <button
            onClick={clearReply}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>
      )}
      {/* Hidden File Input */}
      <input
        ref={fileRef}
        type="file"
        hidden
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
        onChange={handleFile}
      />

      <button
        onClick={() => setShowEmoji(!showEmoji)}
        style={{
          fontSize: "22px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        😊
      </button>

      {/* Attachment Button */}
      <button
        onClick={() => fileRef.current?.click()}
        style={{
          fontSize: "22px",
          cursor: "pointer",
          border: "none",
          background: "transparent",
        }}
      >
        📎
      </button>

      {selectedImage && (
        <div
          style={{
            padding: "10px",
          }}
        >
          <img
            src={`http://localhost:5000${selectedImage}`}
            style={{
              width: 120,
              borderRadius: 10,
            }}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFile}
      />
      {selectedFile && (

        <div
          style={{
            padding: 10,
            background: "#eee",
            marginBottom: 10
          }}
        >

          📄 {selectedFile.originalName}

        </div>

      )}

      {/* Message Input */}
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        style={{
          flex: 1,
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        style={{
          padding: "10px 18px",
          background: "#25D366",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;