import React from "react";
import "../../index.css"; // CSS 파일 import

export default function ChatPanel({ chats, onClose }) {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm chat-panel-overlay">
      <div className="rounded-2xl shadow-lg w-full max-w-2xl h-3/4 flex flex-col chat-panel-container">
        <div className="p-4 text-xl font-bold border-b flex justify-between items-center rounded-t-2xl chat-panel-header">
          💬 전체 채팅 내역
          <button
            className="border-none text-xl cursor-pointer p-2 rounded-md close-button"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div className="p-5 flex-grow overflow-y-auto rounded-b-2xl chat-panel-body">
          {chats.map((c, i) => (
            <div
              key={i}
              className={`p-3 mb-2 rounded-lg text-base leading-relaxed ${
                c.type === "question"
                  ? "question-chat-bubble"
                  : "answer-chat-bubble"
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
