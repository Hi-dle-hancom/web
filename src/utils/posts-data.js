// src/utils/posts-data.js

const LOCAL_STORAGE_POSTS_KEY = "hapa_posts_data";

// localStorage에서 게시글 데이터를 로드하거나, 없으면 빈 배열을 사용합니다.
const loadPostsFromLocalStorage = () => {
  try {
    const storedPosts = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (storedPosts) {
      return JSON.parse(storedPosts);
    }
  } catch (e) {
    console.error("Failed to load posts from localStorage:", e);
  }
  return []; // Return empty array if no data or error
};

let postsData = loadPostsFromLocalStorage();
const postListeners = []; // 게시글 변경을 구독하는 리스너들을 저장

// 게시글 변경 시 등록된 모든 리스너에게 알립니다.
const notifyPostListeners = () => {
  postListeners.forEach((listener) => listener(postsData));
  // 데이터가 변경될 때마다 localStorage에 저장
  try {
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(postsData));
  } catch (e) {
    console.error("Failed to save posts to localStorage:", e);
  }
};

export const getPosts = () => postsData;

export const addPostToStore = (newPost) => {
  postsData = [newPost, ...postsData]; // 새 게시글을 목록 맨 앞에 추가
  console.log("새 게시글 추가됨 (전역):", newPost);
  notifyPostListeners(); // 게시글이 추가될 때 리스너들에게 알립니다.
};

export const deletePostFromStore = (postId) => {
  postsData = postsData.filter((post) => post.id !== postId);
  console.log(`게시글 삭제됨 (ID: ${postId})`);
  notifyPostListeners();
};

// 게시글 변경을 구독하는 함수
export const subscribeToPosts = (callback) => {
  postListeners.push(callback);
  // 현재 게시글 상태를 즉시 전달 (초기 상태 설정용)
  callback(postsData);
  // 구독 해지 함수 반환
  return () => {
    const index = postListeners.indexOf(callback);
    if (index > -1) {
      postListeners.splice(index, 1);
    }
  };
};

// 개발 환경에서 localStorage를 초기화하는 함수 (필요 시 수동 호출)
export const clearAllPosts = () => {
  postsData = [];
  localStorage.removeItem(LOCAL_STORAGE_POSTS_KEY);
  notifyPostListeners();
  console.log("모든 게시글 데이터가 초기화되었습니다.");
};
