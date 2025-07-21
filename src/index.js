// src/index.js (혹은 여러분의 프로젝트 진입점 파일)

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // BrowserRouter 임포트
import App from "./App";
import "./index.css"; // CSS 파일 import

// LanguageProvider도 App 위에 있어야 합니다.
import { LanguageProvider } from "./context/LanguageContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LanguageProvider>
      {" "}
      {/* LanguageProvider로 감싸기 */}
      <BrowserRouter>
        {" "}
        {/* App 컴포넌트를 BrowserRouter로 감싸기 */}
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </React.StrictMode>
);
