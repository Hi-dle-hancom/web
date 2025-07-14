// src/context/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

// 1. LanguageContext 생성
const LanguageContext = createContext();

// 2. LanguageProvider 컴포넌트 정의
export const LanguageProvider = ({ children }) => {
  // 언어 상태. 기본값은 'ko' (한국어)로 설정
  const [language, setLanguage] = useState("ko");

  // 컴포넌트 마운트 시 로컬 스토리지에서 언어 설정 불러오기
  useEffect(() => {
    const savedLanguage = localStorage.getItem("appLanguage");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // 언어가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("appLanguage", language);
  }, [language]);

  // context value로 language 상태와 setLanguage 함수를 제공
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 3. useLanguage 훅 정의 (컨텍스트를 쉽게 사용할 수 있도록)
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
