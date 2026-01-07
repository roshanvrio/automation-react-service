import { useAnimation } from "../../context/AnimationContext";
import "./AnimationOverlay.css";

const AnimationOverlay = () => {
  const { currentAnimation, animationPhase, exitAnimation } = useAnimation();

  // Show entry animation during "fly" phase OR exit animation
  const showEntryAnimation = currentAnimation && animationPhase === "fly";
  const showExitAnimation = exitAnimation !== null;

  if (!showEntryAnimation && !showExitAnimation) return null;

  const { botPosition, vmPosition, centerPosition, processName, machineName, triggerIndication } = currentAnimation || {};

  // Calculate if we have valid positions
  const hasBotAnimation = botPosition && centerPosition;
  const hasVmAnimation = vmPosition && centerPosition;

  console.log("AnimationOverlay rendering:", { hasBotAnimation, hasVmAnimation, vmPosition, showExitAnimation });

  return (
    <div className="animation-overlay">
      {/* Bot icon flying from left (entry animation only) */}
      {showEntryAnimation && hasBotAnimation && (
        <div
          className="flying-icon bot-icon"
          style={{
            '--start-x': `${botPosition.x}px`,
            '--start-y': `${botPosition.y}px`,
            '--end-x': `${centerPosition.x - 50}px`,
            '--end-y': `${centerPosition.y}px`
          }}
        >
          <div className="flying-icon-inner">
            <i className="bi bi-robot"></i>
            <span className="flying-label">{processName}</span>
          </div>
          <div className="flying-trail bot-trail"></div>
        </div>
      )}

      {/* VM icon flying from right (entry animation only) */}
      {showEntryAnimation && hasVmAnimation && (
        <div
          className="flying-icon vm-icon"
          style={{
            '--start-x': `${vmPosition.x}px`,
            '--start-y': `${vmPosition.y}px`,
            '--end-x': `${centerPosition.x + 50}px`,
            '--end-y': `${centerPosition.y}px`
          }}
        >
          <div className="flying-icon-inner">
            <i className="bi bi-display"></i>
            <span className="flying-label">{machineName}</span>
          </div>
          <div className="flying-trail vm-trail"></div>
        </div>
      )}

      {/* Center merge effect */}
      {showEntryAnimation && (hasBotAnimation || hasVmAnimation) && centerPosition && (
        <div
          className="merge-effect"
          style={{
            left: `${centerPosition.x}px`,
            top: `${centerPosition.y}px`
          }}
        >
          <div className="merge-ring ring-1"></div>
          <div className="merge-ring ring-2"></div>
          <div className="merge-ring ring-3"></div>
          <div className="merge-icon">
            <span>{triggerIndication === "Email" ? "✉" : "🕐"}</span>
          </div>
        </div>
      )}

      {/* Exit animation - VM flying back to Entry */}
      {showExitAnimation && exitAnimation.startPosition && exitAnimation.endPosition && (
        <div
          className={`flying-icon vm-icon-exit exit-${exitAnimation.outcome}`}
          key={exitAnimation.id}
          style={{
            '--start-x': `${exitAnimation.startPosition.x}px`,
            '--start-y': `${exitAnimation.startPosition.y}px`,
            '--end-x': `${exitAnimation.endPosition.x}px`,
            '--end-y': `${exitAnimation.endPosition.y}px`
          }}
        >
          <div className="flying-icon-inner">
            <i className="bi bi-display"></i>
            <span className="flying-label">{exitAnimation.machineName}</span>
          </div>
          <div className="flying-trail vm-trail-exit"></div>
        </div>
      )}

      {/* Landing effect at Entry */}
      {showExitAnimation && exitAnimation.endPosition && (
        <div
          className="landing-effect"
          style={{
            left: `${exitAnimation.endPosition.x}px`,
            top: `${exitAnimation.endPosition.y}px`
          }}
        >
          <div className={`landing-ring landing-ring-1 landing-${exitAnimation.outcome}`}></div>
          <div className={`landing-ring landing-ring-2 landing-${exitAnimation.outcome}`}></div>
        </div>
      )}
    </div>
  );
};

export default AnimationOverlay;
