// src/pages/CommunityPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import { getPosts as fetchPosts } from "../api/communityService"; // communityService에서 getPosts를 fetchPosts로 임포트
import dummyPostContentUrl from "../assets/dummy_post.txt"; // 더미 txt 파일의 URL 임포트

const POSTS_PER_PAGE = 5; // 한 페이지당 게시글 수

export default function CommunityPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 길게 클릭 감지를 위한 ref들
  const pressTimer = useRef(null);
  const isLongPress = useRef(false);
  const currentPressPostId = useRef(null);

  // 게시글을 불러오는 함수를 useCallback으로 메모이제이션
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let dummyPost = null;
    try {
      // dummy_post.txt 파일의 실제 내용을 fetch로 불러옵니다.
      const response = await fetch(dummyPostContentUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const textContent = await response.text();
      const lines = textContent.split("\n");
      const dummyTitle = lines[0].trim(); // 첫 번째 줄을 제목으로 사용
      const dummyContent = lines.slice(2).join("\n").trim(); // 세 번째 줄부터 본문으로 사용

      dummyPost = {
        id: "dummy-1", // 고유한 더미 ID를 부여하여 실제 데이터와 충돌 방지
        author: "테스트 사용자",
        title: dummyTitle,
        content: dummyContent, // 본문 내용을 여기에 포함 (PostDetailPage에서 사용)
        creationDate: "2023-10-26",
        views: 999,
      };
    } catch (err) {
      console.error(
        "Failed to load dummy post content for CommunityPage:",
        err
      );
      // 더미 게시글 내용을 불러오지 못했을 때의 대체 데이터
      dummyPost = {
        id: "dummy-1",
        author: "테스트 사용자",
        title: "더미 게시글 (내용 로드 실패)", // 대체 제목
        content: "더미 게시글 내용을 불러올 수 없습니다.",
        creationDate: "2023-10-26",
        views: 0,
      };
    }

    try {
      // communityService에서 실제 API를 통해 게시글을 가져옵니다.
      const result = await fetchPosts(currentPage, POSTS_PER_PAGE);
      if (result.success) {
        // 실제 게시글과 더미 게시글을 합쳐서 표시
        // 더미 게시글을 목록의 맨 앞에 추가
        setPosts([dummyPost, ...result.data.posts]);
        // totalPages는 실제 API 응답에 따라 달라질 수 있으므로, 더미 데이터 추가 후에는
        // 실제 totalPages를 기반으로 하되, 더미 데이터로 인해 페이지 수가 늘어날 수 있음을 고려해야 합니다.
        // 여기서는 간단히 API 응답의 totalPages를 사용합니다.
        setTotalPages(result.data.totalPages);
      } else {
        setError(result.message);
        // API 호출 실패 시 더미 게시글만 표시
        setPosts([dummyPost]);
        setTotalPages(1); // 더미 게시글만 있을 경우 총 페이지를 1로 설정
      }
    } catch (err) {
      // 에러 발생 시 사용자에게 표시할 메시지를 설정합니다.
      setError(
        strings[language].communityPage.fetchError ||
          "게시글을 불러오는 중 오류가 발생했습니다."
      );
      console.error("게시글 불러오기 오류:", err);
      // 에러 발생 시 더미 게시글만 표시
      setPosts([dummyPost]);
      setTotalPages(1); // 더미 게시글만 있을 경우 총 페이지를 1로 설정
    } finally {
      setLoading(false);
    }
  }, [currentPage, language]); // currentPage와 language가 변경될 때마다 함수 재생성

  // 컴포넌트 마운트 시 및 loadPosts 함수가 변경될 때 게시글을 불러옵니다.
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 게시글 작성 버튼 클릭 핸들러
  const handleWriteClick = () => {
    navigate("/community/write");
  };

  // 게시글 클릭 핸들러 (PostDetailPage로 이동)
  const handlePostClick = useCallback(
    (postId) => {
      // 이 함수는 짧게 클릭했을 때만 호출됩니다.
      console.log(`[CommunityPage] Navigating to post: ${postId}`);
      navigate(`/community/${postId}`);
    },
    [navigate]
  );

  // 길게 누르기 타이머 시작
  const startPressTimer = useCallback((postId) => {
    currentPressPostId.current = postId;
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      console.log(`[CommunityPage] Long press detected for post: ${postId}`);
      // 길게 눌렀을 때 시각적 피드백을 여기에 추가할 수 있습니다.
    }, 500); // 2초
  }, []);

  // 길게 누르기 타이머 초기화
  const clearPressTimer = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    isLongPress.current = false;
    currentPressPostId.current = null;
  }, []);

  // 마우스 클릭 시작 핸들러
  const handleMouseDown = useCallback(
    (e, postId) => {
      // 왼쪽 클릭(기본 버튼)일 때만 타이머 시작
      if (e.button === 0) {
        startPressTimer(postId);
      }
    },
    [startPressTimer]
  );

  // 마우스 클릭 해제 핸들러
  const handleMouseUp = useCallback(
    (e, postId) => {
      if (e.button === 0) {
        if (!isLongPress.current && currentPressPostId.current === postId) {
          handlePostClick(postId); // 짧게 클릭했을 때만 이동
        }
        clearPressTimer();
      }
    },
    [clearPressTimer, handlePostClick]
  );

  // 터치 시작 핸들러
  const handleTouchStart = useCallback(
    (e, postId) => {
      startPressTimer(postId);
    },
    [startPressTimer]
  );

  // 터치 종료 핸들러
  const handleTouchEnd = useCallback(
    (e, postId) => {
      if (!isLongPress.current && currentPressPostId.current === postId) {
        handlePostClick(postId); // 짧게 터치했을 때만 이동
      }
      clearPressTimer();
    },
    [clearPressTimer, handlePostClick]
  );

  // 페이지네이션 번호를 생성하는 함수
  const getPaginationNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i);
    }
    return numbers;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-20">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          {strings[language].communityPage.title}
        </h1>

        <div className="flex justify-between items-center mb-6">
          <span className="text-lg text-gray-300">
            {strings[language].communityPage.totalPosts}: {posts.length}
          </span>
          {/* 실제 총 게시글 수는 API 응답에서 가져와야 함 */}
          <button
            onClick={handleWriteClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200"
          >
            {strings[language].communityPage.writeButton}
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">
            {strings[language].communityPage.loading ||
              "게시글을 불러오는 중..."}
          </p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400">
            {strings[language].communityPage.noPosts}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg shadow-lg">
              <thead>
                <tr className="bg-gray-600 text-gray-300 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">제목</th>
                  <th className="py-3 px-6 text-left">
                    {strings[language].communityPage.author}
                  </th>
                  <th className="py-3 px-6 text-center">
                    {strings[language].communityPage.views}
                  </th>
                  <th className="py-3 px-6 text-center">
                    {strings[language].communityPage.creationDate}{" "}
                    {/* date 대신 creationDate 사용 */}
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-200 text-sm font-light">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-gray-600 hover:bg-gray-600 transition duration-150 cursor-pointer"
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
              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {strings[language].communityPage.firstPage || "처음"}
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            {getPaginationNumbers().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === pageNumber
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {strings[language].communityPage.lastPage || "마지막"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
