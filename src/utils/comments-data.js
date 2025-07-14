// src/utils/comments-data.js

const LOCAL_STORAGE_KEY = "hapa_comments_data";

// localStorage에서 댓글 데이터를 로드하거나, 없으면 초기 더미 데이터를 사용합니다.
const loadCommentsFromLocalStorage = () => {
  try {
    const storedComments = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedComments) {
      // JSON 문자열을 파싱하여 객체로 변환
      return JSON.parse(storedComments);
    }
  } catch (e) {
    console.error("Failed to load comments from localStorage:", e);
    // 에러 발생 시 초기 더미 데이터 반환
  }
  // localStorage에 데이터가 없거나 에러 발생 시 초기 더미 데이터 반환
  return [
    {
      id: "comment1",
      authorId: "userA",
      content: "이 게시글 정말 유익하네요! 잘 읽었습니다.",
      timestamp: "2023-10-26T10:00:00Z",
      parentId: null,
      replies: [
        {
          id: "reply1-1",
          authorId: "userB",
          content: "저도 그렇게 생각해요. 특히 번역 기능이 기대됩니다.",
          timestamp: "2023-10-26T10:05:00Z",
          parentId: "comment1",
          replies: [
            {
              id: "reply1-1-1",
              authorId: "userC",
              content:
                "@userA, @userB, 맞아요! 번역 기능이 실제로 잘 작동하는지 궁금하네요.",
              timestamp: "2023-10-26T10:10:00Z",
              parentId: "reply1-1",
              replies: [],
            },
          ],
        },
        {
          id: "reply1-2",
          authorId: "userD",
          content: "궁금한 점이 있는데, 이 기능은 어떻게 구현되었나요?",
          timestamp: "2023-10-26T10:15:00Z",
          parentId: "comment1",
          replies: [],
        },
      ],
    },
    {
      id: "comment2",
      authorId: "userE",
      content: "훌륭한 게시글입니다. 감사합니다!",
      timestamp: "2023-10-26T11:00:00Z",
      parentId: null,
      replies: [],
    },
  ];
};

let commentsData = loadCommentsFromLocalStorage();
const commentListeners = []; // 댓글 변경을 구독하는 리스너들을 저장

// 댓글 변경 시 등록된 모든 리스너에게 알립니다.
const notifyCommentListeners = () => {
  commentListeners.forEach((listener) => listener(commentsData));
  // 데이터가 변경될 때마다 localStorage에 저장
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(commentsData));
  } catch (e) {
    console.error("Failed to save comments to localStorage:", e);
  }
};

export const getComments = () => commentsData;

export const addCommentToStore = (newComment) => {
  commentsData = [...commentsData, newComment]; // 새 댓글을 목록 맨 끝에 추가
  console.log("새 댓글 추가됨 (전역):", newComment);
  notifyCommentListeners(); // 댓글이 추가될 때 리스너들에게 알립니다.
};

// 최상위 댓글을 삭제하는 함수
export const deleteCommentFromStore = (commentId) => {
  commentsData = commentsData.filter((comment) => comment.id !== commentId);
  console.log(`댓글 삭제됨 (ID: ${commentId})`);
  notifyCommentListeners();
};

// 답글을 삭제하는 함수 (재귀적으로 탐색)
export const deleteReplyFromStore = (replyId, parentId) => {
  const deleteReplyFromTree = (commentsArray) => {
    return commentsArray.map((comment) => {
      if (comment.id === parentId) {
        // 현재 댓글이 부모 댓글이라면, 그 댓글의 replies에서 해당 답글을 필터링
        return {
          ...comment,
          replies: comment.replies.filter((reply) => reply.id !== replyId),
        };
      } else if (comment.replies && comment.replies.length > 0) {
        // 현재 댓글이 부모 댓글이 아니지만 답글을 가지고 있다면, 재귀적으로 탐색
        return {
          ...comment,
          replies: deleteReplyFromTree(comment.replies),
        };
      }
      return comment;
    });
  };
  commentsData = deleteReplyFromTree(commentsData);
  console.log(`답글 삭제됨 (ID: ${replyId}, 부모 ID: ${parentId})`);
  notifyCommentListeners();
};

export const addReplyToStore = (parentId, newReply) => {
  const addReplyToTree = (commentsArray) => {
    return commentsArray.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...comment.replies, newReply],
        };
      } else if (comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToTree(comment.replies),
        };
      }
      return comment;
    });
  };
  commentsData = addReplyToTree(commentsData);
  console.log("새 답글 추가됨 (전역):", newReply);
  notifyCommentListeners(); // 답글이 추가될 때 리스너들에게 알립니다.
};

// 댓글 변경을 구독하는 함수
export const subscribeToComments = (callback) => {
  commentListeners.push(callback);
  // 현재 댓글 상태를 즉시 전달 (초기 상태 설정용)
  callback(commentsData);
  // 구독 해지 함수 반환
  return () => {
    const index = commentListeners.indexOf(callback);
    if (index > -1) {
      commentListeners.splice(index, 1);
    }
  };
};

// 개발 환경에서 localStorage를 초기화하는 함수 (필요 시 수동 호출)
export const clearAllComments = () => {
  commentsData = [];
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  notifyCommentListeners();
  console.log("모든 댓글 데이터가 초기화되었습니다.");
};
