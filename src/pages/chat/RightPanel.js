// src/components/TeamMember/RightPanel.js
import React from "react";
import RightTabs from "./RightTabs.js";

const RightPanel = ({ latestAnswer }) => (
  <div className="w-[380px] min-w-[320px] bg-gray-900 dark:bg-gray-950 border-l-2 border-gray-800 dark:border-gray-900 flex-shrink-0 p-8">
    <RightTabs latestAnswer={latestAnswer} />
  </div>
);
export default RightPanel;
