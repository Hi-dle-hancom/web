import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import dummyPostContentUrl from "../assets/dummy_post.txt";
import { addNotification } from "../utils/notification";
import {
  getComments,
  addCommentToStore,
  addReplyToStore,
  subscribeToComments,
  deleteCommentFromStore,
  deleteReplyFromStore,
} from "../utils/comments-data";
import "../index.css"; // CSS 파일 import

const CURRENT_USER_ID = "currentUser123";

const highlightMentions = (text) => {
  const mentionRegex = /@([a-zA-Z0-9_.]+)/g;
  return text.split(mentionRegex).map((part, index) => {
    if (index % 2 === 1) {
      return (
        <React.Fragment key={index}>
          <span className="mention-highlight-blue">@</span>
          <span className="mention-highlight-blue mention-underline">
            {part}
          </span>
        </React.Fragment>
      );
    }
    return part;
  });
};

const extractMentions = (text) => {
  const mentionRegex = /@([a-zA-Z0-9_.]+)/g;
  const matches = [...text.matchAll(mentionRegex)];
  return matches.map((match) => match[1]);
};

const Comment = ({ comment, onReply, setCommentRef, onDelete }) => {
  const { language } = useLanguage();
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleDeleteClick = () => {
    onDelete(comment.id, comment.parentId);
  };

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  return (
    <div
      ref={(el) => {
        setCommentRef(el, comment.id);
      }}
      className="comment-card p-4 rounded-lg shadow-md mb-4"
    >
      <div className="flex items-center mb-2">
        <span className="comment-author-id font-bold mr-2">
          {comment.authorId}
        </span>
        <span className="comment-date-text text-sm">
          {new Date(comment.timestamp).toLocaleString(
            language === "ko" ? "ko-KR" : "en-US"
          )}
        </span>
        {comment.authorId === CURRENT_USER_ID && (
          <button
            onClick={handleDeleteClick}
            className="ml-auto comment-delete-button text-xs transition duration-200"
          >
            {strings[language].communityPage.deleteButton || "삭제"}
          </button>
        )}
      </div>
      <p className="comment-content text-gray-200 mb-2 whitespace-pre-wrap">
        {highlightMentions(comment.content)}
      </p>
      <button
        onClick={() => setShowReplyInput(!showReplyInput)}
        className="comment-reply-button text-sm"
      >
        {strings[language].communityPage.addComment}
      </button>

      {showReplyInput && (
        <div className="mt-3">
          <div className="flex">
            <textarea
              className="flex-grow p-2 rounded-lg text-white border outline-none resize-y reply-textarea"
              rows="2"
              placeholder={`@${comment.authorId} ${strings[language].communityPage.enterComment}`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
            <button
              onClick={handleReplySubmit}
              className="ml-2 font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 reply-submit-button"
            >
              {strings[language].communityPage.commentButton}
            </button>
          </div>
          {replyText.trim() && (
            <div className="mt-2 p-2 rounded-lg text-sm comment-preview">
              <p className="font-semibold mention-preview-label mb-1">
                {strings[language].postDetailPage.mentionPreviewLabel}:
              </p>
              <p className="whitespace-pre-wrap">
                {highlightMentions(replyText)}
              </p>
            </div>
          )}
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="ml-6 mt-4 border-l pl-4 replies-container">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              setCommentRef={setCommentRef}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const { language } = useLanguage();

  const [post, setPost] = useState(null);
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedContent, setTranslatedContent] = useState("");
  const [isTranslated, setIsTranslated] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [translationError, setTranslationError] = useState(null);
  const [postFound, setPostFound] = useState(true);

  const [comments, setComments] = useState(getComments());
  const [newCommentText, setNewCommentText] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const commentRefs = useRef({});
  const scrollTimeoutRef = useRef(null);
  const pendingScrollId = useRef(null);
  const scrollRetryCount = useRef(0);
  const MAX_SCROLL_RETRIES = 30;

  const performScroll = useCallback((commentId) => {
    const element = commentRefs.current[commentId];
    if (element) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      pendingScrollId.current = null;
      scrollRetryCount.current = 0;
      console.log(`[PostDetailPage] 댓글 ID ${commentId}로 스크롤 시도 성공.`);
    } else if (scrollRetryCount.current < MAX_SCROLL_RETRIES) {
      scrollRetryCount.current++;
      console.warn(
        `[PostDetailPage] 댓글 ID ${commentId} 요소를 찾을 수 없습니다. 재시도 ${scrollRetryCount.current}/${MAX_SCROLL_RETRIES}...`
      );
      scrollTimeoutRef.current = setTimeout(() => {
        performScroll(commentId);
      }, 50 + scrollRetryCount.current * 50);
    } else {
      console.error(
        `[PostDetailPage] 댓글 ID ${commentId} 요소를 ${MAX_SCROLL_RETRIES}번 재시도 후에도 찾을 수 없습니다.`
      );
      pendingScrollId.current = null;
      scrollRetryCount.current = 0;
    }
  }, []);

  const setCommentRef = useCallback(
    (el, id) => {
      if (el) {
        commentRefs.current[id] = el;
        if (pendingScrollId.current === id) {
          performScroll(id);
        }
      } else {
        delete commentRefs.current[id];
      }
    },
    [performScroll]
  );

  useEffect(() => {
    const unsubscribe = subscribeToComments((updatedComments) => {
      setComments(updatedComments);
      console.log(
        "[PostDetailPage] 댓글 데이터 업데이트 감지됨",
        updatedComments
      );
      if (pendingScrollId.current) {
        performScroll(pendingScrollId.current);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [performScroll]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log(`[PostDetailPage] URL 해시 변경 감지됨. 현재 해시: ${hash}`);

      if (hash.startsWith("#comment-")) {
        const commentId = hash.substring(9);
        pendingScrollId.current = commentId;
        scrollRetryCount.current = 0;

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          performScroll(commentId);
        }, 100);
      } else {
        pendingScrollId.current = null;
        scrollRetryCount.current = 0;
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [performScroll]);

  useEffect(() => {
    const loadDummyPost = async () => {
      if (postId === "dummy-1") {
        try {
          const response = await fetch(dummyPostContentUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const textContent = await response.text();

          const lines = textContent.split("\n");
          const title = lines[0].trim();
          const content = lines.slice(2).join("\n").trim();

          setPost({
            id: "dummy-1",
            author: "한국인 사용자",
            date: "2023-10-26",
            views: 123,
            title: title,
            content: content,
          });
          setPostFound(true);
        } catch (error) {
          console.error("Failed to load dummy post content:", error);
          setPost(null);
          setPostFound(false);
        }
      } else {
        setPost(null);
        setPostFound(false);
      }

      setTranslatedTitle("");
      setTranslatedContent("");
      setIsTranslated(false);
      setTranslationError(null);
    };

    loadDummyPost();
  }, [postId]);

  const translateText = async (text, targetLanguage = "English") => {
    try {
      const chatHistory = [];
      chatHistory.push({
        role: "user",
        parts: [
          {
            text: `Translate the following Korean text to ${targetLanguage}: ${text}`,
          },
        ],
      });
      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        return result.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Translation response is empty or malformed.");
      }
    } catch (error) {
      console.error("Translation API error:", error);
      throw new Error(strings[language].postDetailPage.translationError);
    }
  };

  const handleTranslate = async () => {
    if (!post) return;

    setLoadingTranslation(true);
    setTranslationError(null);

    try {
      const translatedTitleResult = await translateText(post.title, "English");
      const translatedContentResult = await translateText(
        post.content,
        "English"
      );

      setTranslatedTitle(translatedTitleResult);
      setTranslatedContent(translatedContentResult);
      setIsTranslated(true);
    } catch (err) {
      setTranslationError(err.message);
    } finally {
      setLoadingTranslation(false);
    }
  };

  const handleShowOriginal = () => {
    setIsTranslated(false);
    setTranslatedTitle("");
    setTranslatedContent("");
  };

  const handleAddComment = () => {
    if (newCommentText.trim()) {
      const newComment = {
        id: `comment${Date.now()}`,
        authorId: CURRENT_USER_ID,
        content: newCommentText,
        timestamp: new Date().toISOString(),
        parentId: null,
        replies: [],
      };
      addCommentToStore(newComment);
      setNewCommentText("");

      const mentionedIds = extractMentions(newCommentText);
      mentionedIds.forEach((mentionedId) => {
        if (mentionedId === CURRENT_USER_ID) {
          addNotification({
            id: `notif-${Date.now()}-${mentionedId}`,
            type: "mention",
            message: `${strings[language].postDetailPage.mentionedInComment}${newComment.authorId}${strings[language].postDetailPage.mentionedYou}`,
            commentId: newComment.id,
            postId: postId,
            read: false,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }
  };

  const handleDeleteComment = useCallback((commentId, parentId) => {
    setCommentToDelete({ id: commentId, parentId: parentId });
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeleteAction = useCallback(() => {
    if (commentToDelete) {
      if (commentToDelete.parentId) {
        deleteReplyFromStore(commentToDelete.id, commentToDelete.parentId);
      } else {
        deleteCommentFromStore(commentToDelete.id);
      }
      setCommentToDelete(null);
      setShowDeleteConfirm(false);
    }
  }, [commentToDelete]);

  const cancelDeleteAction = useCallback(() => {
    setCommentToDelete(null);
    setShowDeleteConfirm(false);
  }, []);

  const handleReply = (parentId, replyContent) => {
    if (replyContent.trim()) {
      const newReply = {
        id: `reply${Date.now()}`,
        authorId: CURRENT_USER_ID,
        content: replyContent,
        timestamp: new Date().toISOString(),
        parentId: parentId,
        replies: [],
      };
      addReplyToStore(parentId, newReply);

      const mentionedIds = extractMentions(replyContent);
      mentionedIds.forEach((mentionedId) => {
        if (mentionedId === CURRENT_USER_ID) {
          addNotification({
            id: `notif-${Date.now()}-${mentionedId}`,
            type: "mention",
            message: `${strings[language].postDetailPage.mentionedInComment}${newReply.authorId}${strings[language].postDetailPage.mentionedYou}`,
            commentId: newReply.id,
            postId: postId,
            read: false,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }
  };

  if (!postFound) {
    return (
      <div className="min-h-screen flex items-center justify-center post-detail-page-container">
        <p className="text-2xl post-not-found-text">
          게시글을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center post-detail-page-container">
        <p className="loading-text">게시글을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-20 post-detail-page-container">
      <div className="max-w-4xl mx-auto p-8 rounded-lg shadow-xl post-content-area">
        {/* 목록으로 돌아가기 버튼 추가 */}
        <button
          onClick={() => navigate("/community")}
          className="mb-6 font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 back-to-list-button"
        >
          {strings[language].communityPage.backToList}
        </button>

        <h1 className="text-3xl font-bold text-center mb-6 post-title">
          {isTranslated ? translatedTitle : post.title}
        </h1>

        <div className="text-sm mb-4 flex justify-between items-center post-meta-info">
          <span>작성자: {post.author}</span>
          <span>작성일: {post.date}</span>
          <span>조회수: {post.views}</span>
        </div>

        {language === "en" && (
          <button
            onClick={isTranslated ? handleShowOriginal : handleTranslate}
            className="font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mb-4 translate-button"
            disabled={loadingTranslation}
          >
            {loadingTranslation
              ? strings[language].postDetailPage.loadingTranslation
              : isTranslated
              ? strings[language].postDetailPage.showOriginalButton
              : strings[language].postDetailPage.translateButton}
          </button>
        )}

        {translationError && (
          <p className="text-center mb-4 translation-error-text">
            {translationError}
          </p>
        )}

        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed whitespace-pre-wrap post-content-text">
            {isTranslated ? translatedContent : post.content}
          </p>
        </div>

        <div className="mt-8 pt-6 comments-section">
          <h2 className="text-2xl font-semibold mb-4 comments-title">
            {strings[language].communityPage.comments}
          </h2>

          <div className="mb-6">
            <div className="flex">
              <textarea
                className="flex-grow p-3 rounded-lg text-white border outline-none resize-y new-comment-textarea"
                rows="3"
                placeholder={strings[language].communityPage.enterComment}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              ></textarea>
              <button
                onClick={handleAddComment}
                className="ml-4 font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 add-comment-button"
              >
                {strings[language].communityPage.commentButton}
              </button>
            </div>
            {newCommentText.trim() && (
              <div className="mt-2 p-3 rounded-lg text-sm comment-preview">
                <p className="font-semibold mention-preview-label mb-1">
                  {strings[language].postDetailPage.mentionPreviewLabel}:
                </p>
                <p className="whitespace-pre-wrap">
                  {highlightMentions(newCommentText)}
                </p>
              </div>
            )}
          </div>

          <div>
            {comments.length === 0 ? (
              <p className="no-comments-text">아직 댓글이 없습니다.</p>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  setCommentRef={setCommentRef}
                  onDelete={handleDeleteComment}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 delete-confirm-modal-overlay">
          <div className="p-6 rounded-lg shadow-xl max-w-sm w-full text-center delete-confirm-modal-content">
            <p className="text-lg mb-4 delete-confirm-text">
              {strings[language].communityPage.confirmDelete ||
                "정말 삭제하시겠습니까?"}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDeleteAction}
                className="font-bold py-2 px-4 rounded-lg transition duration-200 confirm-delete-button"
              >
                {strings[language].communityPage.yesButton || "예"}
              </button>
              <button
                onClick={cancelDeleteAction}
                className="font-bold py-2 px-4 rounded-lg transition duration-200 cancel-delete-button"
              >
                {strings[language].communityPage.noButton || "아니오"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
