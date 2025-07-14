// src/utils/notifications.js

let notifications = []; // 임시 전역 인메모리 알림 저장소
const listeners = []; // 알림 변경을 구독하는 리스너들을 저장

// 알림 변경 시 등록된 모든 리스너에게 알립니다.
const notifyListeners = () => {
  listeners.forEach((listener) => listener(notifications));
};

export const getNotifications = () => notifications;

export const addNotification = (notification) => {
  notifications = [notification, ...notifications]; // 새 알림을 목록 맨 위에 추가
  console.log("새 알림 추가됨:", notification);
  console.log("현재 알림:", notifications);
  notifyListeners(); // 알림이 추가될 때 리스너들에게 알립니다.
};

export const markNotificationAsRead = (notificationId) => {
  notifications = notifications.map((notif) =>
    notif.id === notificationId ? { ...notif, read: true } : notif
  );
  console.log("읽음으로 표시된 알림:", notificationId);
  notifyListeners(); // 알림 상태가 변경될 때 리스너들에게 알립니다.
};

// 알림 변경을 구독하는 함수
export const subscribeToNotifications = (callback) => {
  listeners.push(callback);
  // 현재 알림 상태를 즉시 전달 (초기 상태 설정용)
  callback(notifications);
  // 구독 해지 함수 반환
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// 개발 환경에서 페이지 새로고침 시 알림을 초기화 (실제 앱에서는 영구 저장됨)
// window.addEventListener('beforeunload', () => {
//   notifications = [];
// });
