import React from "react";
import "../index.css"; // CSS 파일 import

function DotNavigation({ currentSection, totalSections, onDotClick }) {
  const dots = Array.from({ length: totalSections }, (_, i) => i + 1);

  return (
    <div className="dot-navigation-container">
      {dots.map((sectionNum) => (
        <button
          key={sectionNum}
          onClick={() => onDotClick(sectionNum)}
          className={`dot-navigation-button ${
            currentSection === sectionNum ? "dot-navigation-button-active" : ""
          }`}
          aria-label={`Go to section ${sectionNum}`}
        ></button>
      ))}
    </div>
  );
}

export default DotNavigation;
