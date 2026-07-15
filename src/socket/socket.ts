import { io } from "socket.io-client";

const socket = io("https://server-4jry.onrender.com", {
  transports: ["websocket"],
});

export const connectSocket = (userId: number) => {
  if (!socket.connected) {
    socket.connect();

    socket.once("connect", () => {
      console.log("✅ Connected:", socket.id);

      socket.emit("join", userId);
    });
  } else {
    socket.emit("join", userId);
  }
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;