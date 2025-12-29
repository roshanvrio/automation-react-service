import { useState, useEffect, useRef } from 'react';

const QueueCountDisplay = ({ count, totalCount, onAnimationChange }) => {
  const [displayValue, setDisplayValue] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousCountRef = useRef(null);
  const isInitialMount = useRef(true);
  const animationInProgressRef = useRef(false);

  // Store callback in ref to avoid dependency issues
  const onAnimationChangeRef = useRef(onAnimationChange);
  onAnimationChangeRef.current = onAnimationChange;

  // Convert count to number for comparison
  const currentCountNum = parseInt(count, 10);

  useEffect(() => {
    // Skip if animation is already in progress
    if (animationInProgressRef.current) {
      return;
    }

    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousCountRef.current = currentCountNum;
      setDisplayValue(count);
      return;
    }

    const prevCountNum = previousCountRef.current;

    // Detect if count decreased (process assigned to VM)
    if (!isNaN(currentCountNum) && !isNaN(prevCountNum) && currentCountNum < prevCountNum) {
      animationInProgressRef.current = true;

      // Show -1 animation
      setIsAnimating(true);
      onAnimationChangeRef.current?.(true);
      setDisplayValue('-1');

      // After 1 second, show the new count
      const timeout = setTimeout(() => {
        setDisplayValue(currentCountNum.toString());
        setIsAnimating(false);
        onAnimationChangeRef.current?.(false);
        animationInProgressRef.current = false;
        previousCountRef.current = currentCountNum;
      }, 1000);

      return () => {
        clearTimeout(timeout);
        animationInProgressRef.current = false;
      };
    } else {
      // No animation needed, just updates
      setDisplayValue(count);
      previousCountRef.current = currentCountNum;
    }
  }, [count, currentCountNum]);

  // Format as "current/total" or just show -1 during animation
  const formattedDisplay = isAnimating
    ? displayValue
    : (totalCount && totalCount !== '-' ? `${displayValue}/${totalCount}` : displayValue);

  return (
    <span className={`bot-count ${isAnimating ? 'count-decreasing' : ''}`}>
      {formattedDisplay}
    </span>
  );
};

export default QueueCountDisplay;
