// src/utils/validation.js

import { PHONE_NUMBER_LENGTHS } from "../data/phoneConfig";

/**
 * 전화번호의 유효성을 검사합니다.
 * - 숫자만 포함하는지
 * - 선택된 국가 코드(phoneCode)에 맞는 길이를 가지는지
 * - 한국의 경우 11자리일 때 '010'으로 시작하는지
 * @param {string} phoneNumber - 입력된 전화번호 문자열 (국가 코드 제외)
 * @param {string} phoneCode - 선택된 국가 코드 (예: '+82')
 * @returns {{digitsOnly: boolean, lengthValid: boolean, prefixMatch: boolean}} 유효성 검사 결과 객체
 */
export const validatePhoneNumber = (phoneNumber, phoneCode) => {
  // 입력이 없을 때는 초기 상태로 반환하여 모든 조건이 충족되지 않은 것으로 표시
  if (phoneNumber === "") {
    return { digitsOnly: true, lengthValid: false, prefixMatch: false };
  }

  const digitsOnly = /^\d*$/.test(phoneNumber);
  let lengthValid = false;
  let prefixMatch = true; // 기본적으로 true로 설정

  if (digitsOnly) {
    if (
      typeof phoneCode !== "string" ||
      !phoneCode.startsWith("+") ||
      phoneCode.length < 2
    ) {
      console.error(
        "유효하지 않은 phoneCode가 validatePhoneNumber에 전달되었습니다:",
        phoneCode
      );
      return { digitsOnly: false, lengthValid: false, prefixMatch: false };
    }

    const countryCodeWithoutPlus = phoneCode.substring(1);
    // `phoneConfig.js`의 키가 숫자로 되어 있으므로 parseInt를 사용하여 숫자로 변환합니다.
    const countryCodeNum = parseInt(countryCodeWithoutPlus, 10);
    const lengths = PHONE_NUMBER_LENGTHS[countryCodeNum];

    // **이 부분이 수정되었습니다:** lengths가 객체인지 확인하고 min/max 범위를 검사합니다.
    if (
      lengths && // lengths 객체가 존재하는지 확인
      typeof lengths === "object" && // lengths가 객체인지 확인
      "min" in lengths &&
      "max" in lengths && // min과 max 속성이 있는지 확인
      phoneNumber.length >= lengths.min &&
      phoneNumber.length <= lengths.max
    ) {
      lengthValid = true;
    } else {
      // 해당 국가 코드에 대한 길이가 정의되지 않았거나 유효한 객체가 아닌 경우,
      // 또는 범위 밖인 경우, 길이를 유효하지 않은 것으로 간주
      lengthValid = false;
    }

    // 한국 (010) 특수 규칙
    if (phoneCode === "+82" && phoneNumber.length === 11) {
      prefixMatch = phoneNumber.startsWith("010");
    }
  } else {
    // 숫자가 아닌 문자가 포함되어 있다면, digitsOnly는 false이고,
    // lengthValid와 prefixMatch도 false로 설정하는 것이 합리적입니다.
    return { digitsOnly: false, lengthValid: false, prefixMatch: false };
  }

  return { digitsOnly, lengthValid, prefixMatch };
};

/**
 * 이메일 주소의 유효성을 검사합니다.
 * @param {string} localPart - 이메일 주소의 로컬 부분 (예: "user")
 * @param {string} domain - 이메일 주소의 도메인 부분 (예: "example.com")
 * @returns {boolean} 유효한 이메일 주소면 true, 아니면 false
 */
export const validateEmail = (localPart, domain) => {
  // Trim the parts to remove leading/trailing whitespace
  const trimmedLocalPart = localPart ? localPart.trim() : "";
  const trimmedDomain = domain ? domain.trim() : "";

  // 로컬 부분과 도메인 부분이 비어있는지 확인 (이제 트림된 값 사용)
  if (!trimmedLocalPart) {
    // Can just check for falsy after trimming
    return false;
  }
  if (!trimmedDomain) {
    // Can just check for falsy after trimming
    return false;
  }

  // 일반적인 이메일 형식 정규 표현식 (RFC 5322 준수)
  // 이 정규 표현식은 실제 서비스에서 사용하기에 충분히 강력하지만, 모든 엣지 케이스를 다루지는 않습니다.
  const emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  // 로컬 부분과 도메인 부분을 결합하여 전체 이메일 주소를 만듭니다.
  const fullEmail = `${trimmedLocalPart}@${trimmedDomain}`;

  // 정규 표현식으로 유효성 검사
  return emailRegex.test(fullEmail);
};

/**
 * 비밀번호 유효성 검사를 수행합니다.
 * @param {string} password - 검사할 비밀번호 문자열
 * @returns {{
 * minLength: boolean,
 * minLettersAndCase: boolean,
 * minNumbers: boolean,
 * minSpecialChars: boolean,
 * invalidChars: boolean
 * }} 유효성 검사 결과 객체
 */
export const validatePassword = (password) => {
  // 'export' 추가
  const minLength = password.length >= 10;
  const minLettersAndCase =
    (password.match(/[a-z]/g) || []).length >= 1 && // 최소 1개의 소문자
    (password.match(/[A-Z]/g) || []).length >= 1 && // 최소 1개의 대문자
    (password.match(/[a-zA-Z]/g) || []).length >= 4; // 최소 4개의 알파벳 (대소문자 포함)
  const minNumbers = (password.match(/\d/g) || []).length >= 2;
  const minSpecialChars =
    (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/g) || []).length >=
    3;
  // 허용되지 않는 특수 문자 확인 (', ", \, <, >, &, `)
  const invalidChars = /['"\\<>&`]/.test(password);

  return {
    minLength,
    minLettersAndCase,
    minNumbers,
    minSpecialChars,
    invalidChars,
  };
};

/**
 * 사용자 아이디 유효성 검사를 수행합니다.
 * - 최소 6자, 최대 15자
 * - 알파벳, 숫자, 언더스코어(_)만 허용
 * @param {string} userId - 검사할 사용자 아이디 문자열
 * @returns {{minLength: boolean, maxLength: boolean, validChars: boolean}} 유효성 검사 결과 객체
 */
export const validateUserId = (userId) => {
  const minLength = userId.length >= 6;
  const maxLength = userId.length <= 15;
  const validChars = /^[a-zA-Z0-9_]*$/.test(userId); // 알파벳, 숫자, 언더스코어만 허용

  return { minLength, maxLength, validChars };
};
