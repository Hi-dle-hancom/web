import React from "react";
import "../../index.css"; // CSS 파일 import

const navMenus = [
  { label: "💬 새 채팅", key: "chat" },
  { label: "🔍 채팅 검색", key: "search" },
  { label: "📚 라이브러리", key: "library" },
];

// isVertical prop을 추가합니다.
const TopNav = ({ menu, setMenu, isVertical }) => (
  <nav
    className={`shadow-md border-r-2 p-8 flex-shrink-0
      ${
        isVertical
          ? "flex flex-col w-56 h-screen"
          : "w-full h-16 flex items-center px-4 gap-20"
      } top-nav-container`}
  >
    {navMenus.map((menuObj) => (
      <button
        key={menuObj.key}
        onClick={() => setMenu(menuObj.key)}
        className={`py-6 px-5 text-base rounded-lg border cursor-pointer overflow-hidden transition-all duration-200 ease-out
          ${
            isVertical ? "mb-8" : "flex-shrink-0"
          } /* 세로 모드일 때 마진 추가 */
          nav-button ${
            menu === menuObj.key ? "nav-button-active" : "nav-button-inactive"
          }`}
      >
        {menuObj.label}
      </button>
    ))}
  </nav>
);

export default TopNav;
