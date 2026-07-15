import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

function MainLayout() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#ece5dd",
      }}
    >
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

export default MainLayout;