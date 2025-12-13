import React, { useState, useEffect, useRef } from 'react';

const QueueCountDisplay = ({ count, processName, onAnimationChange }) => {
  const [displayValue, setDisplayValue] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousCountRef = useRef(count);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousCountRef.current = count;
      setDisplayValue(count);
      return;
    }

    const prevCount = previousCountRef.current;
    const currentCount = parseInt(count, 10);
    const prevCountNum = parseInt(prevCount, 10);

    // Detect if count decreased (process assigned to VM)
    if (!isNaN(currentCount) && !isNaN(prevCountNum) && currentCount < prevCountNum) {
      const decrementAmount = prevCountNum - currentCount;
      let currentStep = 0;

      const runAnimation = () => {
        if (currentStep < decrementAmount) {
          // Show -1 animation
          setIsAnimating(true);
          onAnimationChange?.(true);
          setDisplayValue('-1');

          setTimeout(() => {
            // Show intermediate count
            const intermediateValue = prevCountNum - currentStep - 1;
            setDisplayValue(intermediateValue.toString());
            setIsAnimating(false);
            onAnimationChange?.(false);

            currentStep++;

            // Pause before next animation cycle
            if (currentStep < decrementAmount) {
              setTimeout(runAnimation, 200);
            }
          }, 1000); // Duration of -1 flash (1 second for visibility)
        }
      };

      runAnimation();
      previousCountRef.current = count;
      return;
    } else {
      // No animation needed, just update
      setDisplayValue(count);
      previousCountRef.current = count;
    }
  }, [count]);

  return (
    <span className={`bot-count ${isAnimating ? 'count-decreasing' : ''}`}>
      {displayValue}
    </span>
  );
};

export default QueueCountDisplay;
