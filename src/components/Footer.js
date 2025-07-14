// src/components/Footer.js
import React from "react";
import { useLanguage } from "../context/LanguageContext"; // useLanguage 훅 임포트
import strings from "../locales/strings"; // 문자열 파일 임포트

// currentSection과 isHomePage, currentScrollOffset prop은 현재 사용되지 않으므로 제거하거나 그대로 둡니다.
// 여기서는 변경 없이 그대로 둡니다.
function Footer({ currentSection, isHomePage, currentScrollOffset }) {
  const { language } = useLanguage(); // 언어 상태 가져오기
  const currentYear = new Date().getFullYear();

  // 푸터의 가시성을 결정하는 조건 (기존 로직 유지)
  const isVisible =
    !isHomePage || (currentSection === 4 && currentScrollOffset > 0);

  return (
    <footer
      className={`fixed bottom-0 left-0 w-full p-4 bg-gray-800 text-gray-400 text-center transition-opacity duration-500 z-40 ${
        isVisible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8">
        <span className="bg-gray-600 text-gray-200 px-3 py-1 rounded-sm">
          &copy; {currentYear} {strings[language].footer.copyright}
        </span>
        {/*
          요청에 따라 아래 내비게이션 링크들을 제거했습니다.
        <a href="/products" className="hover:text-white">
          {strings[language].header.products}
        </a>
        <a href="/support" className="hover:text-white">
          {strings[language].header.support}
        </a>
        <a href="/learn" className="hover:text-white">
          {strings[language].header.learn}
        </a>
        <a href="/community" className="hover:text-white">
          {strings[language].header.community}
        </a>
        */}
      </div>
    </footer>
  );
}

export default Footer;
