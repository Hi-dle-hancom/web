import React, { useState } from "react";
import RightTabs from "./RightTabs.js";
import { jsPDF } from "jspdf"; // jsPDF 임포트
import { notoSansKRBase64 } from "../../assets/fonts/NotoSansKR_base64.js"; // 한글 폰트 임포트 경로 확인
import "../../index.css"; // CSS 파일 import

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
    <div className="flex flex-col w-full min-w-[900px] h-[calc(100vh-112px)] box-border chat-main-container">
      {/* 좌측 (입력, 히스토리, 전체 채팅) */}
      <div className="flex flex-col flex-grow min-w-0 max-w-full p-8">
        {/* 질문 입력 영역 */}
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
          />
          <button
            id="send"
            onClick={handleSend}
            className="border-none rounded-lg py-2 px-4 text-base font-semibold cursor-pointer flex-shrink-0 transition-colors duration-200 send-button"
          >
            보내기
          </button>
        </div>

        {/* 최근 질문 히스토리 */}
        <div className="rounded-2xl border-2 p-4 mb-5 history-container">
          <div className="text-lg font-semibold mb-2 flex items-center gap-2 history-title">
            <span role="img" aria-label="clock">
              🕘
            </span>{" "}
            최근 질문 히스토리
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
                onClick={() => handleHistoryClick(txt)}
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

        {/* 전체 채팅 내역 박스 */}
        <div className="rounded-2xl border-2 p-4 mb-5 chat-history-container">
          <div className="text-lg font-semibold mb-2 flex items-center gap-2 chat-history-title">
            <span role="img" aria-label="memo">
              📝
            </span>
            전체 채팅 내역
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

      {/* 우측 (답변) */}
      <div className="w-[380px] min-w-[320px] flex-shrink-0 p-8 right-tabs-container">
        <RightTabs latestAnswer={latestAnswer} />
      </div>
    </div>
  );
};

export default ChatMain;
