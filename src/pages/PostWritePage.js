import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import { createPost } from "../api/communityService";
import { addNotification } from "../utils/notification";
import "../index.css"; // CSS 파일 import

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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    console.log(
      "새로 선택된 파일:",
      newFiles.map((f) => f.name)
    );

    setSelectedFiles((prevFiles) => {
      const existingFileNames = new Set(prevFiles.map((file) => file.name));
      const uniqueNewFiles = newFiles.filter(
        (file) => !existingFileNames.has(file.name)
      );
      const updatedFiles = [...prevFiles, ...uniqueNewFiles];
      console.log(
        "현재 누적된 파일 (중복 제거 후):",
        updatedFiles.map((f) => f.name)
      );
      return updatedFiles;
    });
  };

  const handleRemoveFile = (fileNameToRemove) => {
    setSelectedFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter(
        (file) => file.name !== fileNameToRemove
      );
      console.log(
        "파일 제거 후 누적된 파일:",
        updatedFiles.map((f) => f.name)
      );
      return updatedFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!title.trim() || !content.trim()) {
      setError(strings[language].postWritePage.alertFillAllFields);
      setLoading(false);
      return;
    }

    try {
      const result = await createPost(title, content, selectedFiles);
      if (result.success) {
        setSuccessMessage(strings[language].postWritePage.successMessage);

        const mentionedIds = extractMentions(content);
        mentionedIds.forEach((mentionedId) => {
          if (mentionedId === CURRENT_USER_ID) {
            const postId = result.data?.postId || "dummy-1";
            addNotification({
              id: `post-notif-${Date.now()}-${mentionedId}`,
              type: "post-mention",
              message: `${strings[language].postDetailPage.mentionedInPost}${CURRENT_USER_ID}${strings[language].postDetailPage.mentionedYou}`,
              postId: postId,
              read: false,
              timestamp: new Date().toISOString(),
            });
          }
        });

        setTimeout(() => {
          navigate("/community");
        }, 1500);
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
    <div className="min-h-screen p-20 write-page-container">
      <div className="max-w-4xl mx-auto p-8 rounded-lg shadow-xl write-form-card">
        <h1 className="text-3xl font-bold text-center mb-6 write-page-title">
          {strings[language].postWritePage.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="postTitle"
              className="block text-sm font-semibold mb-2 label-text"
            >
              {strings[language].postWritePage.postTitleLabel}
            </label>
            <input
              type="text"
              id="postTitle"
              className="w-full p-3 rounded-lg border outline-none text-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={strings[language].postWritePage.postTitlePlaceholder}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="postContent"
              className="block text-sm font-semibold mb-2 label-text"
            >
              {strings[language].postWritePage.postContentLabel}
            </label>
            <textarea
              id="postContent"
              rows="10"
              className="w-full p-3 rounded-lg border outline-none resize-y text-input"
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
              className="block text-sm font-semibold mb-2 file-label"
            >
              {strings[language].postWritePage.fileLabel}{" "}
            </label>
            <input
              type="file"
              id="postFiles"
              multiple
              onChange={handleFileChange}
              className="w-full p-3 rounded-lg border outline-none file-input"
              disabled={loading}
            />
            {selectedFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm mt-3 files-selected-text">
                  {strings[language].postWritePage.filesSelected}:{" "}
                  {selectedFiles.length}개
                </p>
                <ul className="text-sm list-disc pl-5 mt-1 selected-files-list">
                  {selectedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between mt-1"
                    >
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.name)}
                        className="ml-2 text-xs remove-file-button"
                      >
                        {strings[language].postWritePage.removeFile}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs mt-1 file-upload-note">
              {strings[language].postWritePage.fileUploadNote}
            </p>
          </div>

          {error && <p className="text-center error-message">{error}</p>}

          {successMessage && (
            <p className="text-center success-message">{successMessage}</p>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/community")}
              className="font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 cancel-button"
              disabled={loading}
            >
              {strings[language].postWritePage.cancelButton}
            </button>
            <button
              type="submit"
              className="font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 submit-button"
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
