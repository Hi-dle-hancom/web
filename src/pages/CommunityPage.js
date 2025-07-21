import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import { getPosts as fetchPosts } from "../api/communityService";
import dummyPostContentUrl from "../assets/dummy_post.txt";
import "../index.css"; // CSS 파일 import

const POSTS_PER_PAGE = 5; // 한 페이지당 게시글 수

export default function CommunityPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pressTimer = useRef(null);
  const isLongPress = useRef(false);
  const currentPressPostId = useRef(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let dummyPost = null;
    try {
      const response = await fetch(dummyPostContentUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const textContent = await response.text();
      const lines = textContent.split("\n");
      const dummyTitle = lines[0].trim();
      const dummyContent = lines.slice(2).join("\n").trim();

      dummyPost = {
        id: "dummy-1",
        author: "테스트 사용자",
        title: dummyTitle,
        content: dummyContent,
        creationDate: "2023-10-26",
        views: 999,
      };
    } catch (err) {
      console.error(
        "Failed to load dummy post content for CommunityPage:",
        err
      );
      dummyPost = {
        id: "dummy-1",
        author: "테스트 사용자",
        title: "더미 게시글 (내용 로드 실패)",
        content: "더미 게시글 내용을 불러올 수 없습니다.",
        creationDate: "2023-10-26",
        views: 0,
      };
    }

    try {
      const result = await fetchPosts(currentPage, POSTS_PER_PAGE);
      if (result.success) {
        setPosts([dummyPost, ...result.data.posts]);
        setTotalPages(result.data.totalPages);
      } else {
        setError(result.message);
        setPosts([dummyPost]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(
        strings[language].communityPage.fetchError ||
          "게시글을 불러오는 중 오류가 발생했습니다."
      );
      console.error("게시글 불러오기 오류:", err);
      setPosts([dummyPost]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, language]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleWriteClick = () => {
    navigate("/community/write");
  };

  const handlePostClick = useCallback(
    (postId) => {
      console.log(`[CommunityPage] Navigating to post: ${postId}`);
      navigate(`/community/${postId}`);
    },
    [navigate]
  );

  const startPressTimer = useCallback((postId) => {
    currentPressPostId.current = postId;
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      console.log(`[CommunityPage] Long press detected for post: ${postId}`);
    }, 500);
  }, []);

  const clearPressTimer = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    isLongPress.current = false;
    currentPressPostId.current = null;
  }, []);

  const handleMouseDown = useCallback(
    (e, postId) => {
      if (e.button === 0) {
        startPressTimer(postId);
      }
    },
    [startPressTimer]
  );

  const handleMouseUp = useCallback(
    (e, postId) => {
      if (e.button === 0) {
        if (!isLongPress.current && currentPressPostId.current === postId) {
          handlePostClick(postId);
        }
        clearPressTimer();
      }
    },
    [clearPressTimer, handlePostClick]
  );

  const handleTouchStart = useCallback(
    (e, postId) => {
      startPressTimer(postId);
    },
    [startPressTimer]
  );

  const handleTouchEnd = useCallback(
    (e, postId) => {
      if (!isLongPress.current && currentPressPostId.current === postId) {
        handlePostClick(postId);
      }
      clearPressTimer();
    },
    [clearPressTimer, handlePostClick]
  );

  const getPaginationNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i);
    }
    return numbers;
  };

  return (
    <div className="min-h-screen p-20 community-page-container">
      <div className="max-w-4xl mx-auto p-8 rounded-lg shadow-xl community-content-area">
        <h1 className="text-3xl font-bold text-center mb-6 community-title">
          {strings[language].communityPage.title}
        </h1>

        <div className="flex justify-between items-center mb-6">
          <span className="text-lg community-total-posts-text">
            {strings[language].communityPage.totalPosts}: {posts.length}
          </span>
          <button
            onClick={handleWriteClick}
            className="font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 write-post-button"
          >
            {strings[language].communityPage.writeButton}
          </button>
        </div>

        {loading ? (
          <p className="text-center loading-text">
            {strings[language].communityPage.loading ||
              "게시글을 불러오는 중..."}
          </p>
        ) : error ? (
          <p className="text-center error-text">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center no-posts-text">
            {strings[language].communityPage.noPosts}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg shadow-lg community-table">
              <thead>
                <tr className="uppercase text-sm leading-normal table-header-row">
                  <th className="py-3 px-6 text-left">제목</th>
                  <th className="py-3 px-6 text-left">
                    {strings[language].communityPage.author}
                  </th>
                  <th className="py-3 px-6 text-center">
                    {strings[language].communityPage.views}
                  </th>
                  <th className="py-3 px-6 text-center">
                    {strings[language].communityPage.creationDate}{" "}
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b transition duration-150 cursor-pointer table-row-item"
                    onMouseDown={(e) => handleMouseDown(e, post.id)}
                    onMouseUp={(e) => handleMouseUp(e, post.id)}
                    onTouchStart={(e) => handleTouchStart(e, post.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, post.id)}
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <span className="font-medium">{post.title}</span>
                    </td>
                    <td className="py-3 px-6 text-left">{post.author}</td>
                    <td className="py-3 px-6 text-center">{post.views}</td>
                    <td className="py-3 px-6 text-center">
                      {post.creationDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 컨트롤 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg pagination-button"
            >
              {strings[language].communityPage.firstPage || "처음"}
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg pagination-button"
            >
              &lt;
            </button>
            {getPaginationNumbers().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === pageNumber
                    ? "pagination-button-active"
                    : "pagination-button"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg pagination-button"
            >
              &gt;
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg pagination-button"
            >
              {strings[language].communityPage.lastPage || "마지막"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
