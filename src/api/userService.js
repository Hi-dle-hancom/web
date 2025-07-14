// src/api/userService.js

// 몽고디비 'teamPlay' 컬렉션 시뮬레이션 (인메모리 배열)
// 실제 MongoDB 환경에서는 데이터베이스 쿼리를 사용합니다.
const teamPlayCollection = [];

/**
 * 회원가입 데이터를 백엔드 API로 전송하는 것을 시뮬레이션하는 함수입니다.
 * 실제 애플리케이션에서는 이 함수가 서버의 /api/register 엔드포인트와 통신하게 됩니다.
 *
 * @param {object} userData - 회원가입에 필요한 사용자 데이터 (예: country, phoneNumber, email, userId, password, developerLevel)
 * @returns {Promise<object>} - 성공 또는 실패 메시지를 포함하는 Promise
 */
export const registerUser = async (userData) => {
  console.log("Attempting to register user with data:", userData);

  // 시뮬레이션 지연 (네트워크 지연 효과)
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    // 1. 전화번호 중복 확인 (기기 하나에 한 계정)
    // 전화번호와 동일한 아이디를 가진 계정이 이미 있는지 확인
    const existingUserByPhoneAndId = teamPlayCollection.find(
      (user) =>
        user.phoneNumber === userData.phoneNumber &&
        user.userId === userData.userId
    );
    if (existingUserByPhoneAndId) {
      throw new Error("기기 하나에 한 계정만 가입 가능합니다.");
    }

    // 2. 전화번호만으로 중복 확인 (이미 해당 전화번호로 다른 계정이 있는지)
    const existingUserByPhone = teamPlayCollection.find(
      (user) => user.phoneNumber === userData.phoneNumber
    );
    if (existingUserByPhone) {
      throw new Error(
        "이미 해당 전화번호로 가입된 계정이 있습니다. ID 찾기를 이용해주세요."
      );
    }

    // 3. ID 중복 확인 (회원가입 단계에서 이미 체크했겠지만, 최종 저장 전 한 번 더 확인)
    const existingUserById = teamPlayCollection.find(
      (user) => user.userId === userData.userId
    );
    if (existingUserById) {
      throw new Error("이미 사용 중인 아이디입니다.");
    }

    // 비밀번호 해싱 시뮬레이션 (실제로는 보안을 위해 솔트와 해싱 라이브러리 사용)
    const hashedPassword = `hashed_${userData.password}`;

    // 사용자 데이터 저장
    const newUser = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
    };
    teamPlayCollection.push(newUser);

    console.log("User registered successfully:", newUser);
    console.log("Current teamPlayCollection:", teamPlayCollection);

    return { success: true, message: "회원가입이 성공적으로 완료되었습니다." };
  } catch (error) {
    console.error("User registration failed:", error.message);
    return {
      success: false,
      message: error.message || "회원가입 중 오류가 발생했습니다.",
    };
  }
};

/**
 * ID 중복 확인을 백엔드 API로 요청하는 것을 시뮬레이션하는 함수입니다.
 *
 * @param {string} userId - 확인할 사용자 ID
 * @returns {Promise<boolean>} - ID 사용 가능 여부 (true: 사용 가능, false: 사용 중)
 */
export const checkUserIdAvailability = async (userId) => {
  console.log(`Checking ID availability for: ${userId}`);
  // 시뮬레이션 지연
  await new Promise((resolve) => setTimeout(resolve, 300));
  const isAvailable = !teamPlayCollection.some(
    (user) => user.userId === userId
  );
  return isAvailable;
};

/**
 * 사용자 로그인을 시뮬레이션하는 함수입니다.
 *
 * @param {string} userId - 사용자 ID
 * @param {string} password - 비밀번호
 * @returns {Promise<object>} - 로그인 성공 또는 실패 메시지를 포함하는 Promise
 */
export const loginUser = async (userId, password) => {
  console.log(`Attempting to log in user: ${userId}`);
  await new Promise((resolve) => setTimeout(resolve, 500)); // 시뮬레이션 지연

  const user = teamPlayCollection.find((u) => u.userId === userId);

  if (!user) {
    console.log("Login failed: User not found.");
    return { success: false, message: "사용자를 찾을 수 없습니다." };
  }

  // 비밀번호 비교 시뮬레이션 (실제로는 해싱된 비밀번호와 비교)
  const hashedPassword = `hashed_${password}`;
  if (user.password !== hashedPassword) {
    console.log("Login failed: Invalid password.");
    return { success: false, message: "비밀번호가 일치하지 않습니다." };
  }

  console.log("Login successful:", user);
  return { success: true, message: "로그인 성공!", user };
};

/**
 * 전화번호를 기반으로 사용자 ID를 찾는 것을 시뮬레이션합니다.
 *
 * @param {string} phoneNumber - 사용자 전화번호
 * @returns {Promise<object>} - 성공 여부 및 사용자 ID 또는 메시지
 */
export const findIdByPhoneNumber = async (phoneNumber) => {
  console.log(`Attempting to find ID by phone number: ${phoneNumber}`);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = teamPlayCollection.find((u) => u.phoneNumber === phoneNumber);

  if (!user) {
    return { success: false, message: "해당 전화번호로 가입된 ID가 없습니다." };
  }

  return { success: true, userId: user.userId };
};

