// src/components/TeamMember/TokenUsageTab.js
import React from "react";

const TokenUsageTab = () => (
  <div className="bg-gray-700 dark:bg-gray-800 border border-gray-600 dark:border-gray-700 rounded-lg p-4 min-h-[80px] flex flex-col items-center justify-center gap-2">
    <div className="text-lg font-semibold text-white dark:text-gray-50">
      토큰 사용량
    </div>
    <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">0</div>
    <div className="text-sm text-gray-500">예시: 실제 사용량 표시 영역</div>
  </div>
);

export default TokenUsageTab;
