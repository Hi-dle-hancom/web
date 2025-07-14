// src/App.js
import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header.old"; // 사용자님의 Header.js 컴포넌트 임포트
import Footer from "./components/Footer"; // Footer 컴포넌트 임포트
import HomePage from "./pages/Homepage"; // HomePage 컴포넌트 임포트
import "./index.css"; // 전역 CSS (필수 리셋 및 폰트 등)

import { useLanguage } from "./context/LanguageContext"; // LanguageContext 임포트
import strings from "./locales/strings"; // 문자열 파일 임포트
import SignupPage from "./pages/SignupPage"; // SignupPage 임포트
import LoginPage from "./pages/LoginPage"; // LoginPage 임포트
import CommunityPage from "./pages/CommunityPage"; // CommunityPage 임포트
import PostWritePage from "./pages/PostWritePage"; // PostWritePage 임포트
import PostDetailPage from "./pages/PostDetailPage"; // PostDetailPage 임포트

// 팀원분의 App.tsx 컴포넌트 임포트 시 다른 이름 사용 (예: TeamMemberApp)
// 파일 경로와 이름은 실제 프로젝트 구조에 맞게 조정하세요.
// 예: src/App_member.tsx 파일이 있다면 아래와 같이 임포트합니다.
import TeamMemberApp from "./App_member";

// 각 페이지 컴포넌트를 인라인으로 정의하여 strings에서 텍스트를 직접 가져옴
const StaticPage = ({ textKey }) => {
  const { language } = useLanguage();
  return (
    // StaticPage 컴포넌트에도 다크 모드 배경색과 텍스트 색상 클래스 적용
    <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
      {strings[language][textKey]}
    </div>
  );
};

function App() {
  // 사용자님의 메인 App 컴포넌트
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [currentHomePageSection, setCurrentHomePageSection] = useState("");
  const [currentHomePageScrollOffset, setCurrentHomePageScrollOffset] =
    useState(0);
  const [resetHomePageTrigger, setResetHomePageTrigger] = useState(0);

  const handleHomePageSectionChange = (sectionId, scrollOffset) => {
    setCurrentHomePageSection(sectionId);
    setCurrentHomePageScrollOffset(scrollOffset);
  };

  const handleResetHomePage = () => {
    setResetHomePageTrigger((prev) => prev + 1);
  };

  return (
    // 최상위 div에는 특별한 배경색을 지정하지 않아 body의 다크 모드 영향을 받도록 합니다.
    <div className="App">
      {/* Header 컴포넌트는 사용자님의 기존 Header.js를 사용하며,
          여기에 onResetHomePage prop을 전달합니다.
          Header.js 파일이 최신 통합 버전 (Demo 메뉴 포함)인지 확인해주세요. */}
      <Header onResetHomePage={handleResetHomePage} />
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
          <Route path="/login" element={<LoginPage />} />{" "}
          {/* LoginPage 컴포넌트 직접 렌더링 */}
          <Route path="/signup" element={<SignupPage />} />
          {/* HAPA 웹사이트 하단 메뉴에 대응하는 라우트들 */}
          <Route
            path="/products"
            element={<StaticPage textKey="productsPage" />}
          />
          <Route
            path="/support"
            element={<StaticPage textKey="supportPage" />}
          />
          <Route path="/learn" element={<StaticPage textKey="learnPage" />} />
          <Route path="/community" element={<CommunityPage />} />{" "}
          {/* CommunityPage 컴포넌트 렌더링 */}
          <Route path="/community/write" element={<PostWritePage />} />{" "}
          {/* PostWritePage 라우트 추가 */}
          <Route path="/community/:postId" element={<PostDetailPage />} />{" "}
          {/* PostDetailPage 라우트 추가 */}
          {/* 새로운 Demo 페이지 라우트 추가: TeamMemberApp 컴포넌트를 렌더링합니다. */}
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
