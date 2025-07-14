// tailwind.config.js
module.exports = {
  darkMode: "class", // 이 부분이 'class'로 설정되어 있는지 확인하세요.
  content: [
    "./**.{js,jsx,ts,tsx}",
    "./public/index.html", // index.html도 content에 포함되어야 합니다.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
