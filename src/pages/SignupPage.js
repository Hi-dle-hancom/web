// src/pages/SignupPage.js
import React, { useState, useCallback } from "react";
import countries from "../data/nation";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import { registerUser, checkUserIdAvailability } from "../api/userService";
import {
  validatePhoneNumber,
  validateEmail,
  validateUserId,
  validatePassword as validatePasswordUtil,
} from "../utils/validation"; // validatePassword 이름을 변경하여 유틸리티 함수로 사용

// 아이콘 컴포넌트 추가
const CheckIcon = () => <span className="text-blue-400 mr-2">✔</span>;
const CrossIcon = () => <span className="text-red-400 mr-2">✖</span>;

export default function SignupPage() {
  const { language } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);

  const [country, setCountry] = useState("KR");
  const [phoneCode, setPhoneCode] = useState("+82");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailLocalPart, setEmailLocalPart] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");
  const [isEmailCustom, setIsEmailCustom] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [developerLevel, setDeveloperLevel] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false); // 약관 동의 상태 추가

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Validation states
  const [isUserIdAvailable, setIsUserIdAvailable] = useState(null); // null: not checked, true: available, false: not available
  const [userIdCheckTrigger, setUserIdCheckTrigger] = useState(0); // For re-checking availability
  const [userIdTouched, setUserIdTouched] = useState(false); // To track if userId input has been interacted with
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    lettersAndCase: false,
    numbers: false,
    specialChars: false,
    validChars: true,
  });
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // Memoized validation function
  const validatePassword = useCallback(
    (pwd) => {
      const result = validatePasswordUtil(pwd);
      setPasswordValidation({
        minLength: result.minLength,
        lettersAndCase: result.lettersAndCase,
        numbers: result.numbers,
        specialChars: result.specialChars,
        validChars: result.validChars,
      });
      return Object.values(result).every(Boolean); // 모든 유효성 검사 통과 여부 반환
    },
    [] // validatePasswordUtil을 의존성 배열에서 제거
  );

  // Phone number validation
  const isPhoneNumberValid = useCallback(() => {
    return validatePhoneNumber(phoneNumber);
  }, [phoneNumber]);

  // Email validation
  const isEmailValid = useCallback(() => {
    const fullEmail = `${emailLocalPart}@${emailDomain}`;
    return validateEmail(fullEmail);
  }, [emailLocalPart, emailDomain]);

  const handleCountryChange = (e) => {
    const selectedCountryCode = e.target.value;
    setCountry(selectedCountryCode);
    const selectedCountry = countries.find(
      (c) => c.code === selectedCountryCode
    );
    if (selectedCountry) {
      setPhoneCode(selectedCountry.phone_code);
    }
  };

  const handleEmailDomainChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setIsEmailCustom(true);
      setEmailDomain("");
    } else {
      setIsEmailCustom(false);
      setEmailDomain(value);
    }
  };

  const handleUserIdChange = (e) => {
    const value = e.target.value;
    setUserId(value);
    setUserIdTouched(true);
    setIsUserIdAvailable(null); // Reset availability check on change
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    if (confirmPassword) {
      setPasswordMismatch(value !== confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordMismatch(password !== value);
  };

  const handleCheckUserId = useCallback(async () => {
    if (!userId) {
      setModalMessage(strings[language].signupPage.validation.userIdRequired);
      setShowModal(true);
      setIsUserIdAvailable(false);
      return;
    }
    if (!validateUserId(userId)) {
      setModalMessage(strings[language].signupPage.alertInvalidUserId);
      setShowModal(true);
      setIsUserIdAvailable(false);
      return;
    }

    const result = await checkUserIdAvailability(userId);
    if (result.success) {
      setIsUserIdAvailable(true);
      setModalMessage(strings[language].signupPage.validation.userIdAvailable);
    } else {
      setIsUserIdAvailable(false);
      setModalMessage(
        result.message ||
          strings[language].signupPage.validation.userIdNotAvailable
      );
    }
    setShowModal(true);
  }, [userId, language]);

  // Trigger userId check when userIdCheckTrigger changes
  React.useEffect(() => {
    if (userIdCheckTrigger > 0) {
      handleCheckUserId();
    }
  }, [userIdCheckTrigger, handleCheckUserId]);

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Step 1: Choose sign up method - Handled by social login buttons or "Email으로 회원가입"
      // If proceeding to step 2, it implies traditional signup
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!isPhoneNumberValid()) {
        setModalMessage(strings[language].signupPage.alertInvalidPhoneNumber);
        setShowModal(true);
        return;
      }
      if (!isEmailValid()) {
        setModalMessage(strings[language].signupPage.alertInvalidEmail);
        setShowModal(true);
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSignUp = async () => {
    if (
      !userId ||
      !password ||
      !confirmPassword ||
      !developerLevel ||
      !phoneNumber ||
      !emailLocalPart ||
      !emailDomain
    ) {
      setModalMessage(strings[language].signupPage.alertAllFieldsRequired);
      setShowModal(true);
      return;
    }

    if (!isPhoneNumberValid()) {
      setModalMessage(strings[language].signupPage.alertInvalidPhoneNumber);
      setShowModal(true);
      return;
    }
    if (!isEmailValid()) {
      setModalMessage(strings[language].signupPage.alertInvalidEmail);
      setShowModal(true);
      return;
    }

    if (!validateUserId(userId)) {
      setModalMessage(strings[language].signupPage.alertInvalidUserId);
      setShowModal(true);
      return;
    }
    if (isUserIdAvailable !== true) {
      setModalMessage(
        strings[language].signupPage.validation.userIdCheckRequired
      );
      setShowModal(true);
      return;
    }

    if (!validatePassword(password)) {
      setModalMessage(strings[language].signupPage.alertInvalidPassword);
      setShowModal(true);
      return;
    }
    if (password !== confirmPassword) {
      setModalMessage(strings[language].signupPage.alertPasswordMismatch);
      setShowModal(true);
      return;
    }
    if (!developerLevel) {
      setModalMessage(strings[language].signupPage.alertSelectDeveloperLevel);
      setShowModal(true);
      return;
    }
    if (!agreedToTerms) {
      // 약관 동의 확인
      setModalMessage(
        strings[language].signupPage.agreeToTerms + "에 동의해야 합니다."
      );
      setShowModal(true);
      return;
    }

    const fullEmail = `${emailLocalPart}@${emailDomain}`;

    const result = await registerUser(
      userId,
      password,
      fullEmail,
      phoneCode + phoneNumber,
      country,
      developerLevel
    );

    if (result.success) {
      setModalMessage(strings[language].signupPage.signupSuccess);
      setShowModal(true);
    } else {
      setModalMessage(
        result.message || strings[language].signupPage.signupFailed
      );
      setShowModal(true);
    }
  };

  // Social signup handlers
  const handleSocialSignup = (provider) => {
    alert(`${provider} ${strings[language].signupPage.signupButton}`);
    // Here you would typically initiate OAuth flow for signup
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          {strings[language].signupPage.title}
        </h2>

        {currentStep === 1 && (
          <div className="flex flex-col space-y-4">
            <p className="text-gray-400 text-center mb-4">
              {strings[language].signupPage.socialSignupPrompt}
            </p>
            <button
              onClick={() => handleSocialSignup("Google")}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_and_wordmark_of_Google_G_Suite.svg" // Placeholder for Google icon
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              {strings[language].signupPage.googleSignup}
            </button>
            <button
              onClick={() => handleSocialSignup("KakaoTalk")}
              className="w-full flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200 shadow"
            >
              <img
                src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing_icon_small.png" // Placeholder for KakaoTalk icon
                alt="KakaoTalk"
                className="w-5 h-5 mr-2"
              />
              {strings[language].signupPage.kakaoSignup}
            </button>
            <button
              onClick={() => handleSocialSignup("Apple")}
              className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" // Placeholder for Apple icon
                alt="Apple"
                className="w-5 h-5 mr-2 filter invert"
              />
              {strings[language].signupPage.appleSignup}
            </button>

            <div className="flex items-center justify-center my-6">
              <div className="border-t border-gray-600 flex-grow"></div>
              <span className="px-3 text-gray-500 text-sm">
                {strings[language].signupPage.orDivider}
              </span>
              <div className="border-t border-gray-600 flex-grow"></div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg text-lg"
            >
              {strings[language].signupPage.traditionalSignupPrompt}
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white text-center mb-4">
              {strings[language].signupPage.step2Title}
            </h3>
            <div>
              <label
                htmlFor="country"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                {strings[language].signupPage.countryLabel}
              </label>
              <select
                id="country"
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                value={country}
                onChange={handleCountryChange}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.phone_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                {strings[language].signupPage.phoneNumberLabel}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-600 bg-gray-700 text-gray-300 text-sm">
                  {phoneCode}
                </span>
                <input
                  type="text"
                  id="phoneNumber"
                  className="flex-grow p-3 rounded-r-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={
                    strings[language].signupPage.phoneNumberPlaceholder
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="emailLocalPart"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                {strings[language].signupPage.emailLabel}
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="emailLocalPart"
                  className="w-1/2 p-3 rounded-l-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                  value={emailLocalPart}
                  onChange={(e) => setEmailLocalPart(e.target.value)}
                  placeholder={
                    strings[language].signupPage.emailLocalPartPlaceholder
                  }
                />
                <span className="text-gray-300 px-2">@</span>
                {isEmailCustom ? (
                  <input
                    type="text"
                    id="emailDomainCustom"
                    className="w-1/2 p-3 rounded-r-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                    placeholder={
                      strings[language].signupPage.emailCustomDomainPlaceholder
                    }
                  />
                ) : (
                  <select
                    id="emailDomain"
                    className="w-1/2 p-3 rounded-r-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                    value={emailDomain}
                    onChange={handleEmailDomainChange}
                  >
                    <option value="gmail.com">gmail.com</option>
                    <option value="naver.com">naver.com</option>
                    <option value="daum.net">daum.net</option>
                    <option value="hanmail.net">hanmail.net</option>
                    <option value="custom">
                      {
                        strings[language].signupPage
                          .emailCustomDomainPlaceholder
                      }
                    </option>
                  </select>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
              >
                {strings[language].signupPage.previousButton}
              </button>
              <button
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
              >
                {strings[language].signupPage.nextButton}
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white text-center mb-4">
              {strings[language].signupPage.step3Title}
            </h3>
            <div>
              <label
                htmlFor="userId"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                {strings[language].signupPage.userIdLabel}
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="userId"
                  className="flex-grow p-3 rounded-l-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                  value={userId}
                  onChange={handleUserIdChange}
                  placeholder={strings[language].signupPage.userIdPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setUserIdCheckTrigger((prev) => prev + 1)} // Increment to trigger effect
                  className="ml-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-r-lg hover:bg-purple-700 transition duration-200"
                >
                  {isUserIdAvailable === true && "✔"}
                  {isUserIdAvailable === false && "✖"}
                  {isUserIdAvailable === null &&
                    strings[language].signupPage.validation.userIdCheckRequired}
                  {isUserIdAvailable !== null &&
                    (isUserIdAvailable
                      ? strings[language].signupPage.validation.userIdAvailable
                      : strings[language].signupPage.validation
                          .userIdNotAvailable)}
                </button>
              </div>
              {userIdTouched &&
                !validateUserId(userId) &&
                userId.length > 0 && (
                  <p className="text-red-400 text-sm mt-1">
                    {strings[language].signupPage.validation.userIdPattern}
                  </p>
                )}
              {userIdTouched && userId.length < 6 && userId.length > 0 && (
                <p className="text-red-400 text-sm mt-1">
                  {strings[language].signupPage.validation.userIdMinLength}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                {strings[language].signupPage.passwordLabel}
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                value={password}
                onChange={handlePasswordChange}
                placeholder={strings[language].signupPage.passwordPlaceholder}
                autoComplete="new-password"
              />
              <ul className="text-gray-400 text-xs mt-1 space-y-0.5">
                <li
                  className={
                    passwordValidation.minLength
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {passwordValidation.minLength ? <CheckIcon /> : <CrossIcon />}
                  {strings[language].signupPage.validation.passwordMinLength}
                </li>
                <li
                  className={
                    passwordValidation.lettersAndCase
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {passwordValidation.lettersAndCase ? (
                    <CheckIcon />
                  ) : (
                    <CrossIcon />
                  )}
                  {
                    strings[language].signupPage.validation
                      .passwordLettersAndCase
                  }
                </li>
                <li
                  className={
                    passwordValidation.numbers
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {passwordValidation.numbers ? <CheckIcon /> : <CrossIcon />}
                  {strings[language].signupPage.validation.numbers}
                </li>
                <li
                  className={
                    passwordValidation.specialChars
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {passwordValidation.specialChars ? (
                    <CheckIcon />
                  ) : (
                    <CrossIcon />
                  )}
                  {strings[language].signupPage.validation.specialChars}
                </li>
                <li
                  className={
                    passwordValidation.validChars
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {passwordValidation.validChars ? (
                    <CheckIcon />
                  ) : (
                    <CrossIcon />
                  )}
                  {!passwordValidation.validChars &&
                    strings[language].signupPage.validation
                      .passwordInvalidChars}
                </li>
              </ul>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                {strings[language].signupPage.confirmPasswordLabel}
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder={
                  strings[language].signupPage.confirmPasswordPlaceholder
                }
                autoComplete="new-password"
              />
              {passwordMismatch && (
                <p className="text-red-400 text-sm mt-1">
                  {strings[language].signupPage.validation.passwordMatch}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="developerLevel"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                {strings[language].signupPage.developerLevelLabel}
              </label>
              <select
                id="developerLevel"
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 outline-none"
                value={developerLevel}
                onChange={(e) => setDeveloperLevel(e.target.value)}
              >
                <option value="">
                  {strings[language].signupPage.developerLevelPlaceholder}
                </option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* 약관 동의 섹션 */}
            <div className="flex items-start mt-4">
              <input
                type="checkbox"
                id="agreeToTerms"
                className="mt-1 mr-2 accent-blue-500"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <label htmlFor="agreeToTerms" className="text-gray-300 text-sm">
                {strings[language].signupPage.agreeToTerms} (필수)
                <br />
                <span
                  className="text-blue-400 hover:underline cursor-pointer"
                  onClick={() => {
                    setModalMessage(strings[language].signupPage.termsContent);
                    setShowModal(true);
                  }}
                >
                  약관 내용 보기
                </span>{" "}
                |{" "}
                <span
                  className="text-blue-400 hover:underline cursor-pointer"
                  onClick={() => {
                    setModalMessage(
                      strings[language].signupPage.privacyPolicyContent
                    );
                    setShowModal(true);
                  }}
                >
                  개인정보 처리방침 보기
                </span>
              </label>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
              >
                {strings[language].signupPage.previousButton}
              </button>
              <button
                onClick={handleSignUp}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
              >
                {strings[language].signupPage.signupButton}
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-white">
              {strings[language].signupPage.modalTitle}
            </h3>
            <p className="text-gray-200 mb-6 whitespace-pre-wrap">
              {modalMessage}
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
