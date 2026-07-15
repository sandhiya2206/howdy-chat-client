import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

function MainLayout() {
  const [showSidebar, setShowSidebar] = useState(true);

  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#ece5dd",
      }}
    >
      {(!isMobile || showSidebar) && (
        <Sidebar setShowSidebar={setShowSidebar} />
      )}

      {(!isMobile || !showSidebar) && (
        <ChatWindow setShowSidebar={setShowSidebar} />
      )}
    </div>
  );
}

export default MainLayout;