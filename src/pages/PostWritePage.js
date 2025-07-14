// src/pages/PostWritePage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import { createPost } from "../api/communityService"; // 게시글 생성 API 임포트
import { addNotification } from "../utils/notification"; // 알림 유틸 임포트

// 임시 현재 사용자 ID (실제 앱에서는 인증 시스템에서 가져옴)
const CURRENT_USER_ID = "currentUser123";

// 텍스트에서 언급된 ID를 추출하는 함수 (PostDetailPage와 동일하게 재정의)
const extractMentions = (text) => {
  const mentionRegex = /@([a-zA-Z0-9_.]+)/g;
  const matches = [...text.matchAll(mentionRegex)];
  return matches.map((match) => match[1]); // 캡처 그룹(ID)만 반환
};

export default function PostWritePage() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]); // 선택된 파일들을 저장할 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    console.log(
      "새로 선택된 파일:",
      newFiles.map((f) => f.name)
    ); // 새로 선택된 파일 로그

    setSelectedFiles((prevFiles) => {
      // 기존 파일들의 이름을 Set으로 만들어 중복 체크를 효율적으로 합니다.
      const existingFileNames = new Set(prevFiles.map((file) => file.name));

      // 새로 선택된 파일 중 기존 목록에 없는 파일만 필터링합니다.
      const uniqueNewFiles = newFiles.filter(
        (file) => !existingFileNames.has(file.name)
      );

      const updatedFiles = [...prevFiles, ...uniqueNewFiles];
      console.log(
        "현재 누적된 파일 (중복 제거 후):",
        updatedFiles.map((f) => f.name)
      ); // 누적된 파일 로그
      return updatedFiles;
    });
    // 파일 입력 필드의 value를 null로 설정하는 코드를 제거하여
    // 브라우저가 파일 선택 상태를 올바르게 유지하도록 합니다.
    // e.target.value = null;
  };

  // 선택된 파일 목록에서 특정 파일을 제거하는 핸들러
  const handleRemoveFile = (fileNameToRemove) => {
    setSelectedFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter(
        (file) => file.name !== fileNameToRemove
      );
      console.log(
        "파일 제거 후 누적된 파일:",
        updatedFiles.map((f) => f.name)
      ); // 제거 후 누적된 파일 로그
      return updatedFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!title.trim() || !content.trim()) {
      setError(strings[language].postWritePage.alertFillAllFields); // 수정: validation.emptyFields 대신 직접 문자열 사용
      setLoading(false);
      return;
    }

    try {
      // 실제 API 호출 (파일도 함께 전달)
      // 실제 백엔드에서는 FormData를 사용하여 파일을 전송해야 합니다.
      // 여기서는 더미 응답을 가정합니다.
      const result = await createPost(title, content, selectedFiles); // selectedFiles 추가
      if (result.success) {
        setSuccessMessage(strings[language].postWritePage.successMessage);

        // 게시글 내용에서 언급된 ID 추출 및 알림 생성
        const mentionedIds = extractMentions(content);
        mentionedIds.forEach((mentionedId) => {
          if (mentionedId === CURRENT_USER_ID) {
            // 현재 사용자가 언급된 경우 (자신에게 알림)
            // 임시 게시글 ID (실제로는 서버에서 반환된 게시글 ID 사용)
            const postId = result.data?.postId || "dummy-1"; // createPost 응답에서 postId를 가져오거나 더미 사용
            addNotification({
              id: `post-notif-${Date.now()}-${mentionedId}`,
              type: "post-mention",
              message: `${strings[language].postDetailPage.mentionedInPost}${CURRENT_USER_ID}${strings[language].postDetailPage.mentionedYou}`,
              postId: postId, // 알림 클릭 시 이동할 게시글 ID
              read: false,
              timestamp: new Date().toISOString(),
            });
          }
          // TODO: 실제 앱에서는 여기에 언급된 다른 사용자에게 알림을 보내는 로직 (예: 서버 API 호출) 추가
        });

        // 성공 후 커뮤니티 페이지로 이동
        setTimeout(() => {
          navigate("/community");
        }, 1500); // 1.5초 후 이동
      } else {
        setError(
          result.message || strings[language].postWritePage.errorMessage
        );
      }
    } catch (err) {
      console.error("게시글 작성 오류:", err);
      setError(strings[language].postWritePage.fetchError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-20">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          {strings[language].postWritePage.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* 제목 라벨 색상을 text-white로 변경하여 가시성을 높였습니다. */}
            <label
              htmlFor="postTitle"
              className="block text-white text-sm font-semibold mb-2"
            >
              {strings[language].postWritePage.postTitleLabel}
            </label>
            <input
              type="text"
              id="postTitle"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={strings[language].postWritePage.postTitlePlaceholder}
              disabled={loading}
            />
          </div>

          <div>
            {/* 내용 라벨 색상을 text-white로 변경하여 가시성을 높였습니다. */}
            <label
              htmlFor="postContent"
              className="block text-white text-sm font-semibold mb-2"
            >
              {strings[language].postWritePage.postContentLabel}
            </label>
            <textarea
              id="postContent"
              rows="10"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none resize-y"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                strings[language].postWritePage.postContentPlaceholder
              }
              disabled={loading}
            ></textarea>
          </div>

          {/* 파일 첨부 섹션 */}
          <div>
            <label
              htmlFor="postFiles"
              className="block text-gray-300 text-sm font-semibold mb-2"
            >
              {strings[language].postWritePage.fileLabel}{" "}
              {/* fileUploadLabel 대신 fileLabel 사용 */}
            </label>
            <input
              type="file"
              id="postFiles"
              multiple // 여러 파일 선택 가능
              onChange={handleFileChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />
            {selectedFiles.length > 0 && (
              <div className="mt-2">
                {/* 누적 파일 수를 표시하는 텍스트 색상을 text-white로 변경했습니다. */}
                <p className="text-white text-sm mt-3">
                  {strings[language].postWritePage.filesSelected}:{" "}
                  {selectedFiles.length}개
                </p>
                <ul className="text-gray-300 text-sm list-disc pl-5 mt-1">
                  {selectedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between mt-1"
                    >
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.name)}
                        className="ml-2 text-red-400 hover:text-red-600 text-xs"
                      >
                        {strings[language].postWritePage.removeFile}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {strings[language].postWritePage.fileUploadNote}
            </p>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          {successMessage && (
            <p className="text-green-500 text-center">{successMessage}</p>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/community")}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200"
              disabled={loading}
            >
              {strings[language].postWritePage.cancelButton}
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200"
              disabled={loading}
            >
              {loading
                ? strings[language].postWritePage.submitting
                : strings[language].postWritePage.submitButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
