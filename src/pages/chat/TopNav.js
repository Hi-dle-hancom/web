// src/components/TeamMember/TopNav.js
import React from "react";

const navMenus = [
  { label: "💬 새 채팅", key: "chat" },
  { label: "🔍 채팅 검색", key: "search" },
  { label: "📚 라이브러리", key: "library" },
];

// isVertical prop을 추가합니다.
const TopNav = ({ menu, setMenu, isVertical }) => (
  <nav
    className={`bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-50 shadow-md border-r-2 border-gray-600 dark:border-gray-800 p-8 flex-shrink-0
      ${
        isVertical
          ? "flex flex-col w-56 h-screen"
          : "w-full h-16 flex items-center px-4 gap-20"
      }`}
  >
    {navMenus.map((menuObj) => (
      <button
        key={menuObj.key}
        onClick={() => setMenu(menuObj.key)}
        className={`py-6 px-5 text-base rounded-lg border cursor-pointer overflow-hidden transition-all duration-200 ease-out
          ${
            isVertical ? "mb-8" : "flex-shrink-0"
          } {/* 세로 모드일 때 마진 추가 */}
          ${
            menu === menuObj.key
              ? "bg-blue-800 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-500"
              : "bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-50 border-gray-600 dark:border-gray-700"
          } hover:opacity-90`}
      >
        {menuObj.label}
      </button>
    ))}
  </nav>
);

export default TopNav;
