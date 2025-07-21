// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header.old";
import Footer from "./components/Footer";
import HomePage from "./pages/Homepage";
import "./index.css";

import { useLanguage } from "./context/LanguageContext";
import strings from "./locales/strings";
import CommunityPage from "./pages/CommunityPage";
import PostWritePage from "./pages/PostWritePage";
import PostDetailPage from "./pages/PostDetailPage";

import TeamMemberApp from "./App_member"; // 팀원분의 App.tsx 컴포넌트 임포트

// 각 페이지 컴포넌트를 인라인으로 정의하여 strings에서 텍스트를 직접 가져옴
const StaticPage = ({ textKey }) => {
  const { language } = useLanguage();
  return (
    // StaticPage 컴포넌트에도 다크 모드 배경색과 텍스트 색상 클래스 적용
    <div className="min-h-screen flex items-center justify-center static-page-bg static-page-text">
      {strings[language][textKey]}
    </div>
  );
};

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [currentHomePageSection, setCurrentHomePageSection] = useState("");
  const [currentHomePageScrollOffset, setCurrentHomePageScrollOffset] =
    useState(0);
  const [resetHomePageTrigger, setResetHomePageTrigger] = useState(0);

  // 다크 모드 상태 추가
  // 로컬 스토리지 또는 OS 테마 설정을 기반으로 초기 테마 설정
  const [isDark, setIsDark] = useState(
    () =>
      localStorage.getItem("theme") === "dark" ||
      (localStorage.getItem("theme") === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  // isDark 상태 변경 시 body 클래스 업데이트
  useEffect(() => {
    // 기존의 모든 테마 관련 클래스를 제거하여 깨끗한 상태에서 시작합니다.
    document.body.classList.remove("dark", "light");

    if (isDark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      // isDark가 false일 때 'light' 클래스를 추가합니다.
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]); // isDark 상태가 변경될 때마다 이 효과를 다시 실행

  // 다크 모드 토글 함수
  const toggleDarkMode = () => {
    setIsDark((prevIsDark) => !prevIsDark);
  };

  const handleHomePageSectionChange = (sectionId, scrollOffset) => {
    setCurrentHomePageSection(sectionId);
    setCurrentHomePageScrollOffset(scrollOffset);
  };

  const handleResetHomePage = () => {
    setResetHomePageTrigger((prev) => prev + 1);
  };

  return (
    // 최상위 div에는 특별한 배경색을 지정하지 않아 body의 다크 모드 영향을 받도록 합니다.
    // body의 기본 배경색이 var(--color-background-primary)로 설정되어 있으므로, App 컴포넌트는 별도의 bg 클래스가 필요 없습니다.
    <div className="App">
      {/* Header 컴포넌트에 isDark와 toggleDarkMode props 전달 */}
      <Header
        onResetHomePage={handleResetHomePage}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
      />
      <main className="pt-16 min-h-screen">
        {" "}
        {/* 헤더 높이만큼 paddingTop 추가 */}
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onSectionChange={handleHomePageSectionChange}
                resetTrigger={resetHomePageTrigger}
              />
            }
          />{" "}
          {/* HomePage에 resetTrigger prop 전달 */}
          <Route path="/a" element={<StaticPage textKey="pageA" />} />
          <Route path="/b" element={<StaticPage textKey="pageB" />} />
          <Route path="/community" element={<CommunityPage />} />{" "}
          {/* CommunityPage 컴포넌트 렌더링 */}
          <Route path="/community/write" element={<PostWritePage />} />{" "}
          {/* PostWritePage 라우트 추가 */}
          <Route path="/community/:postId" element={<PostDetailPage />} />{" "}
          {/* PostDetailPage 라우트 추가 */}
          <Route path="/demo" element={<TeamMemberApp />} />
        </Routes>
      </main>
      <Footer
        currentSection={currentHomePageSection}
        currentScrollOffset={currentHomePageScrollOffset}
        isHomePage={isHomePage}
      />
    </div>
  );
}

export default App;
