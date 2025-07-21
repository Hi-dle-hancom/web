import React from "react";
import "../../index.css"; // CSS 파일 import

const TokenUsageTab = () => (
  <div className="rounded-lg p-4 min-h-[80px] flex flex-col items-center justify-center gap-2 token-usage-container">
    <div className="text-lg font-semibold token-usage-title">토큰 사용량</div>
    <div className="text-2xl font-bold token-usage-value">0</div>
    <div className="text-sm token-usage-example">
      예시: 실제 사용량 표시 영역
    </div>
  </div>
);

export default TokenUsageTab;
