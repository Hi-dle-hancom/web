// src/components/Header.js
import React, { useState, useEffect, useRef, useCallback } from "react"; // useCallback 임포트 추가
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import logoImage from "../assets/textlogo.png"; // 로고 이미지 파일 임포트
import {
  getNotifications,
  markNotificationAsRead,
  subscribeToNotifications,
} from "../utils/notification"; // 알림 유틸 임포트

function Header({ onResetHomePage }) {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false); // 설정 아이콘 드롭다운 상태
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] =
    useState(false); // 알림 드롭다운 상태
  const [notifications, setNotifications] = useState(getNotifications()); // 알림 목록 상태

  // isDark 상태와 toggleDarkMode 함수를 Header.js에 추가합니다.
  const [isDark, setIsDark] = useState(false);
  const toggleDarkMode = () => setIsDark((prev) => !prev);
  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
  }, [isDark]);

  const supportedLanguages = [
    { code: "ko", display: "한국어" },
    { code: "en", display: "English" },
  ];

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setSettingsDropdownOpen(false); // 언어 선택 후 드롭다운 닫기
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (path === "/") {
      onResetHomePage();
    }
  };

  // 알림 드롭다운 토글 시 알림 목록 새로고침
  const toggleNotificationsDropdown = () => {
    setNotificationsDropdownOpen((prev) => !prev);
  };

  // 알림 클릭 핸들러 (게시글 또는 댓글로 이동)
  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);

    if (
      notification.type === "mention" &&
      notification.commentId &&
      notification.postId
    ) {
      const targetPath = `/community/${notification.postId}`; // 기본 게시글 경로
      const targetHash = `comment-${notification.commentId}`; // 대상 댓글 해시

      // 현재 경로가 대상 게시글 경로와 동일한지 확인
      if (window.location.pathname === targetPath) {
        // 동일한 게시글 페이지라면, 해시만 직접 변경하여 hashchange 이벤트를 강제합니다.
        // 이렇게 하면 PostDetailPage의 hashchange 리스너가 확실히 작동합니다.
        window.location.hash = targetHash;
        console.log(`[Header] 동일 페이지 내 해시 변경: #${targetHash}`);
      } else {
        // 다른 게시글 페이지라면, navigate를 사용하여 페이지 이동 및 해시 설정
        navigate(`${targetPath}#${targetHash}`);
        console.log(`[Header] 다른 페이지로 이동: ${targetPath}#${targetHash}`);
      }
    } else if (notification.type === "post-mention" && notification.postId) {
      const targetPath = `/community/${notification.postId}`;
      navigate(targetPath);
      console.log(`[Header] 게시글로 이동: ${targetPath}`);
    }
    setNotificationsDropdownOpen(false);
  };

  // 읽지 않은 알림 개수 계산
  const unreadNotificationsCount = notifications.filter(
    (notif) => !notif.read
  ).length;

  // 컴포넌트 마운트 시 알림 변경 구독
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    // 컴포넌트 언마운트 시 구독 해지
    return () => {
      unsubscribe();
    };
  }, []);

  // --- Google 로그인 관련 코드 추가 ---
  const googleSignInButtonRef = useRef(null); // 숨겨진 Google 로그인 버튼을 위한 ref

  // Google 자격 증명 응답 처리 함수 (useCallback으로 메모이제이션)
  const handleCredentialResponse = useCallback(
    (response) => {
      console.log("Encoded ID Token: " + response.credential);
      // 실제 애플리케이션에서는 이 토큰을 백엔드로 전송하여 사용자 인증을 완료해야 합니다.
      alert("Google 로그인 성공! 토큰을 콘솔에서 확인하세요.");
      // 로그인 성공 후 홈페이지로 리디렉션
      navigate("/");
    },
    [navigate]
  ); // navigate는 React Router의 훅이므로 의존성 배열에 포함

  useEffect(() => {
    // Google Identity Services 스크립트 동적 로드
    const scriptId = "google-identity-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // 스크립트 로드 완료 후 Google 로그인 초기화
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: "734412472912-a1haqu0pm7e22bk14hh7blm88eojaa3d", // 여기에 실제 Google Client ID를 입력하세요.
            callback: handleCredentialResponse,
            auto_select: false, // 자동 로그인 방지, 계정 선택 창을 띄우기 위함
            cancel_on_tap_outside: false, // 외부 탭 시 취소 방지 (필요에 따라)
          });
          // global-lexicon-465908-d6
          // 734412472912-a1haqu0pm7e22bk14hh7blm88eojaa3d.apps.googleusercontent.com
          // 숨겨진 버튼 렌더링
          if (googleSignInButtonRef.current) {
            window.google.accounts.id.renderButton(
              googleSignInButtonRef.current,
              {
                type: "standard", // "standard" 또는 "icon"
                size: "medium",
                text: "signin_with", // "signin_with", "signup_with", "continue_with", "federated_signin_with"
                shape: "rectangular",
                theme: "filled_blue", // "outline" 또는 "filled_blue"
                locale: language === "ko" ? "ko" : "en", // 언어 설정
                width: "200", // 버튼 너비 (필요에 따라 조정)
              }
            );
            // 초기 렌더링 후 버튼 숨기기
            googleSignInButtonRef.current.style.display = "none";
          }
        }
      };
      document.body.appendChild(script);
    }
  }, [handleCredentialResponse, language]); // language 변경 시 버튼 다시 렌더링 (언어 반영)

  // 사람 아이콘 클릭 시 Google 로그인 팝업 트리거
  const handleGoogleLoginClick = () => {
    if (window.google && googleSignInButtonRef.current) {
      // 숨겨진 Google 로그인 버튼을 프로그래밍 방식으로 클릭
      googleSignInButtonRef.current.querySelector('div[role="button"]').click();
    } else {
      // Google 스크립트가 로드되지 않았거나 버튼이 렌더링되지 않은 경우
      console.warn("Google Identity Services가 준비되지 않았습니다.");
      alert(
        "Google 로그인 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
      );
      // 또는 기본 로그인 페이지로 리디렉션
      // navigate("/login");
    }
  };
  // --- Google 로그인 관련 코드 끝 ---

  return (
    <header className="fixed w-full bg-gray-800 text-white shadow-md z-20  border-b-2 border-gray-600 ">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* 로고 */}
        <div className="flex items-center">
          <Link to="/" onClick={() => handleNavigation("/")}>
            <img src={logoImage} alt="HAPA Logo" className="h-8 mr-3" />
          </Link>
          {/* HAPA 텍스트 로고 제거 */}
          {/* <span className="text-2xl font-bold">
            {strings[language].header.autodesk}
          </span> */}
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-grow flex justify-end space-x-6">
          <button
            onClick={() => handleNavigation("/products")}
            className="text-gray-300 hover:text-white transition duration-200 text-lg"
          >
            {strings[language].header.products}
          </button>
          <button
            onClick={() => handleNavigation("/support")}
            className="text-gray-300 hover:text-white transition duration-200 text-lg"
          >
            {strings[language].header.support}
          </button>
          <button
            onClick={() => handleNavigation("/learn")}
            className="text-gray-300 hover:text-white transition duration-200 text-lg"
          >
            {strings[language].header.learn}
          </button>
          <button
            onClick={() => handleNavigation("/community")}
            className="text-gray-300 hover:text-white transition duration-200 text-lg"
          >
            {strings[language].header.community}
          </button>
          {/* Demo 메뉴 추가 */}
          <button
            onClick={() => handleNavigation("/demo")}
            className="text-gray-300 hover:text-white transition duration-200 text-lg"
          >
            {strings[language].header.chat}
          </button>
        </nav>

        {/* 오른쪽 아이콘 및 드롭다운 */}
        <div className="flex items-center space-x-4">
          {/* 검색 아이콘 제거 */}
          {/* <button
            className="text-gray-300 hover:text-white transition duration-200 text-2xl"
            aria-label="Search"
          >
            {strings[language].header.searchIcon}
          </button> */}

          {/* 알림 아이콘 및 드롭다운 */}
          <div className="relative ml-4">
            <button
              onClick={toggleNotificationsDropdown}
              className="text-gray-300 hover:text-white transition duration-200 text-2xl relative"
              aria-label="Notifications"
            >
              🔔
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            {notificationsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-700 rounded-md shadow-lg py-1 z-30">
                <div className="px-4 py-2 text-sm font-semibold text-gray-300 border-b border-gray-600">
                  {strings[language].global.notificationsTitle}
                </div>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        notif.read
                          ? "text-gray-400"
                          : "text-gray-200 font-medium"
                      } hover:bg-gray-600 cursor-pointer`}
                    >
                      {notif.type === "mention" && notif.commentId
                        ? `${strings[language].global.mentionedInComment}${notif.mentioner}${strings[language].global.mentionedYou}`
                        : notif.type === "post-mention"
                        ? `${strings[language].global.mentionedInPost}${notif.mentioner}${strings[language].global.mentionedYou}`
                        : notif.message}{" "}
                      <span className="text-blue-400">
                        {strings[language].global.viewPost}
                      </span>
                      {!notif.read && (
                        <span className="ml-2 inline-block h-2 w-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-400">
                    {strings[language].global.noNotifications}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 설정 아이콘 (언어 드롭다운) */}
          {/* ml-6을 유지하여 네비게이션 메뉴와의 간격을 줍니다. */}
          <div className="relative ml-6">
            <button
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              className="text-gray-300 hover:text-white transition duration-200 text-2xl"
              aria-label="Settings"
            >
              ⚙️ {/* 톱니바퀴 이모지 또는 <FiSettings /> */}
            </button>
            {settingsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-gray-700 rounded-md shadow-lg py-1 z-30">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                  >
                    {lang.display}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 다크 모드 토글 버튼 추가 */}
          <button
            onClick={toggleDarkMode}
            className="text-gray-300 hover:text-white transition duration-200 text-lg ml-4 px-3 py-1 rounded-md darkmode-btn"
          >
            {isDark ? "🌞 Light" : "🌙 Dark"}
          </button>

          {/* 사용자 프로필 아이콘 (Google 로그인 트리거) */}
          {/* ml-4를 유지하여 설정 아이콘과의 간격을 줍니다. */}
          <button
            onClick={handleGoogleLoginClick} // 클릭 시 Google 로그인 트리거
            className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-semibold cursor-pointer"
            aria-label="Google Login"
          >
            {strings[language].header.personIcon}
          </button>

          {/* Google Sign-In 버튼을 렌더링할 숨겨진 div */}
          <div ref={googleSignInButtonRef} style={{ display: "none" }}></div>
        </div>
      </div>
    </header>
  );
}

export default Header;
