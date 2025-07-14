// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import { loginUser } from "../api/userService";
import FindIdModal from "../components/FindIdModal";
import FindPasswordModal from "../components/FindPasswordModal"; // Adjusted path to fix the error

export default function LoginPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showFindIdModal, setShowFindIdModal] = useState(false);
  const [showFindPasswordModal, setShowFindPasswordModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!userId || !password) {
      setErrorMessage(strings[language].loginPage.alertFillAllFields);
      return;
    }

    const result = await loginUser(userId, password);

    if (result.success) {
      navigate("/");
    } else {
      setErrorMessage(
        result.message || strings[language].loginPage.alertLoginFailed
      );
    }
  };

  // Social login handlers - These would typically interact with a backend service
  const handleSocialLogin = (provider) => {
    alert(`${provider} ${strings[language].loginPage.loginButton}`);
    // Here you would typically initiate OAuth flow or call a backend endpoint
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          {strings[language].loginPage.title}
        </h2>

        {/* Social Login Section */}
        <div className="mb-6">
          <p className="text-gray-400 text-center mb-4">
            {strings[language].loginPage.socialLoginPrompt}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin("Google")}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_and_wordmark_of_Google_G_Suite.svg" // Placeholder for Google icon
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              {strings[language].loginPage.googleLogin}
            </button>
            <button
              onClick={() => handleSocialLogin("KakaoTalk")}
              className="w-full flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200 shadow"
            >
              <img
                src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing_icon_small.png" // Placeholder for KakaoTalk icon
                alt="KakaoTalk"
                className="w-5 h-5 mr-2"
              />
              {strings[language].loginPage.kakaoLogin}
            </button>
            <button
              onClick={() => handleSocialLogin("Apple")}
              className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" // Placeholder for Apple icon
                alt="Apple"
                className="w-5 h-5 mr-2 filter invert"
              />
              {strings[language].loginPage.appleLogin}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center my-6">
          <div className="border-t border-gray-600 flex-grow"></div>
          <span className="px-3 text-gray-500 text-sm">
            {strings[language].loginPage.orDivider}
          </span>
          <div className="border-t border-gray-600 flex-grow"></div>
        </div>

        {/* Traditional Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="userId"
              className="block text-gray-300 text-sm font-semibold mb-2"
            >
              {strings[language].loginPage.idLabel}
            </label>
            <input
              type="text"
              id="userId"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={strings[language].loginPage.idPlaceholder}
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-300 text-sm font-semibold mb-2"
            >
              {strings[language].loginPage.passwordLabel}
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={strings[language].loginPage.passwordPlaceholder}
              autoComplete="current-password"
            />
          </div>

          {errorMessage && (
            <p className="text-red-400 text-sm text-center">{errorMessage}</p>
          )}

          {/* Find ID / Password & Sign Up Links */}
          <div className="flex justify-between items-center text-sm mt-4">
            <button
              type="button"
              onClick={() => setShowFindIdModal(true)}
              className="text-blue-400 hover:text-blue-300 transition duration-200"
            >
              {strings[language].loginPage.findIdLink}
            </button>
            <span className="text-gray-500">|</span>
            <button
              type="button"
              onClick={() => setShowFindPasswordModal(true)}
              className="text-blue-400 hover:text-blue-300 transition duration-200"
            >
              {strings[language].loginPage.findPasswordLink}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 shadow-lg mt-6"
          >
            {strings[language].loginPage.loginButton}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          {strings[language].loginPage.signupPrompt}{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-300 font-semibold transition duration-200"
          >
            {strings[language].loginPage.signupLink}
          </Link>
        </p>
      </div>

      {showFindIdModal && (
        <FindIdModal
          show={showFindIdModal}
          onClose={() => setShowFindIdModal(false)}
        />
      )}
      {showFindPasswordModal && (
        <FindPasswordModal
          show={showFindPasswordModal}
          onClose={() => setShowFindPasswordModal(false)}
        />
      )}
    </div>
  );
}
