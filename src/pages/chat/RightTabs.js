// src/components/TeamMember/RightTabs.js
import React, { useState } from "react";

export default function RightTabs({ latestAnswer }) {
  const [tab, setTab] = useState("answer");
  return (
    <div>
      <div className="flex mb-6 border-b-2 border-gray-700 dark:border-gray-800">
        <button
          className={`flex-1 py-2 px-4 bg-transparent border-none text-white dark:text-gray-50 text-base font-semibold cursor-pointer relative transition-colors duration-200 ${
            tab === "answer"
              ? "text-blue-500 dark:text-blue-400 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-blue-500 dark:after:bg-blue-400"
              : "hover:text-blue-600 dark:hover:text-blue-300"
          }`}
          onClick={() => setTab("answer")}
        >
          최종 답변
        </button>
        <button
          className={`flex-1 py-2 px-4 bg-transparent border-none text-white dark:text-gray-50 text-base font-semibold cursor-pointer relative transition-colors duration-200 ${
            tab === "token"
              ? "text-blue-500 dark:text-blue-400 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-blue-500 dark:after:bg-blue-400"
              : "hover:text-blue-600 dark:hover:text-blue-300"
          }`}
          onClick={() => setTab("token")}
        >
          토큰 사용량
        </button>
      </div>
      {tab === "answer" && (
        <div>
          <div className="text-lg font-semibold text-white dark:text-gray-50 mb-4">
            최종 답변
          </div>
          <div className="bg-gray-700 dark:bg-gray-800 border border-gray-600 dark:border-gray-700 rounded-lg p-4 min-h-[100px] flex items-center justify-center text-center">
            <div className="text-lg font-medium text-white dark:text-gray-50">
              {" "}
              {/* 이 부분을 수정했습니다. */}
              {latestAnswer ? (
                latestAnswer
              ) : (
                <span className="text-gray-400 dark:text-gray-500">
                  답변 없음
                </span>
              )}{" "}
              {/* '답변 없음' 텍스트도 조정했습니다. */}
            </div>
          </div>
        </div>
      )}
      {tab === "token" && (
        <div className="bg-gray-700 dark:bg-gray-800 border border-gray-600 dark:border-gray-700 rounded-lg p-4 min-h-[80px] flex flex-col items-center justify-center gap-2">
          <div className="text-lg font-semibold text-white dark:text-gray-50">
            예시
          </div>
          <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
            1234
          </div>
        </div>
      )}
    </div>
  );
}
