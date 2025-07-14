// src/App_member.js
import React, { useState, useEffect } from "react";
import TopNav from "./pages/chat/TopNav.js"; // 경로 수정: TopNav는 components/TeamMember 안에 있습니다.
import MainLayout from "./pages/chat/MainLayout.js"; // 경로 수정
import RightPanel from "./pages/chat/RightPanel.js"; // 이 경로는 그대로 유지 (제공된 파일에 없음)

const ChatSearch = () => (
  <div className="flex-grow min-w-0 max-w-full p-8 flex flex-col bg-gray-900 dark:bg-gray-950 text-white dark:text-gray-50">
    <h2 className="text-2xl font-bold mb-8">🔍 채팅 검색</h2>
    <div className="p-8 text-gray-400">검색 기능을 여기에 구현하세요.</div>
  </div>
);
const Library = () => (
  <div className="flex-grow min-w-0 max-w-full p-8 flex flex-col bg-gray-900 dark:bg-gray-950 text-white dark:text-gray-50">
    <h2 className="text-2xl font-bold mb-8">📚 라이브러리</h2>
    <div className="p-8 text-gray-400">
      라이브러리 내용을 여기에 구현하세요.
    </div>
  </div>
);

function App() {
  const [menu, setMenu] = useState("chat");
  const [chats, setChats] = useState([]);
  const [latestAnswer, setLatestAnswer] = useState("");

  useEffect(() => {
    // 다크 모드 관련 로직은 사용자님의 메인 Header.js에서 관리하므로 여기서는 제거합니다.
  }, []);

  let mainComponent;
  if (menu === "chat") {
    mainComponent = (
      <MainLayout
        chats={chats}
        setChats={setChats}
        setLatestAnswer={setLatestAnswer}
      />
    );
  } else if (menu === "search") {
    mainComponent = <ChatSearch />;
  } else if (menu === "library") {
    mainComponent = <Library />;
  }

  return (
    <div className="flex min-h-screen bg-gray-900 dark:bg-gray-950">
      {" "}
      {/* 전체 화면 레이아웃 */}
      {/* 왼쪽 세로 TopNav */}
      <TopNav menu={menu} setMenu={setMenu} isVertical={true} />{" "}
      {/* isVertical prop 추가 */}
      {/* 메인 콘텐츠와 오른쪽 패널 컨테이너 */}
      <div className="flex flex-grow">
        {" "}
        {/* 메인 콘텐츠와 오른쪽 패널을 위한 flex 컨테이너 */}
        {/* 메인(왼쪽) - 기존의 mainComponent를 포함 */}
        <div className="flex-grow min-w-0 max-w-full p-8 flex flex-col">
          {mainComponent}
        </div>
        {/* 오른쪽 패널 */}
        <RightPanel latestAnswer={latestAnswer} />
      </div>
    </div>
  );
}
export default App;
