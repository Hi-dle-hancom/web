import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import logoImage from "../assets/textlogo.png";
import {
  getNotifications,
  markNotificationAsRead,
  subscribeToNotifications,
} from "../utils/notification";
import "../index.css"; // 이 import 문은 그대로 유지됩니다.

function Header({ onResetHomePage, isDark, toggleDarkMode }) {
  // isDark와 toggleDarkMode props 추가
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] =
    useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false); // 테마 드롭다운 상태 추가
  const [notifications, setNotifications] = useState(getNotifications());

  // isDark 상태는 App.js에서 props로 전달받으므로 여기서는 제거합니다.
  // 로컬 스토리지 연동 및 body 클래스 토글 로직도 App.js로 이동했습니다.

  // JWT 디코딩을 위한 함수를 Header 컴포넌트 내부로 이동
  const decodeJwtResponse = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  // setLightMode와 setDarkMode 대신 toggleDarkMode를 사용합니다.
  const handleSetLightMode = () => {
    if (isDark) {
      // 현재 다크 모드라면 라이트 모드로 전환
      toggleDarkMode();
    }
    setThemeDropdownOpen(false); // 테마 선택 후 드롭다운 닫기
  };

  const handleSetDarkMode = () => {
    if (!isDark) {
      // 현재 라이트 모드라면 다크 모드로 전환
      toggleDarkMode();
    }
    setThemeDropdownOpen(false); // 테마 선택 후 드롭다운 닫기
  };

  // isDark 상태에 따라 body에 'dark' 클래스를 토글하는 로직은 App.js로 이동했습니다.
  // useEffect(() => { ... }, [isDark]); 이 부분은 제거됩니다.

  // 사용자 로그인 상태와 정보
  const [userProfile, setUserProfile] = useState(null);

  const supportedLanguages = [
    { code: "ko", display: "한국어" },
    { code: "en", display: "English" },
  ];

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setSettingsDropdownOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (path === "/") {
      onResetHomePage();
    }
  };

  const toggleNotificationsDropdown = () => {
    setNotificationsDropdownOpen((prev) => !prev);
  };

  const toggleThemeDropdown = () => {
    // 테마 드롭다운 토글 함수
    setThemeDropdownOpen((prev) => !prev);
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);

    if (
      notification.type === "mention" &&
      notification.commentId &&
      notification.postId
    ) {
      const targetPath = `/community/${notification.postId}`;
      const targetHash = `comment-${notification.commentId}`;

      if (window.location.pathname === targetPath) {
        window.location.hash = targetHash;
        console.log(`[Header] 동일 페이지 내 해시 변경: #${targetHash}`);
      } else {
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

  const unreadNotificationsCount = notifications.filter(
    (notif) => !notif.read
  ).length;

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const googleSignInButtonRef = useRef(null);

  const handleCredentialResponse = useCallback(
    (response) => {
      console.log("Encoded ID Token: " + response.credential);
      // userProfile 상태를 업데이트하여 로그인 정보 표시
      try {
        const profile = decodeJwtResponse(response.credential);
        console.log("Decoded Profile:", profile);
        setUserProfile({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        });
        localStorage.setItem(
          "userProfile",
          JSON.stringify({
            name: profile.name,
            email: profile.email,
            picture: profile.picture,
          })
        );
        alert(`Google 로그인 성공! 환영합니다, ${profile.name}님!`);
        navigate("/");
      } catch (error) {
        console.error("Failed to decode JWT or save profile:", error);
        alert("Google 로그인 처리 중 오류가 발생했습니다.");
      }
    },
    [navigate]
  );

  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 사용자 프로필 불러오기
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    const scriptId = "google-identity-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: "734412472912-a1haqu0pm7e22bk14hh7blm88eojaa3d",
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: false,
          });
          // Google Sign-In 버튼 렌더링 (숨겨진 상태로 유지)
          if (googleSignInButtonRef.current) {
            window.google.accounts.id.renderButton(
              googleSignInButtonRef.current,
              {
                type: "standard",
                size: "medium",
                text: "signin_with",
                shape: "rectangular",
                theme: "filled_blue",
                locale: language === "ko" ? "ko" : "en",
                width: "200",
              }
            );
            googleSignInButtonRef.current.style.display = "none";
          }
        }
      };
      document.body.appendChild(script);
    }
  }, [handleCredentialResponse, language]);

  const handleGoogleLoginClick = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      // Google One Tap 또는 팝업 프롬프트 트리거
      window.google.accounts.id.prompt();
    } else {
      console.warn("Google Identity Services가 아직 로드되지 않았습니다.");
      alert(
        "Google 로그인 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  return (
    <header className="fixed w-full shadow-md z-50 header-base">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* 로고 */}
        <div className="flex items-center">
          <Link to="/" onClick={() => handleNavigation("/")}>
            <img src={logoImage} alt="HAPA Logo" className="h-10 mr-3" />
          </Link>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-grow flex justify-end space-x-6">
          <button
            onClick={() => handleNavigation("/community")}
            className="transition duration-200 text-lg nav-link"
          >
            {strings[language].header.community}
          </button>
          <button
            onClick={() => handleNavigation("/demo")}
            className="transition duration-200 text-lg nav-link"
          >
            {strings[language].header.chat}
          </button>
        </nav>

        {/* 오른쪽 아이콘 및 드롭다운 */}
        <div className="flex items-center space-x-4">
          {/* 알림 아이콘 및 드롭다운 */}
          <div className="relative ml-4">
            <button
              onClick={toggleNotificationsDropdown}
              className="transition duration-200 text-2xl relative notification-icon"
              aria-label="Notifications"
            >
              🔔
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 text-xs rounded-full h-4 w-4 flex items-center justify-center notification-badge">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            {notificationsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 z-30 notification-dropdown">
                <div className="px-4 py-2 text-sm font-semibold border-b notification-dropdown-title">
                  {strings[language].global.notificationsTitle}
                </div>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`block w-full text-left px-4 py-2 text-sm notification-item ${
                        notif.read
                          ? "notification-item-read"
                          : "notification-item-unread"
                      } cursor-pointer`}
                    >
                      {notif.type === "mention" && notif.commentId
                        ? `${strings[language].global.mentionedInComment}${notif.mentioner}${strings[language].global.mentionedYou}`
                        : notif.type === "post-mention"
                        ? `${strings[language].global.mentionedInPost}${notif.mentioner}${strings[language].global.mentionedYou}`
                        : notif.message}{" "}
                      <span className="view-post-link">
                        {strings[language].global.viewPost}
                      </span>
                      {!notif.read && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full notification-unread-dot"></span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm no-notifications-text">
                    {strings[language].global.noNotifications}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 설정 아이콘 (언어 드롭다운) */}
          <div className="relative ml-6">
            <button
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              className="transition duration-200 text-2xl settings-icon"
              aria-label="Settings"
            >
              ⚙️
            </button>
            {settingsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg py-1 z-30 settings-dropdown">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="block w-full text-left px-4 py-2 text-sm lang-option"
                  >
                    {lang.display}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 테마 드롭다운 버튼 추가 */}
          <div className="relative ml-4">
            <button
              onClick={toggleThemeDropdown}
              className="transition duration-200 text-lg px-3 py-1 rounded-md darkmode-btn"
              aria-label="Theme"
            >
              테마
            </button>
            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg py-1 z-30 settings-dropdown">
                <button
                  onClick={handleSetLightMode}
                  className="block w-full text-left px-4 py-2 text-sm lang-option"
                >
                  🌞 Light
                </button>
                <button
                  onClick={handleSetDarkMode}
                  className="block w-full text-left px-4 py-2 text-sm lang-option"
                >
                  🌙 Dark
                </button>
              </div>
            )}
          </div>

          {/* 사용자 프로필 아이콘 (Google 로그인 트리거) */}
          <button
            onClick={handleGoogleLoginClick}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-semibold cursor-pointer user-profile-icon"
            aria-label="Google Login"
            title={
              userProfile
                ? `${userProfile.name}님 (클릭하여 계정 선택)`
                : "Google 로그인"
            }
          >
            {userProfile ? (
              userProfile.picture ? (
                <img
                  src={userProfile.picture}
                  alt="User Profile"
                  className="w-full h-full object-cover"
                />
              ) : userProfile.name ? (
                userProfile.name.charAt(0).toUpperCase()
              ) : (
                strings[language].header.personIcon
              )
            ) : (
              strings[language].header.personIcon
            )}
          </button>

          {/* Google Sign-In 버튼을 렌더링할 숨겨진 div */}
          <div ref={googleSignInButtonRef} style={{ display: "none" }}></div>
        </div>
      </div>
    </header>
  );
}

export default Header;
