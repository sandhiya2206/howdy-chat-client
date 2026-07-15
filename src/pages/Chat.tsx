import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

function Chat() {
  const [showSidebar, setShowSidebar] = useState(
    window.innerWidth >= 768
  );

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  );

  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);

      if (!mobile) {
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", resize);

    return () =>
      window.removeEventListener("resize", resize);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
      }}
    >
      {isMobile ? (
        showSidebar ? (
          <Sidebar setShowSidebar={setShowSidebar} />
        ) : (
          <ChatWindow setShowSidebar={setShowSidebar} />
        )
      ) : (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              width: "30%",
              minWidth: "320px",
              maxWidth: "380px",
            }}
          >
            <Sidebar setShowSidebar={setShowSidebar} />
          </div>

          <div
            style={{
              flex: 1,
            }}
          >
            <ChatWindow setShowSidebar={setShowSidebar} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;