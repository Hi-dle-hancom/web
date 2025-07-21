import React from "react";
import logoImage from "../../assets/textlogo.png"; // 경로 조정
import "../../index.css"; // CSS 파일 import

const Header = ({ toggleDarkMode, isDark }) => (
  <header className="w-full min-w-0 h-12 flex items-center px-4 shadow-md border-b-2 gap-6 header-container">
    <img src={logoImage} alt="HAPA Logo" className="h-9 w-auto mr-4" />
    <div className="flex-1" />
    <button
      className="py-2 px-5 text-base rounded-lg border cursor-pointer min-w-0 max-w-[180px] box-border flex-shrink-0 overflow-hidden theme-toggle-button"
      onClick={toggleDarkMode}
    >
      {isDark ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  </header>
);

export default Header;
