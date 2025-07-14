// src/components/FindPasswordModal.js
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import {
  verifyPhoneAndIdForPasswordReset,
  verifyEmailAndIdForPasswordReset,
  resetPassword,
  resetPasswordByEmail,
} from "../api/userService";

export default function FindPasswordModal({ onClose }) {
  const { language } = useLanguage();
  const [step, setStep] = useState(1); // 1: 인증 방법 선택, 2: 인증 코드 입력, 3: 비밀번호 재설정
  const [method, setMethod] = useState("phone"); // 'phone' 또는 'email'
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState(""); // 성공 메시지
  const [verificationCode, setVerificationCode] = useState(""); // 임시: 인증 코드 상태
  // const [isCodeSent, setIsCodeSent] = useState(false); // 이 줄을 제거합니다.

  // 비밀번호 유효성 검사 함수 (SignupPage.js에서 가져옴)
  const validatePassword = (password) => {
    const minLength = password.length >= 10;
    const minLettersAndCase =
      (password.match(/[a-z]/g) || []).length >= 1 &&
      (password.match(/[A-Z]/g) || []).length >= 1 &&
      (password.match(/[a-zA-Z]/g) || []).length >= 4;
    const minNumbers = (password.match(/\d/g) || []).length >= 2;
    const minSpecialChars =
      (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/g) || []).length >=
      3;
    const invalidChars = /['"\\<>&`]/.test(password);

    return {
      minLength,
      minLettersAndCase,
      minNumbers,
      minSpecialChars,
      invalidChars,
    };
  };

  const handleSendCode = async () => {
    setErrorMessage("");
    setMessage("");

    if (!userId) {
      setErrorMessage(strings[language].findAccount.enterId);
      return;
    }

    let result;
    if (method === "phone") {
      if (!phoneNumber) {
        setErrorMessage(strings[language].findAccount.enterPhoneNumber);
        return;
      }
      result = await verifyPhoneAndIdForPasswordReset(phoneNumber, userId);
    } else {
      // method === 'email'
      if (!email) {
        setErrorMessage(strings[language].findAccount.enterEmail);
        return;
      }
      result = await verifyEmailAndIdForPasswordReset(email, userId);
    }

    if (result.success) {
      setMessage(strings[language].findAccount.verificationCodeSent);
      // setIsCodeSent(true); // 이 줄을 제거합니다.
      setStep(2); // 다음 단계로 이동: 인증 코드 입력
    } else {
      setErrorMessage(
        result.message || strings[language].findAccount.userNotFound
      );
    }
  };

  const handleVerifyCode = () => {
    setErrorMessage("");
    setMessage("");

    // 여기서는 실제 인증 코드 검증 로직이 없으므로, 단순히 통과시킵니다.
    // 실제 구현에서는 서버와 통신하여 코드를 검증해야 합니다.
    if (verificationCode === "123456") {
      // 더미 코드 (실제 구현 시 서버에서 발급된 코드와 비교)
      setMessage(strings[language].phoneNumberVerification.verificationSuccess);
      setStep(3); // 다음 단계로 이동: 비밀번호 재설정
    } else {
      setErrorMessage(strings[language].findAccount.invalidVerificationCode);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage("");
    setMessage("");

    if (!newPassword || !confirmNewPassword) {
      setErrorMessage(strings[language].loginPage.alertFillAllFields);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage(strings[language].signupPage.alertPasswordMismatch);
      return;
    }

    const validationResult = validatePassword(newPassword);
    if (
      !validationResult.minLength ||
      !validationResult.minLettersAndCase ||
      !validationResult.minNumbers ||
      !validationResult.minSpecialChars ||
      validationResult.invalidChars
    ) {
      setErrorMessage(strings[language].signupPage.passwordValidationMessage);
      return;
    }

    let result;
    if (method === "phone") {
      result = await resetPassword(phoneNumber, userId, newPassword);
    } else {
      result = await resetPasswordByEmail(email, userId, newPassword);
    }

    if (result.success) {
      setMessage(strings[language].findAccount.passwordResetSuccess);
      setTimeout(() => {
        onClose();
      }, 2000); // 성공 메시지 표시 후 모달 닫기
    } else {
      setErrorMessage(
        result.message || strings[language].findAccount.passwordResetFailed
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {strings[language].findAccount.findPasswordTitle}
        </h2>
        {errorMessage && (
          <p className="text-red-400 text-center mb-4">{errorMessage}</p>
        )}
        {message && (
          <p className="text-green-400 text-center mb-4">{message}</p>
        )}

        {step === 1 && (
          <>
            <div className="flex justify-center mb-4">
              <button
                className={`px-4 py-2 rounded-l-md ${
                  method === "phone"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setMethod("phone")}
              >
                {strings[language].findAccount.phoneNumber}
              </button>
              <button
                className={`px-4 py-2 rounded-r-md ${
                  method === "email"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setMethod("email")}
              >
                {strings[language].findAccount.email}
              </button>
            </div>

            <div className="mb-4">
              <label
                htmlFor="userId"
                className="block text-gray-300 text-sm mb-2"
              >
                {strings[language].findAccount.enterId}
              </label>
              <input
                type="text"
                id="userId"
                className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={strings[language].findAccount.enterId}
              />
            </div>

            {method === "phone" ? (
              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-gray-300 text-sm mb-2"
                >
                  {strings[language].findAccount.enterPhoneNumber}
                </label>
                <input
                  type="text"
                  id="phone"
                  className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={strings[language].findAccount.enterPhoneNumber}
                />
              </div>
            ) : (
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-300 text-sm mb-2"
                >
                  {strings[language].findAccount.enterEmail}
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={strings[language].findAccount.enterEmail}
                />
              </div>
            )}
            <button
              onClick={handleSendCode}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition duration-200 mt-4"
            >
              {strings[language].findAccount.sendVerificationCode}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-4">
              <label
                htmlFor="verificationCode"
                className="block text-gray-300 text-sm mb-2"
              >
                {strings[language].findAccount.verifyCode}
              </label>
              <input
                type="text"
                id="verificationCode"
                className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={
                  strings[language].phoneNumberVerification.codePlaceholder
                }
              />
            </div>
            <button
              onClick={handleVerifyCode}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition duration-200 mt-4"
            >
              {strings[language].findAccount.verifyCode}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              {strings[language].findAccount.resetPasswordTitle}
            </h3>
            <div className="mb-4">
              <label
                htmlFor="newPassword"
                className="block text-gray-300 text-sm mb-2"
              >
                {strings[language].findAccount.newPasswordLabel}
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={
                  strings[language].findAccount.newPasswordPlaceholder
                }
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="confirmNewPassword"
                className="block text-gray-300 text-sm mb-2"
              >
                {strings[language].findAccount.confirmNewPasswordLabel}
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder={
                  strings[language].findAccount.confirmNewPasswordPlaceholder
                }
              />
            </div>
            <button
              onClick={handleResetPassword}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition duration-200 mt-4"
            >
              {strings[language].findAccount.resetPasswordButton}
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gray-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-gray-700 transition duration-200 mt-2"
        >
          {strings[language].signupPage.closeButton}
        </button>
      </div>
    </div>
  );
}
