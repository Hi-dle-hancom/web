import { useState, useEffect, useRef, useCallback } from "react";

const WHEEL_THRESHOLD = 400; // 휠 델타 누적 임계값
const TOUCH_THRESHOLD = 100; // 터치 스와이프 감지 임계값
const SCROLL_DEBOUNCE_TIME = 200; // 스크롤 이벤트 디바운스 시간

// firstSection, lastSection 매개변수 추가
export function useFullPageScroll(
  firstSection = 1,
  lastSection = 4,
  initialSection = 1
) {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [nextSection, setNextSection] = useState(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const scrollAccumulator = useRef(0);
  const animationFrameId = useRef(null);
  const lastInteractionTime = useRef(0);

  // 공통 스크롤 애니메이션 프레임 요청
  const animateScroll = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(() => {});
  }, []);

  // 섹션 이동 최종 확정 및 상태 초기화
  const finalizeSectionChange = useCallback(
    (targetSectionNum) => {
      // 목표 섹션이 유효 범위 내에 있는지 확인
      if (targetSectionNum >= firstSection && targetSectionNum <= lastSection) {
        setCurrentSection(targetSectionNum);
        setNextSection(null);
        setScrollOffset(0);
        scrollAccumulator.current = 0;
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      }
    },
    [firstSection, lastSection]
  );

  // 특정 섹션으로 즉시 이동 (닷 네비게이션, 버튼 클릭 등)
  const scrollToSection = useCallback(
    (targetSectionNum) => {
      finalizeSectionChange(targetSectionNum);
    },
    [finalizeSectionChange]
  );

  // 휠 이벤트 핸들러
  const handleWheel = useCallback(
    (event) => {
      event.preventDefault();

      const now = Date.now();
      if (now - lastInteractionTime.current < SCROLL_DEBOUNCE_TIME) {
        return;
      }
      lastInteractionTime.current = now;

      const delta = event.deltaY;
      let newScrollAccumulator = scrollAccumulator.current + delta;
      let targetNextSection = null;

      if (delta > 0) {
        // 아래로 스크롤
        if (currentSection < lastSection) {
          newScrollAccumulator = Math.min(
            WHEEL_THRESHOLD,
            newScrollAccumulator
          );
          targetNextSection = currentSection + 1;
        } else {
          newScrollAccumulator = Math.max(0, newScrollAccumulator);
        }
      } else if (delta < 0) {
        // 위로 스크롤
        if (currentSection > firstSection) {
          newScrollAccumulator = Math.max(
            -WHEEL_THRESHOLD,
            newScrollAccumulator
          );
          targetNextSection = currentSection - 1;
        } else {
          newScrollAccumulator = Math.min(0, newScrollAccumulator);
        }
      }

      scrollAccumulator.current = newScrollAccumulator;
      setScrollOffset(Math.abs(scrollAccumulator.current));

      if (
        Math.abs(scrollAccumulator.current) > 0 &&
        targetNextSection !== null &&
        targetNextSection !== currentSection
      ) {
        setNextSection(targetNextSection);
      } else if (
        Math.abs(scrollAccumulator.current) === 0 &&
        nextSection !== null
      ) {
        setNextSection(null);
      }

      if (Math.abs(scrollAccumulator.current) >= WHEEL_THRESHOLD) {
        const finalTargetSection =
          delta > 0 ? currentSection + 1 : currentSection - 1;
        if (
          finalTargetSection >= firstSection &&
          finalTargetSection <= lastSection
        ) {
          finalizeSectionChange(finalTargetSection);
        } else {
          // 범위 밖이면 상태 초기화
          setScrollOffset(0);
          scrollAccumulator.current = 0;
          setNextSection(null);
        }
      }

      animateScroll();
    },
    [
      currentSection,
      nextSection,
      firstSection,
      lastSection,
      animateScroll,
      finalizeSectionChange,
    ]
  );

  // 터치 이벤트 관련 Ref
  const touchStartY = useRef(0);
  const touchMoveX = useRef(0);

  // 터치 시작 핸들러
  const handleTouchStart = useCallback((event) => {
    lastInteractionTime.current = Date.now();
    touchStartY.current = event.touches[0].clientY;
    touchMoveX.current = event.touches[0].clientX;

    if (animationFrameId.current)
      cancelAnimationFrame(animationFrameId.current);
    setScrollOffset(0);
    scrollAccumulator.current = 0;
    setNextSection(null);
  }, []);

  // 터치 이동 핸들러
  const handleTouchMove = useCallback(
    (event) => {
      const deltaX = Math.abs(event.touches[0].clientX - touchMoveX.current);
      if (deltaX > 10) {
        return;
      }
      event.preventDefault();

      const currentY = event.touches[0].clientY;
      const rawDeltaY = currentY - touchStartY.current;

      scrollAccumulator.current = rawDeltaY;

      const newScrollOffset = Math.min(TOUCH_THRESHOLD, Math.abs(rawDeltaY));
      setScrollOffset(newScrollOffset);

      let potentialNext = null;
      if (rawDeltaY < 0 && currentSection < lastSection) {
        potentialNext = currentSection + 1;
      } else if (rawDeltaY > 0 && currentSection > firstSection) {
        potentialNext = currentSection - 1;
      }

      if (
        Math.abs(rawDeltaY) > 0 &&
        potentialNext !== null &&
        potentialNext !== currentSection
      ) {
        setNextSection(potentialNext);
      } else if (Math.abs(rawDeltaY) === 0 && nextSection !== null) {
        setNextSection(null);
      }

      animateScroll();
    },
    [currentSection, nextSection, firstSection, lastSection, animateScroll]
  );

  // 터치 끝 핸들러
  const handleTouchEnd = useCallback(() => {
    let targetSection = currentSection;

    if (
      scrollAccumulator.current < -TOUCH_THRESHOLD &&
      currentSection < lastSection
    ) {
      targetSection = currentSection + 1;
    } else if (
      scrollAccumulator.current > TOUCH_THRESHOLD &&
      currentSection > firstSection
    ) {
      targetSection = currentSection - 1;
    }

    if (targetSection !== currentSection) {
      finalizeSectionChange(targetSection);
    } else {
      setScrollOffset(0);
      scrollAccumulator.current = 0;
      setNextSection(null);
    }

    if (animationFrameId.current)
      cancelAnimationFrame(animationFrameId.current);
  }, [currentSection, firstSection, lastSection, finalizeSectionChange]);

  // 이벤트 리스너 등록 및 해제
  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 각 섹션의 투명도 계산 로직
  const getOpacity = useCallback(
    (sectionNum) => {
      const progress = scrollOffset / WHEEL_THRESHOLD;

      // 첫 번째 섹션에서 더 이상 위로 스크롤할 수 없을 때 (오버스크롤 시)
      if (currentSection === firstSection && scrollAccumulator.current < 0) {
        return sectionNum === firstSection ? 1 : 0;
      }
      // 마지막 섹션에서 더 이상 아래로 스크롤할 수 없을 때 (오버스크롤 시)
      if (currentSection === lastSection && scrollAccumulator.current > 0) {
        return sectionNum === lastSection ? 1 : 0;
      }

      let opacityValue;
      if (sectionNum === currentSection) {
        opacityValue = 1 - progress;
      } else if (sectionNum === nextSection) {
        opacityValue = progress;
      } else {
        opacityValue = 0;
      }
      return opacityValue;
    },
    [currentSection, nextSection, scrollOffset, firstSection, lastSection]
  );

  // 초기 콘텐츠 (예: 1번 섹션의 헤더, 버튼 등)의 투명도 계산
  const getInitialContentOpacity = useCallback(() => {
    const progress = scrollOffset / WHEEL_THRESHOLD;
    // 첫 번째 섹션에서 오버스크롤 시 투명도 고정
    if (currentSection === firstSection && scrollAccumulator.current < 0)
      return 1;
    // 현재 섹션이 첫 번째 섹션이고, 전환 중이 아닐 때 투명도 1
    if (
      currentSection === firstSection &&
      nextSection === null &&
      scrollOffset === 0
    )
      return 1;
    // 첫 번째 섹션에서 다음 섹션으로 내려갈 때 투명도 감소 (nextSection이 firstSection + 1인 경우)
    if (currentSection === firstSection && nextSection === firstSection + 1)
      return 1 - progress;
    // 첫 번째 섹션의 다음 섹션에서 첫 번째 섹션으로 올라올 때 투명도 증가 (nextSection이 firstSection인 경우)
    if (currentSection === firstSection + 1 && nextSection === firstSection)
      return progress;
    return 0;
  }, [currentSection, nextSection, scrollOffset, firstSection]);

  // 외부에서 훅 사용 시 필요한 값들을 반환
  return {
    currentSection,
    nextSection,
    scrollOffset,
    scrollToSection,
    getOpacity,
    getInitialContentOpacity,
  };
}
