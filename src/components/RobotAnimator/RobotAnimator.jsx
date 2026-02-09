import { useState, useEffect, useCallback, useRef } from "react";
import Lottie from "lottie-react";
import { useAnimation } from "../../context/AnimationContext";
import robotIdleAnimation from "../../assets/lottie/robot-idle.json";
import robotWorkingAnimation from "../../assets/lottie/robot-working.json";
import "./RobotAnimator.css";

// Robot states
const ROBOT_STATES = {
  IDLE: "idle",
  // Entry animation states
  MOVING_TO_QUEUE: "movingToQueue",
  PICKING_PROCESS: "pickingProcess",
  MOVING_TO_ENTRY: "movingToEntry",
  PICKING_VM: "pickingVm",
  DELIVERING_TO_CENTER: "deliveringToCenter",
  CELEBRATING: "celebrating",
  // Exit animation states
  MOVING_TO_CENTER: "movingToCenter",
  CHECKING_OUTCOME: "checkingOutcome",
  REACTING_SUCCESS: "reactingSuccess",
  REACTING_ERROR: "reactingError",
  REACTING_EXCEPTION: "reactingException",
  PICKING_COMPLETED_VM: "pickingCompletedVm",
  RETURNING_TO_ENTRY: "returningToEntry",
  PLACING_VM: "placingVm",
};

// Default idle position (percentage-based)
const IDLE_POSITION = { x: 50, y: 20, isPercent: true };

