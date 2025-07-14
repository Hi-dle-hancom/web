// src/api/communityService.js

const API_BASE_URL = "http://localhost:5000/api/community"; // 백엔드 커뮤니티 API의 기본 URL

/**
 * 게시글 목록을 가져오는 함수
 * @param {number} page - 요청할 페이지 번호 (기본값 1)
 * @param {number} limit - 한 페이지당 게시글 수 (기본값 5)
 * @returns {Promise<{success: boolean, data?: {posts: Array, totalPages: number, totalItems: number}, message?: string}>}
 */
export const getPosts = async (page = 1, limit = 5) => {
  try {
    // 백엔드에서 페이지네이션을 처리할 경우 쿼리 파라미터를 사용합니다.
    // 현재 백엔드(server.js)는 전체 더미 데이터를 반환하므로, 프론트엔드에서 페이지네이션을 처리하도록 구현합니다.
    const response = await fetch(`${API_BASE_URL}/posts`); // 백엔드에서 모든 게시글을 가져옴

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "게시글을 불러오는데 실패했습니다.");
    }
    const allPosts = await response.json(); // 백엔드로부터 모든 게시글 데이터 수신

    // 프론트엔드에서 페이지네이션 처리
    const startIndex = (page - 1) * limit;
    const paginatedPosts = allPosts.slice(startIndex, startIndex + limit);
    const totalItems = allPosts.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      data: {
        posts: paginatedPosts,
        totalPages: totalPages,
        totalItems: totalItems, // 전체 게시글 수 포함
      },
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      success: false,
      message: error.message || "네트워크 오류가 발생했습니다.",
    };
  }
};

/* 새 게시글을 생성하는 함수 (파일 업로드 지원)
 * @param {FormData} formData - 게시글 데이터 (title, content, author, file 등 포함)
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export const createPost = async (formData) => {
  // formData를 인수로 받음
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      // FormData를 사용할 때는 'Content-Type' 헤더를 명시적으로 설정하지 않습니다.
      // 브라우저가 자동으로 'multipart/form-data' 및 boundary를 설정합니다.
      body: formData, // FormData 객체를 직접 body로 전달
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "게시글 생성에 실패했습니다.");
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      message: "게시글이 성공적으로 작성되었습니다.",
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      message: error.message || "네트워크 오류가 발생했습니다.",
    };
  }
};
