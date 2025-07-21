import React, { useEffect, useCallback } from "react";
import DotNavigation from "../components/DotNavigation";
import image1 from "../assets/min1.jpg";
import image2 from "../assets/min2.jpg";
import image3 from "../assets/min3.jpg";
import { useLanguage } from "../context/LanguageContext";
import strings from "../locales/strings";
import { useFullPageScroll } from "../hooks/useFullPage";
import "../index.css"; // CSS 파일 import

export default function HomePage({ onSectionChange, resetTrigger }) {
  const { language } = useLanguage();

  const FIRST_SECTION = 1;
  const LAST_SECTION = 4;

  const {
    currentSection,
    nextSection,
    scrollOffset,
    scrollToSection,
    getOpacity,
    getInitialContentOpacity,
  } = useFullPageScroll(FIRST_SECTION, LAST_SECTION);

  const handleExploreClick = useCallback(() => {
    scrollToSection(FIRST_SECTION + 1);
  }, [scrollToSection, FIRST_SECTION]);

  const handleDotClick = useCallback(
    (sectionNum) => {
      scrollToSection(sectionNum);
    },
    [scrollToSection]
  );

  useEffect(() => {
    if (resetTrigger) {
      scrollToSection(FIRST_SECTION);
    }
  }, [resetTrigger, scrollToSection, FIRST_SECTION]);

  useEffect(() => {
    onSectionChange(currentSection, scrollOffset);
  }, [currentSection, scrollOffset, onSectionChange]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Screen 1 */}
      <section
        className="fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-500"
        style={{
          opacity: getOpacity(1),
          zIndex:
            (currentSection === 1 || nextSection === 1) && nextSection !== null
              ? 10
              : 0,
        }}
      >
        {/* 중앙 로고와 텍스트 */}
        <div
          className="relative text-center z-10 transition-opacity duration-500 homepage-text-content"
          style={{ opacity: getInitialContentOpacity() }}
        >
          <div className="text-8xl font-black mb-4">
            {strings[language].homePage.titlePart1}
          </div>
          <div className="text-3xl font-light">
            {strings[language].homePage.titlePart2}
          </div>
          <button
            onClick={handleExploreClick}
            className="mt-8 px-8 py-3 text-xl font-bold rounded-full transition duration-300 shadow-lg explore-button"
          >
            {strings[language].homePage.exploreButton}
          </button>
        </div>

        {/* 배경 이미지 */}
        <img
          src={image1}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </section>

      {/* Screen 2 */}
      <section
        className="fixed inset-0 flex items-center justify-center transition-opacity duration-500"
        style={{
          opacity: getOpacity(2),
          zIndex:
            (currentSection === 2 || nextSection === 2) && nextSection !== null
              ? 10
              : 0,
        }}
      >
        <img
          src={image1}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="z-10 text-5xl font-bold homepage-section-text">
          {strings[language].homePage.sectionA}
        </div>
      </section>

      {/* Screen 3 */}
      <section
        className="fixed inset-0 flex items-center justify-center transition-opacity duration-500"
        style={{
          opacity: getOpacity(3),
          zIndex:
            (currentSection === 3 || nextSection === 3) && nextSection !== null
              ? 10
              : 0,
        }}
      >
        <img
          src={image2}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="z-10 text-5xl font-bold homepage-section-text">
          {strings[language].homePage.sectionB}
        </div>
      </section>

      {/* Screen 4 */}
      <section
        className="fixed inset-0 flex items-center justify-center transition-opacity duration-500"
        style={{
          opacity: getOpacity(4),
          zIndex:
            (currentSection === 4 || nextSection === 4) && nextSection !== null
              ? 10
              : 0,
        }}
      >
        <img
          src={image3}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="z-10 text-5xl font-bold homepage-section-text">
          {strings[language].homePage.sectionC}
        </div>
      </section>

      {/* DotNavigation 다시 활성화 */}
      <DotNavigation
        currentSection={currentSection}
        onDotClick={handleDotClick}
        totalSections={LAST_SECTION}
      />
    </div>
  );
}
