// src/components/DotNavigation.js
import React from "react";

function DotNavigation({ currentSection, totalSections, onDotClick }) {
  // showCircles prop 제거
  const dots = Array.from({ length: totalSections }, (_, i) => i + 1);

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-4 z-50">
      {dots.map((sectionNum) => (
        <button
          key={sectionNum}
          onClick={() => onDotClick(sectionNum)}
          className={`w-4 h-4 rounded-full transition-colors duration-300
            ${
              currentSection === sectionNum
                ? "bg-blue-500"
                : "bg-gray-500 hover:bg-gray-400"
            }`}
          aria-label={`Go to section ${sectionNum}`}
        ></button>
      ))}
    </div>
  );
}

export default DotNavigation;
