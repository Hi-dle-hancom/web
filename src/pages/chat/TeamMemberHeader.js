// src/components/TeamMember/TeamMemberHeader.js
import React from "react";
import logoImage from "../../assets/textlogo.png"; // 경로 조정

const Header = ({ toggleDarkMode, isDark }) => (
  <header className="w-full min-w-0 h-12 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-50 flex items-center px-4 shadow-md border-b-2 border-gray-700 dark:border-gray-800 gap-6">
    <img src={logoImage} alt="HAPA Logo" className="h-9 w-auto mr-4" />
    <div className="flex-1" />
    <button
      className="py-2 px-5 text-base rounded-lg bg-gray-700 dark:bg-gray-800 text-white dark:text-gray-50 border border-gray-600 dark:border-gray-700 cursor-pointer min-w-0 max-w-[180px] box-border flex-shrink-0 overflow-hidden"
      onClick={toggleDarkMode}
    >
      {isDark ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  </header>
);

export default Header;
