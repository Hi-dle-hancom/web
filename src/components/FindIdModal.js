// src/components/FindIdModal.js
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import { findIdByPhoneNumber, findIdByEmail } from "../api/userService";

export default function FindIdModal({ onClose }) {
  const { language } = useLanguage();
  const [method, setMethod] = useState("phone"); // 'phone' 또는 'email'
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  // const [foundId, setFoundId] = useState(""); // 이 줄을 제거합니다.
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState(""); // 성공 메시지용

  const handleFindId = async () => {
    // setFoundId(""); // 이 줄을 제거합니다.
    setErrorMessage("");
    setMessage("");

    if (method === "phone") {
      if (!phoneNumber) {
        setErrorMessage(strings[language].loginPage.alertFillAllFields);
        return;
      }
      const result = await findIdByPhoneNumber(phoneNumber);
      if (result.success) {
        // setFoundId(result.userId); // 이 줄을 제거합니다.
        setMessage(
          `${strings[language].findAccount.foundId}: ${result.userId}`
        );
      } else {
        setErrorMessage(
          result.message || strings[language].findAccount.userNotFound
        );
      }
    } else {
      // method === 'email'
      if (!email) {
        setErrorMessage(strings[language].loginPage.alertFillAllFields);
        return;
      }
      const result = await findIdByEmail(email);
      if (result.success) {
        // setFoundId(result.userId); // 이 줄을 제거합니다.
        setMessage(
          `${strings[language].findAccount.foundId}: ${result.userId}`
        );
      } else {
        setErrorMessage(
          result.message || strings[language].findAccount.userNotFound
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {strings[language].findAccount.findIdTitle}
        </h2>
        {errorMessage && (
          <p className="text-red-400 text-center mb-4">{errorMessage}</p>
        )}
        {message && (
          <p className="text-green-400 text-center mb-4">{message}</p>
        )}

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

        {method === "phone" ? (
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-300 text-sm mb-2">
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
            <label htmlFor="email" className="block text-gray-300 text-sm mb-2">
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
          onClick={handleFindId}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition duration-200 mt-4"
        >
          {strings[language].findAccount.findIdTitle}
        </button>

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