const RobotAnimator = () => {
  // Safely get animation context
  let animationContext = null;
  try {
    animationContext = useAnimation();
  } catch (e) {
    console.warn("RobotAnimator: Animation context not available");
    return null;
  }

  const { currentAnimation, animationPhase, completionAnimation } = animationContext || {};

  const [robotState, setRobotState] = useState(ROBOT_STATES.IDLE);
  const [robotPosition, setRobotPosition] = useState(IDLE_POSITION);
  const [carryingItems, setCarryingItems] = useState({ process: null, vm: null });
  const [isFlipped, setIsFlipped] = useState(false);
  const [usePixelPosition, setUsePixelPosition] = useState(false);
  const [currentOutcome, setCurrentOutcome] = useState(null);

  const animationTimeoutsRef = useRef([]);
  const lastAnimationIdRef = useRef(null);
  const lastExitAnimationIdRef = useRef(null);

  // Flag to skip animations on initial mount (only animate after receiving websocket data)
  const isInitialMountRef = useRef(true);

  // Queue system for robot animations (entry)
  const robotQueueRef = useRef([]);
  const isRobotAnimatingRef = useRef(false);

  // Queue system for exit animations
  const exitQueueRef = useRef([]);

  // Ref to hold the latest process functions
  const processRobotQueueRef = useRef(null);
  const processExitQueueRef = useRef(null);

  // Clear all pending timeouts
  const clearTimeouts = useCallback(() => {
    animationTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    animationTimeoutsRef.current = [];
  }, []);

  // Add a timeout to the list
  const addTimeout = useCallback((callback, delay) => {
    const timeout = setTimeout(callback, delay);
    animationTimeoutsRef.current.push(timeout);
    return timeout;
  }, []);

  // Process the next entry animation in robot queue
  const processRobotQueue = useCallback(() => {
    console.log("Robot: processRobotQueue called", {
      isAnimating: isRobotAnimatingRef.current,
      queueLength: robotQueueRef.current.length
    });

    if (isRobotAnimatingRef.current || robotQueueRef.current.length === 0) {
      console.log("Robot: Skipping - already animating or queue empty");
      return;
    }

    isRobotAnimatingRef.current = true;
    const animation = robotQueueRef.current.shift();

    // Get actual positions from the animation (these are pixel positions from AnimationContext)
    const botPos = animation.botPosition || { x: window.innerWidth * 0.15, y: window.innerHeight * 0.45 };
    const vmPos = animation.vmPosition || { x: window.innerWidth * 0.85, y: window.innerHeight * 0.45 };
    const centerPos = animation.centerPosition || { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };

    console.log("Robot: Starting ENTRY animation for", animation.machineName, "Queue remaining:", robotQueueRef.current.length);

    // Switch to pixel positioning mode
    setUsePixelPosition(true);
    setCurrentOutcome(null);

    // [0ms] Start moving to the actual bot/process position (left - BotsInQueue)
    setRobotState(ROBOT_STATES.MOVING_TO_QUEUE);
    setRobotPosition({ x: botPos.x, y: botPos.y, isPercent: false });
    setIsFlipped(false);

    // [300ms] Arrive at process, pick it up
    addTimeout(() => {
      setRobotState(ROBOT_STATES.PICKING_PROCESS);
      setCarryingItems({ process: animation.processName, vm: null });
    }, 300);

    // [500ms] Start moving to the actual VM position (right - Entry)
    addTimeout(() => {
      setRobotState(ROBOT_STATES.MOVING_TO_ENTRY);
      setRobotPosition({ x: vmPos.x, y: vmPos.y, isPercent: false });
      setIsFlipped(true);
    }, 500);

    // [1000ms] Arrive at VM, pick it up
    addTimeout(() => {
      setRobotState(ROBOT_STATES.PICKING_VM);
      setCarryingItems({ process: animation.processName, vm: animation.machineName });
    }, 1000);

    // [1200ms] Start delivering to center (ActiveVMs area)
    addTimeout(() => {
      setRobotState(ROBOT_STATES.DELIVERING_TO_CENTER);
      setRobotPosition({ x: centerPos.x, y: centerPos.y, isPercent: false });
      setIsFlipped(false);
    }, 1200);

    // [1800ms] Arrive at center, celebrate
    addTimeout(() => {
      setRobotState(ROBOT_STATES.CELEBRATING);
      setCarryingItems({ process: null, vm: null });
    }, 1800);

    // [2200ms] Return to idle and process next in queue
    addTimeout(() => {
      setRobotState(ROBOT_STATES.IDLE);
      setUsePixelPosition(false);
      setRobotPosition(IDLE_POSITION);
      setIsFlipped(false);

      // Mark as not animating and process next
      isRobotAnimatingRef.current = false;

      // Check if there are exit animations waiting, otherwise process entry queue
      if (exitQueueRef.current.length > 0) {
        setTimeout(() => {
          if (processExitQueueRef.current) {
            processExitQueueRef.current();
          }
        }, 300);
      } else if (robotQueueRef.current.length > 0) {
        setTimeout(() => {
          if (processRobotQueueRef.current) {
            processRobotQueueRef.current();
          }
        }, 300);
      }
    }, 2200);
  }, [addTimeout]);

  // Process the next exit animation (completion animation - goes to VM hexagon)
  const processExitQueue = useCallback(() => {
    console.log("Robot: processExitQueue called", {
      isAnimating: isRobotAnimatingRef.current,
      exitQueueLength: exitQueueRef.current.length
    });

    if (isRobotAnimatingRef.current || exitQueueRef.current.length === 0) {
      console.log("Robot: Skipping exit - already animating or queue empty");
      return;
    }

    isRobotAnimatingRef.current = true;
    const exitAnim = exitQueueRef.current.shift();

    // vmPosition is the actual hexagon position (not center)
    // Validate position - if invalid (too close to 0,0), use center fallback
    let vmHexPos = exitAnim.vmPosition;
    if (!vmHexPos || vmHexPos.x < 50 || vmHexPos.y < 50) {
      vmHexPos = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
      console.log("Robot: Using fallback center position due to invalid vmPosition");
    }
    const entryPos = exitAnim.entryPosition || { x: window.innerWidth * 0.85, y: window.innerHeight * 0.45 };
    const outcome = exitAnim.outcome || 'unknown';

    console.log("Robot: Starting EXIT animation for", exitAnim.machineName, "Outcome:", outcome, "VM Hex Position:", vmHexPos);

    // Switch to pixel positioning mode
    setUsePixelPosition(true);
    setCurrentOutcome(outcome);

    // [0ms] Move to the VM hexagon (where the completed VM is blinking)
    setRobotState(ROBOT_STATES.MOVING_TO_CENTER);
    setRobotPosition({ x: vmHexPos.x, y: vmHexPos.y, isPercent: false });
    setIsFlipped(false);

    // [400ms] Arrive at center, check the outcome
    addTimeout(() => {
      setRobotState(ROBOT_STATES.CHECKING_OUTCOME);
    }, 400);

    // [600ms] React based on outcome
    addTimeout(() => {
      if (outcome === 'success') {
        setRobotState(ROBOT_STATES.REACTING_SUCCESS);
      } else if (outcome === 'error') {
        setRobotState(ROBOT_STATES.REACTING_ERROR);
      } else {
        setRobotState(ROBOT_STATES.REACTING_EXCEPTION);
      }
    }, 600);

    // [1200ms] Pick up the completed VM
    addTimeout(() => {
      setRobotState(ROBOT_STATES.PICKING_COMPLETED_VM);
      setCarryingItems({ process: null, vm: exitAnim.machineName });
    }, 1200);

    // [1400ms] Start returning to Entry (right side)
    addTimeout(() => {
      setRobotState(ROBOT_STATES.RETURNING_TO_ENTRY);
      setRobotPosition({ x: entryPos.x, y: entryPos.y, isPercent: false });
      setIsFlipped(true);
    }, 1400);

    // [1900ms] Arrive at Entry, place the VM
    addTimeout(() => {
      setRobotState(ROBOT_STATES.PLACING_VM);
      setCarryingItems({ process: null, vm: null });
    }, 1900);

    // [2200ms] Return to idle
    addTimeout(() => {
      setRobotState(ROBOT_STATES.IDLE);
      setUsePixelPosition(false);
      setRobotPosition(IDLE_POSITION);
      setIsFlipped(false);
      setCurrentOutcome(null);

      // Mark as not animating and process next
      isRobotAnimatingRef.current = false;

      // Check for more animations
      if (exitQueueRef.current.length > 0) {
        setTimeout(() => {
          if (processExitQueueRef.current) {
            processExitQueueRef.current();
          }
        }, 300);
      } else if (robotQueueRef.current.length > 0) {
        setTimeout(() => {
          if (processRobotQueueRef.current) {
            processRobotQueueRef.current();
          }
        }, 300);
      }
    }, 2200);
  }, [addTimeout]);

  // Keep the refs updated with the latest functions
  processRobotQueueRef.current = processRobotQueue;
  processExitQueueRef.current = processExitQueue;

  // Listen for entry animation changes
  useEffect(() => {
    // Skip animations on initial mount - only animate after receiving websocket data
    if (isInitialMountRef.current) {
      return;
    }

    if (!currentAnimation || animationPhase !== "fly") {
      return;
    }

    // Check if we've already processed this animation
    if (currentAnimation.id === lastAnimationIdRef.current) {
      return;
    }

    lastAnimationIdRef.current = currentAnimation.id;

    console.log("Robot: Queueing ENTRY animation for", currentAnimation.machineName);

    // Add to queue
    robotQueueRef.current.push(currentAnimation);

    // Start processing if not already animating
    if (!isRobotAnimatingRef.current && processRobotQueueRef.current) {
      processRobotQueueRef.current();
    }
  }, [currentAnimation, animationPhase]);

  // Listen for completion animation changes (when VM starts blinking)
  useEffect(() => {
    // Skip animations on initial mount - only animate after receiving websocket data
    if (isInitialMountRef.current) {
      return;
    }

    if (!completionAnimation) {
      return;
    }

    // Check if we've already processed this completion animation
    if (completionAnimation.id === lastExitAnimationIdRef.current) {
      return;
    }

    lastExitAnimationIdRef.current = completionAnimation.id;

    console.log("Robot: Queueing COMPLETION animation for", completionAnimation.machineName, "Outcome:", completionAnimation.outcome);

    // Add to exit queue (uses the same queue for completion/exit animations)
    exitQueueRef.current.push(completionAnimation);

    // Start processing if not already animating
    if (!isRobotAnimatingRef.current && processExitQueueRef.current) {
      processExitQueueRef.current();
    }
  }, [completionAnimation]);

  // Mark initial mount as complete after first render cycle
  // This allows animations to trigger only after receiving new websocket data
  useEffect(() => {
    // Use a small delay to ensure we skip any stale animation state on page load
    const timer = setTimeout(() => {
      isInitialMountRef.current = false;
      console.log("Robot: Initial mount complete, now listening for websocket animations");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
      robotQueueRef.current = [];
      exitQueueRef.current = [];
      isRobotAnimatingRef.current = false;
    };
  }, [clearTimeouts]);

  // Determine which animation to show
  const isWorking = robotState !== ROBOT_STATES.IDLE;
  const animationData = isWorking ? robotWorkingAnimation : robotIdleAnimation;

  // Get CSS class based on state
  const getStateClass = () => {
    switch (robotState) {
      case ROBOT_STATES.MOVING_TO_QUEUE:
      case ROBOT_STATES.MOVING_TO_ENTRY:
      case ROBOT_STATES.DELIVERING_TO_CENTER:
      case ROBOT_STATES.MOVING_TO_CENTER:
      case ROBOT_STATES.RETURNING_TO_ENTRY:
        return "robot-moving";
      case ROBOT_STATES.PICKING_PROCESS:
      case ROBOT_STATES.PICKING_VM:
      case ROBOT_STATES.PICKING_COMPLETED_VM:
      case ROBOT_STATES.PLACING_VM:
        return "robot-picking";
      case ROBOT_STATES.CELEBRATING:
      case ROBOT_STATES.REACTING_SUCCESS:
        return "robot-celebrating";
      case ROBOT_STATES.CHECKING_OUTCOME:
        return "robot-checking";
      case ROBOT_STATES.REACTING_ERROR:
        return "robot-error";
      case ROBOT_STATES.REACTING_EXCEPTION:
        return "robot-exception";
      default:
        return "robot-idle";
    }
  };

  // Get outcome class for visual styling
  const getOutcomeClass = () => {
    if (!currentOutcome) return "";
    return `outcome-${currentOutcome}`;
  };

  // Calculate position style based on mode (percent vs pixel)
  const positionStyle = usePixelPosition
    ? {
        "--robot-x": `${robotPosition.x}px`,
        "--robot-y": `${robotPosition.y}px`,
      }
    : {
        "--robot-x": `${robotPosition.x}%`,
        "--robot-y": `${robotPosition.y}%`,
      };

  return (
    <div
      className={`robot-container ${getStateClass()} ${getOutcomeClass()} ${isFlipped ? "robot-flipped" : ""}`}
      style={positionStyle}
    >
      <div className="robot-lottie-wrapper">
        <Lottie
          animationData={animationData}
          loop={true}
          className="robot-lottie"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Carried items badges */}
      <div className="robot-carried-items">
        {carryingItems.process && (
          <div className="robot-carrying process-badge" title={carryingItems.process}>
            <i className="bi bi-robot"></i>
          </div>
        )}
        {carryingItems.vm && (
          <div className={`robot-carrying vm-badge ${currentOutcome ? `vm-${currentOutcome}` : ''}`} title={carryingItems.vm}>
            <i className="bi bi-display"></i>
          </div>
        )}
      </div>

      {/* Movement trail effect */}
      {(robotState === ROBOT_STATES.MOVING_TO_QUEUE ||
        robotState === ROBOT_STATES.MOVING_TO_ENTRY ||
        robotState === ROBOT_STATES.DELIVERING_TO_CENTER ||
        robotState === ROBOT_STATES.MOVING_TO_CENTER ||
        robotState === ROBOT_STATES.RETURNING_TO_ENTRY) && (
        <div className={`robot-trail ${isFlipped ? "trail-left" : "trail-right"}`}></div>
      )}
    </div>
  );
};

export default RobotAnimator;
