// src/components/TeamMember/ChatMain.js

import React, { useState } from "react";
import RightTabs from "./RightTabs.js";
import { jsPDF } from "jspdf"; // jsPDF 임포트
import { notoSansKRBase64 } from "../../assets/fonts/NotoSansKR_base64.js"; // 한글 폰트 임포트 경로 확인

const ChatMain = () => {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [history, setHistory] = useState([]);

  const latestAnswer =
    chats.length > 0
      ? chats.filter((c) => c.type === "answer").slice(-1)[0]?.text || ""
      : "";

  // 입력 전송
  const handleSend = () => {
    if (!input.trim()) return;
    setChats((prev) => [...prev, { text: input, type: "question" }]);
    setHistory((prev) =>
      [input.trim(), ...prev.filter((h) => h !== input.trim())].slice(0, 10)
    );
    setTimeout(() => {
      setChats((prev) => [
        ...prev,
        {
          text: `답변: "${input}"에 대한 예시 응답입니다.`,
          type: "answer",
        },
      ]);
    }, 1000);
    setInput("");
  };

  // 히스토리 클릭
  const handleHistoryClick = (txt) => {
    setInput(txt);
  };

  // 히스토리 삭제
  const handleDeleteHistory = (txtToDelete) => {
    setHistory((prev) => prev.filter((txt) => txt !== txtToDelete));
  };

  // PDF 내보내기 기능
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // 한글 폰트 추가
    doc.addFileToVFS("NotoSansKR-Regular.ttf", notoSansKRBase64);
    doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "normal");
    doc.setFont("NotoSansKR");

    let yOffset = 10;
    doc.text("Chat History", 10, yOffset);
    yOffset += 10;

    // chats 배열을 순회하며 PDF에 내용 추가
    chats.forEach((chat) => {
      const text = `${chat.type === "question" ? "Q: " : "A: "}${chat.text}`;
      // 텍스트가 페이지를 넘어갈 경우를 대비한 줄 바꿈 처리
      const splitText = doc.splitTextToSize(text, 180); // 180은 최대 너비 (조절 가능)
      doc.text(splitText, 10, yOffset);
      yOffset += splitText.length * 7; // 줄 간격 조절 (7은 폰트 크기에 따라 조절)

      if (yOffset > 280) {
        // 페이지 넘어가면 새 페이지 추가
        doc.addPage();
        yOffset = 10;
      }
    });

    doc.save("chat_history.pdf");
  };

  return (
    <div className="flex flex-col w-full min-w-[900px] h-[calc(100vh-112px)] bg-gray-900 dark:bg-gray-950 box-border">
      {/* 좌측 (입력, 히스토리, 전체 채팅) */}
      <div className="flex flex-col flex-grow min-w-0 max-w-full p-8">
        {/* 질문 입력 영역 */}
        <div className="flex items-end gap-4 bg-gray-800 dark:bg-gray-900 rounded-2xl border-2 border-gray-700 dark:border-gray-800 p-4 mb-5">
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="질문을 입력하세요..."
            className="flex-1 border-none bg-transparent text-white dark:text-gray-50 resize-none min-h-[40px] max-h-[150px] overflow-y-auto p-2 focus:outline-none"
          />
          <button
            id="send"
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg py-2 px-4 text-base font-semibold cursor-pointer flex-shrink-0 transition-colors duration-200"
          >
            보내기
          </button>
        </div>

        {/* 최근 질문 히스토리 */}
        <div className="bg-gray-800 dark:bg-gray-900 rounded-2xl border-2 border-gray-700 dark:border-gray-800 p-4 mb-5">
          <div className="text-lg font-semibold text-blue-500 dark:text-blue-400 mb-2 flex items-center gap-2">
            <span role="img" aria-label="clock">
              🕘
            </span>{" "}
            최근 질문 히스토리
          </div>
          <div className="min-h-[70px] max-h-[200px] overflow-y-auto flex flex-col gap-3">
            {history.length === 0 && (
              <div className="text-gray-500 text-center p-4">
                최근 질문 없음
              </div>
            )}
            {history.map((txt) => (
              <div
                className="bg-gray-700 dark:bg-gray-800 border border-gray-600 dark:border-gray-700 rounded-lg p-3 mb-2 text-base font-medium text-white dark:text-gray-50 cursor-pointer flex justify-between items-center transition-colors duration-200 hover:bg-gray-600 dark:hover:bg-gray-700"
                key={txt}
                onClick={() => handleHistoryClick(txt)}
              >
                {txt.length > 32 ? txt.slice(0, 32) + "..." : txt}
                <button
                  className="bg-transparent border-none text-red-400 text-xl cursor-pointer"
                  title="삭제"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHistory(txt);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 전체 채팅 내역 박스 */}
        <div className="bg-gray-800 dark:bg-gray-900 rounded-2xl border-2 border-gray-700 dark:border-gray-800 p-4 mb-5">
          <div className="text-lg font-semibold text-blue-500 dark:text-blue-400 mb-2 flex items-center gap-2">
            <span role="img" aria-label="memo">
              📝
            </span>
            전체 채팅 내역
            <button
              className="ml-2 text-sm rounded-md py-1 px-3 border border-gray-600 dark:border-gray-700 bg-gray-700 dark:bg-gray-800 text-white dark:text-gray-50 cursor-pointer font-semibold"
              onClick={handleExportPDF}
            >
              PDF 내보내기
            </button>
          </div>
          <div className="min-h-[70px] max-h-[200px] overflow-y-auto flex flex-col gap-3">
            {chats.length === 0 && (
              <div className="text-gray-500 text-center p-4">
                채팅 내역 없음
              </div>
            )}
            {chats.slice(-20).map((chat, idx) => (
              <div
                className={`p-3 rounded-xl text-base font-semibold m-0 ${
                  chat.type === "question"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white self-start max-w-[85%]"
                    : "bg-gray-700 dark:bg-gray-800 text-white dark:text-gray-50 self-end max-w-[85%]"
                }`}
                key={idx}
              >
                {chat.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 우측 (답변) */}
      <div className="w-[380px] min-w-[320px] bg-gray-800 dark:bg-gray-900 border-l-2 border-gray-700 dark:border-gray-800 flex-shrink-0 p-8">
        <RightTabs latestAnswer={latestAnswer} />
      </div>
    </div>
  );
};

export default ChatMain;
