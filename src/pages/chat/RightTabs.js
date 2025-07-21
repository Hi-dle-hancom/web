import React, { useState } from "react";
import "../../index.css"; // CSS 파일 import

export default function RightTabs({ latestAnswer }) {
  const [tab, setTab] = useState("answer");
  return (
    <div>
      <div className="flex mb-6 border-b-2 tabs-container">
        <button
          className={`flex-1 py-2 px-4 bg-transparent border-none text-base font-semibold cursor-pointer relative transition-colors duration-200 tab-button ${
            tab === "answer" ? "tab-active" : "tab-inactive"
          }`}
          onClick={() => setTab("answer")}
        >
          최종 답변
        </button>
        <button
          className={`flex-1 py-2 px-4 bg-transparent border-none text-base font-semibold cursor-pointer relative transition-colors duration-200 tab-button ${
            tab === "token" ? "tab-active" : "tab-inactive"
          }`}
          onClick={() => setTab("token")}
        >
          토큰 사용량
        </button>
      </div>
      {tab === "answer" && (
        <div>
          <div className="text-lg font-semibold mb-4 answer-title">
            최종 답변
          </div>
          <div className="rounded-lg p-4 min-h-[100px] flex items-center justify-center text-center answer-box">
            <div className="text-lg font-medium answer-text">
              {" "}
              {latestAnswer ? (
                latestAnswer
              ) : (
                <span className="no-answer-text">답변 없음</span>
              )}{" "}
            </div>
          </div>
        </div>
      )}
      {tab === "token" && (
        <div className="rounded-lg p-4 min-h-[80px] flex flex-col items-center justify-center gap-2 token-box">
          <div className="text-lg font-semibold token-example-text">예시</div>
          <div className="text-2xl font-bold token-value">1234</div>
        </div>
      )}
    </div>
  );
}
