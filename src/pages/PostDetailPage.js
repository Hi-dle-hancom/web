// src/pages/PostDetailPage.js
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
} from "../utils/comments-data"; // 삭제 함수 임포트

const CURRENT_USER_ID = "currentUser123";

const highlightMentions = (text) => {
  const mentionRegex = /@([a-zA-Z0-9_.]+)/g;
  return text.split(mentionRegex).map((part, index) => {
    if (index % 2 === 1) {
      return (
        <React.Fragment key={index}>
          <span className="text-blue-400 font-semibold">@</span>
          <span className="text-blue-400 font-semibold underline">{part}</span>
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
  // onDelete prop 추가
  const { language } = useLanguage();
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleDeleteClick = () => {
    // onDelete prop을 통해 PostDetailPage의 handleDeleteComment 호출
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
        // console.log(`[Comment Component] Ref set for ID: ${comment.id}, Element:`, el); // Console log removed
      }}
      className="bg-gray-700 p-4 rounded-lg shadow-md mb-4"
    >
      <div className="flex items-center mb-2">
        <span className="font-bold text-blue-300 mr-2">{comment.authorId}</span>
        <span className="text-gray-400 text-sm">
          {new Date(comment.timestamp).toLocaleString(
            language === "ko" ? "ko-KR" : "en-US"
          )}
        </span>
        {/* 작성자가 현재 사용자와 일치할 경우에만 삭제 버튼 표시 */}
        {comment.authorId === CURRENT_USER_ID && (
          <button
            onClick={handleDeleteClick}
            className="ml-auto text-gray-400 text-xs hover:text-red-400 transition duration-200"
          >
            {strings[language].communityPage.deleteButton || "삭제"}
          </button>
        )}
      </div>
      <p className="text-gray-200 mb-2 whitespace-pre-wrap">
        {highlightMentions(comment.content)}
      </p>
      <button
        onClick={() => setShowReplyInput(!showReplyInput)}
        className="text-blue-400 hover:text-blue-300 text-sm"
      >
        {strings[language].communityPage.addComment}
      </button>

      {showReplyInput && (
        <div className="mt-3">
          <div className="flex">
            <textarea
              className="flex-grow p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 outline-none resize-y"
              rows="2"
              placeholder={`@${comment.authorId} ${strings[language].communityPage.enterComment}`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
            <button
              onClick={handleReplySubmit}
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200"
            >
              {strings[language].communityPage.commentButton}
            </button>
          </div>
          {replyText.trim() && (
            <div className="mt-2 p-2 bg-gray-600 rounded-lg text-gray-200 text-sm">
              <p className="font-semibold text-gray-400 mb-1">
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
        <div className="ml-6 mt-4 border-l border-gray-600 pl-4">
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

  // comments 상태의 초기값을 getComments()로 설정하여 getComments를 활용합니다.
  const [comments, setComments] = useState(getComments());
  const [newCommentText, setNewCommentText] = useState("");

  // 삭제 확인 모달 관련 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null); // { id, parentId }

  const commentRefs = useRef({});
  const scrollTimeoutRef = useRef(null); // To store timeout ID for clearing
  const pendingScrollId = useRef(null); // To store the ID of the comment to scroll to
  const scrollRetryCount = useRef(0); // To manage retry attempts
  const MAX_SCROLL_RETRIES = 30; // Max retry attempts for scrolling

  // 스크롤을 수행하는 재사용 가능한 함수
  const performScroll = useCallback((commentId) => {
    const element = commentRefs.current[commentId];
    if (element) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      pendingScrollId.current = null;
      scrollRetryCount.current = 0; // 성공 시 재시도 카운트 초기화
      console.log(`[PostDetailPage] 댓글 ID ${commentId}로 스크롤 시도 성공.`);
    } else if (scrollRetryCount.current < MAX_SCROLL_RETRIES) {
      scrollRetryCount.current++;
      console.warn(
        `[PostDetailPage] 댓글 ID ${commentId} 요소를 찾을 수 없습니다. 재시도 ${scrollRetryCount.current}/${MAX_SCROLL_RETRIES}...`
      );
      scrollTimeoutRef.current = setTimeout(() => {
        performScroll(commentId); // 재귀 호출
      }, 50 + scrollRetryCount.current * 50); // 점진적으로 지연 시간 증가
    } else {
      console.error(
        `[PostDetailPage] 댓글 ID ${commentId} 요소를 ${MAX_SCROLL_RETRIES}번 재시도 후에도 찾을 수 없습니다.`
      );
      pendingScrollId.current = null;
      scrollRetryCount.current = 0; // 최대 재시도 도달 시 카운트 초기화
    }
  }, []); // 의존성 없음: commentRefs는 ref이므로 변경되지 않음

  const setCommentRef = useCallback(
    (el, id) => {
      if (el) {
        commentRefs.current[id] = el;
        // console.log(`[PostDetailPage] 댓글 DOM 요소 등록됨 - ID: ${id}`); // Console log removed
        // If this ref is for the pending scroll target, attempt to scroll immediately
        if (pendingScrollId.current === id) {
          performScroll(id); // ref가 설정되면 즉시 스크롤 시도
        }
      } else {
        delete commentRefs.current[id];
        // console.log(`[PostDetailPage] 댓글 DOM 요소 제거됨 - ID: ${id}`); // Console log removed
      }
    },
    [performScroll]
  ); // performScroll 함수를 의존성으로 추가

  // 댓글 데이터 구독
  useEffect(() => {
    const unsubscribe = subscribeToComments((updatedComments) => {
      setComments(updatedComments);
      console.log(
        "[PostDetailPage] 댓글 데이터 업데이트 감지됨",
        updatedComments
      );

      // 댓글 업데이트 후, 만약 스크롤 대상이 있다면 스크롤 시도
      if (pendingScrollId.current) {
        performScroll(pendingScrollId.current);
      }
    });

    // 컴포넌트 언마운트 시 구독 해지
    return () => {
      unsubscribe();
    };
  }, [performScroll]); // performScroll 함수를 의존성으로 추가

  // URL 해시(#comment-ID) 변경 시 스크롤 처리
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log(`[PostDetailPage] URL 해시 변경 감지됨. 현재 해시: ${hash}`);

      if (hash.startsWith("#comment-")) {
        const commentId = hash.substring(9);
        pendingScrollId.current = commentId; // 스크롤 대상 ID 설정
        scrollRetryCount.current = 0; // 새 스크롤 요청이므로 재시도 카운트 초기화

        // React가 DOM을 업데이트할 시간을 주기 위해 약간 지연 후 스크롤 시도
        // (performScroll 내부에서 재시도 로직을 가짐)
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          performScroll(commentId);
        }, 100); // 해시 변경 시 100ms 지연
      } else {
        pendingScrollId.current = null; // 해시가 없으면 스크롤 대상 초기화
        scrollRetryCount.current = 0;
      }
    };

    // hashchange 이벤트 리스너 등록
    window.addEventListener("hashchange", handleHashChange);

    // 컴포넌트 언마운트 시 이벤트 리스너 및 타이머 정리
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [performScroll]); // performScroll 함수를 의존성으로 추가

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

  // 새 댓글 추가 핸들러
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
      addCommentToStore(newComment); // 전역 댓글 저장소에 추가
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

  // 댓글 또는 답글 삭제 확인 모달 열기 핸들러
  const handleDeleteComment = useCallback((commentId, parentId) => {
    setCommentToDelete({ id: commentId, parentId: parentId });
    setShowDeleteConfirm(true);
  }, []);

  // 삭제 실행 핸들러 (모달의 "예" 버튼 클릭 시)
  const confirmDeleteAction = useCallback(() => {
    if (commentToDelete) {
      if (commentToDelete.parentId) {
        // 답글 삭제
        deleteReplyFromStore(commentToDelete.id, commentToDelete.parentId);
      } else {
        // 최상위 댓글 삭제
        deleteCommentFromStore(commentToDelete.id);
      }
      setCommentToDelete(null);
      setShowDeleteConfirm(false);
    }
  }, [commentToDelete]);

  // 삭제 취소 핸들러 (모달의 "아니오" 버튼 클릭 시)
  const cancelDeleteAction = useCallback(() => {
    setCommentToDelete(null);
    setShowDeleteConfirm(false);
  }, []);

  // 대댓글 추가 핸들러 (재귀적으로 댓글 트리를 업데이트)
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
      addReplyToStore(parentId, newReply); // 전역 댓글 저장소에 답글 추가

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
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-20">
        <p className="text-2xl">게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-20">
        <p>게시글을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-20">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
        {/* 목록으로 돌아가기 버튼 추가 */}
        <button
          onClick={() => navigate("/community")}
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200"
        >
          {strings[language].communityPage.backToList}
        </button>

        <h1 className="text-3xl font-bold text-center mb-6">
          {isTranslated ? translatedTitle : post.title}
        </h1>

        <div className="text-gray-400 text-sm mb-4 flex justify-between items-center">
          <span>작성자: {post.author}</span>
          <span>작성일: {post.date}</span>
          <span>조회수: {post.views}</span>
        </div>

        {language === "en" && (
          <button
            onClick={isTranslated ? handleShowOriginal : handleTranslate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mb-4"
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
          <p className="text-red-500 text-center mb-4">{translationError}</p>
        )}

        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {isTranslated ? translatedContent : post.content}
          </p>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6">
          <h2 className="text-2xl font-semibold mb-4">
            {strings[language].communityPage.comments}
          </h2>

          <div className="mb-6">
            <div className="flex">
              <textarea
                className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none resize-y"
                rows="3"
                placeholder={strings[language].communityPage.enterComment}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              ></textarea>
              <button
                onClick={handleAddComment}
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200"
              >
                {strings[language].communityPage.commentButton}
              </button>
            </div>
            {newCommentText.trim() && (
              <div className="mt-2 p-3 bg-gray-700 rounded-lg text-gray-200 text-sm">
                <p className="font-semibold text-gray-400 mb-1">
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
              <p className="text-gray-400">아직 댓글이 없습니다.</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <p className="text-white text-lg mb-4">
              {strings[language].communityPage.confirmDelete ||
                "정말 삭제하시겠습니까?"}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDeleteAction}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                {strings[language].communityPage.yesButton || "예"}
              </button>
              <button
                onClick={cancelDeleteAction}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
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
