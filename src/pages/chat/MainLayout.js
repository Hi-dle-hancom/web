import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { notoSansKRBase64 } from "../../assets/fonts/NotoSansKR_base64.js"; // .js 확장자 명시
import "../../index.css"; // CSS 파일 import

const MainLayout = ({ chats, setChats, setLatestAnswer }) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);

  const handleSend = () => {
    if (!input.trim()) return;
    setChats((prev) => [...prev, { text: input, type: "question" }]);
    setHistory((prev) =>
      [input.trim(), ...prev.filter((h) => h !== input.trim())].slice(0, 10)
    );
    setTimeout(() => {
      const answerText = `답변: "${input}"에 대한 예시 응답입니다.`;
      setChats((prev) => [...prev, { text: answerText, type: "answer" }]);
      setLatestAnswer(answerText);
    }, 500);
    setInput("");
  };

  const handleDeleteHistory = (txt) => {
    setHistory((prev) => prev.filter((h) => h !== txt));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // 한글 폰트 추가 (NotoSansKR-Regular.js 파일이 필요합니다)
    doc.addFileToVFS("NotoSansKR-Regular.ttf", notoSansKRBase64);
    doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "normal");
    doc.setFont("NotoSansKR");

    let yOffset = 10;
    doc.text("Chat History", 10, yOffset);
    yOffset += 10;

    chats.forEach((chat) => {
      const text = `${chat.type === "question" ? "Q: " : "A: "}${chat.text}`;
      doc.text(text, 10, yOffset);
      yOffset += 10;
      if (yOffset > 280) {
        // 페이지 넘어가면 새 페이지 추가
        doc.addPage();
        yOffset = 10;
      }
    });

    doc.save("chat_history.pdf");
  };

  return (
    <div>
      <div className="flex items-end gap-4 rounded-2xl border-2 p-4 mb-5 input-area-container">
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
          className="flex-1 border-none resize-none min-h-[40px] max-h-[150px] overflow-y-auto p-2 focus:outline-none input-textarea"
        ></textarea>
        <button
          id="send"
          onClick={handleSend}
          className="border-none rounded-lg py-2 px-4 text-base font-semibold cursor-pointer flex-shrink-0 transition-colors duration-200 send-button"
        >
          보내기
        </button>
      </div>
      <div className="rounded-2xl border-2 p-4 mb-5 history-container">
        <div className="text-lg font-semibold mb-2 flex items-center gap-2 history-title">
          <span className="text-xl">🕘</span> 최근 질문 히스토리
        </div>
        <div className="min-h-[70px] max-h-[200px] overflow-y-auto flex flex-col gap-3">
          {history.length === 0 && (
            <div className="text-center p-4 no-history-message">
              최근 질문 없음
            </div>
          )}
          {history.map((txt) => (
            <div
              className="border rounded-lg p-3 mb-2 text-base font-medium cursor-pointer flex justify-between items-center transition-colors duration-200 history-item"
              key={txt}
              onClick={() => setInput(txt)}
            >
              {txt.length > 32 ? txt.slice(0, 32) + "..." : txt}
              <button
                className="bg-transparent border-none text-xl cursor-pointer history-delete-button"
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
      <div className="rounded-2xl border-2 p-4 mb-5 chat-history-container">
        <div className="text-lg font-semibold mb-2 flex items-center gap-2 chat-history-title">
          <div>
            <span role="img" aria-label="memo" className="text-xl">
              📝
            </span>{" "}
            전체 채팅 내역
          </div>
          <button
            className="ml-2 text-sm rounded-md py-1 px-3 border cursor-pointer font-semibold export-pdf-button"
            onClick={handleExportPDF}
          >
            PDF 내보내기
          </button>
        </div>
        <div className="min-h-[70px] max-h-[200px] overflow-y-auto flex flex-col gap-3">
          {chats.length === 0 && (
            <div className="text-center p-4 no-chat-message">
              채팅 내역 없음
            </div>
          )}
          {chats.slice(-20).map((chat, idx) => (
            <div
              className={`p-3 rounded-xl text-base font-semibold m-0 chat-bubble ${
                chat.type === "question" ? "question-bubble" : "answer-bubble"
              }`}
              key={idx}
            >
              {chat.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
