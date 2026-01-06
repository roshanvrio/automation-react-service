import { useAnimation } from "../../context/AnimationContext";
import "./AnimationOverlay.css";

const AnimationOverlay = () => {
  const { currentAnimation, animationPhase } = useAnimation();

  // Only show flying animation during "fly" phase
  if (!currentAnimation || animationPhase !== "fly") return null;

  const { botPosition, vmPosition, centerPosition, processName, machineName, triggerIndication } = currentAnimation;

  // Calculate if we have valid positions
  const hasBotAnimation = botPosition && centerPosition;
  const hasVmAnimation = vmPosition && centerPosition;

  console.log("AnimationOverlay rendering:", { hasBotAnimation, hasVmAnimation, vmPosition });

  return (
    <div className="animation-overlay">
      {/* Bot icon flying from left */}
      {hasBotAnimation && (
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

      {/* VM icon flying from right */}
      {hasVmAnimation && (
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
      {(hasBotAnimation || hasVmAnimation) && centerPosition && (
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
    </div>
  );
};

export default AnimationOverlay;