/**
 * 이메일을 기반으로 사용자 ID를 찾는 것을 시뮬레이션합니다.
 *
 * @param {string} email - 사용자 이메일
 * @returns {Promise<object>} - 성공 여부 및 사용자 ID 또는 메시지
 */
export const findIdByEmail = async (email) => {
  console.log(`Attempting to find ID by email: ${email}`);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = teamPlayCollection.find((u) => u.email === email);

  if (!user) {
    return { success: false, message: "해당 이메일로 가입된 ID가 없습니다." };
  }

  return { success: true, userId: user.userId };
};

/**
 * 비밀번호 재설정을 위해 전화번호와 ID를 확인하는 것을 시뮬레이션합니다.
 *
 * @param {string} phoneNumber - 사용자 전화번호
 * @param {string} userId - 사용자 ID
 * @returns {Promise<object>} - 성공 여부 및 메시지
 */
export const verifyPhoneAndIdForPasswordReset = async (phoneNumber, userId) => {
  console.log(
    `Verifying phone: ${phoneNumber}, ID: ${userId} for password reset`
  );
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = teamPlayCollection.find(
    (u) => u.phoneNumber === phoneNumber && u.userId === userId
  );

  if (!user) {
    return {
      success: false,
      message: "전화번호와 ID 조합을 찾을 수 없습니다.",
    };
  }

  return {
    success: true,
    message: "전화번호와 ID가 확인되었습니다. 새 비밀번호를 설정해주세요.",
  };
};

/**
 * 확인된 전화번호와 ID로 사용자의 비밀번호를 업데이트하는 것을 시뮬레이션합니다.
 *
 * @param {string} phoneNumber - 사용자 전화번호 (식별용)
 * @param {string} userId - 사용자 ID (식별용)
 * @param {string} newPassword - 새로 설정할 비밀번호
 * @returns {Promise<object>} - 성공 여부 및 메시지
 */
export const resetPassword = async (phoneNumber, userId, newPassword) => {
  console.log(
    `Attempting to reset password for phone: ${phoneNumber}, ID: ${userId}`
  );
  await new Promise((resolve) => setTimeout(resolve, 500));

  const userIndex = teamPlayCollection.findIndex(
    (u) => u.phoneNumber === phoneNumber && u.userId === userId
  );

  if (userIndex === -1) {
    return { success: false, message: "사용자 정보를 찾을 수 없습니다." };
  }

  // 새 비밀번호 해싱 시뮬레이션
  const hashedNewPassword = `hashed_${newPassword}`;
  teamPlayCollection[userIndex].password = hashedNewPassword;
  console.log(
    "Password reset successful. Updated user:",
    teamPlayCollection[userIndex]
  );
  return { success: true, message: "비밀번호가 성공적으로 재설정되었습니다." };
};

/**
 * 비밀번호 재설정을 위해 이메일과 ID를 확인하는 것을 시뮬레이션합니다.
 *
 * @param {string} email - 사용자 이메일
 * @param {string} userId - 사용자 ID
 * @returns {Promise<object>} - 성공 여부 및 메시지
 */
export const verifyEmailAndIdForPasswordReset = async (email, userId) => {
  console.log(`Verifying email: ${email}, ID: ${userId} for password reset`);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = teamPlayCollection.find(
    (u) => u.email === email && u.userId === userId
  );

  if (!user) {
    return { success: false, message: "이메일과 ID 조합을 찾을 수 없습니다." };
  }

  return {
    success: true,
    message: "이메일과 ID가 확인되었습니다. 새 비밀번호를 설정해주세요.",
  };
};

/**
 * 확인된 이메일과 ID로 사용자의 비밀번호를 업데이트하는 것을 시뮬레이션합니다.
 *
 * @param {string} email - 사용자 이메일 (식별용)
 * @param {string} userId - 사용자 ID (식별용)
 * @param {string} newPassword - 새로 설정할 비밀번호
 * @returns {Promise<object>} - 성공 여부 및 메시지
 */
export const resetPasswordByEmail = async (email, userId, newPassword) => {
  console.log(
    `Attempting to reset password for email: ${email}, ID: ${userId}`
  );
  await new Promise((resolve) => setTimeout(resolve, 500));

  const userIndex = teamPlayCollection.findIndex(
    (u) => u.email === email && u.userId === userId
  );

  if (userIndex === -1) {
    return { success: false, message: "사용자 정보를 찾을 수 없습니다." };
  }

  const hashedNewPassword = `hashed_${newPassword}`;
  teamPlayCollection[userIndex].password = hashedNewPassword;
  console.log(
    "Password reset successful by email. Updated user:",
    teamPlayCollection[userIndex]
  );
  return { success: true, message: "비밀번호가 성공적으로 재설정되었습니다." };
};

/**
 * 모든 등록된 사용자 ID를 반환하는 함수입니다.
 * 시뮬레이션이므로 실제 데이터베이스 쿼리를 대체합니다.
 * @returns {Promise<string[]>} - 등록된 모든 사용자 ID 배열
 */
export const getAllUserIds = async () => {
  console.log("Fetching all user IDs...");
  await new Promise((resolve) => setTimeout(resolve, 200)); // 시뮬레이션 지연
  return teamPlayCollection.map((user) => user.userId);
};
