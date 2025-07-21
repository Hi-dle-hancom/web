import React from "react";
import RightTabs from "./RightTabs.js";
import "../../index.css"; // CSS 파일 import

const RightPanel = ({ latestAnswer }) => (
  <div className="w-[380px] min-w-[320px] flex-shrink-0 p-8 right-panel-container">
    <RightTabs latestAnswer={latestAnswer} />
  </div>
);
export default RightPanel;
