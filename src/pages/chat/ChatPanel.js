// src/components/TeamMember/ChatPanel.js

import React from "react";

export default function ChatPanel({ chats, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl h-3/4 flex flex-col">
        <div className="bg-gray-700 dark:bg-gray-800 text-white dark:text-gray-50 p-4 text-xl font-bold border-b border-gray-600 dark:border-gray-700 flex justify-between items-center rounded-t-2xl">
          💬 전체 채팅 내역
          <button
            className="bg-transparent border-none text-white dark:text-gray-50 text-xl cursor-pointer p-2 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div className="bg-gray-800 dark:bg-gray-900 p-5 flex-grow overflow-y-auto rounded-b-2xl">
          {chats.map((c, i) => (
            <div
              key={i}
              className={`p-3 mb-2 rounded-lg text-base leading-relaxed text-white dark:text-gray-50 ${
                c.type === "question"
                  ? "bg-blue-600 text-white text-left"
                  : "bg-gray-700 dark:bg-gray-800 text-white dark:text-gray-50 text-right"
              }`}
            >
              {c.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
