import React, { useEffect, useState, useRef } from "react";
import { fetchBots } from "../api/api";
import botIcon from "../images/robot-happy.png";

export default function Sidebar() {
  const [bots, setBots] = useState([]);
  const [hoveredBot, setHoveredBot] = useState(null);
  const scrollContainerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastMouseYRef = useRef(null);
  const isAutoScrollingRef = useRef(false);

  // Fetch bots from API (or fallback)
  useEffect(() => {
    fetchBots().then(setBots).catch(() => {});
  }, []);

  const baseBots =
    bots.length > 0
      ? bots
      : [
          { id: 1, name: "VMora500.bot" },
          { id: 2, name: "VMora500.bot" },
          { id: 3, name: "Loopster9.bot" },
          { id: 4, name: "Loopster9.bot" },
          { id: 5, name: "BotForge3.bot" },
          { id: 6, name: "BotForge3.bot" },
          { id: 7, name: "Strings06.bot" },
          { id: 8, name: "Ghost404.bot" },
          { id: 9, name: "PixelPilot88.bot" },
        ];

  // ✅ Smooth scroll handling for both mouse wheel and touchpad
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout = null;

    const handleWheel = (e) => {
      // Don't prevent default for touchpad - let it scroll naturally
      // Only handle when not in auto-scroll zones
      if (!isAutoScrollingRef.current) {
        e.preventDefault();
        
        // Use CSS smooth scrolling for touchpad
        const scrollAmount = e.deltaY;
        
        // Clear any pending scroll timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        // Apply scroll with smooth behavior
        container.scrollBy({
          top: scrollAmount,
          behavior: 'auto' // Changed to auto for better touchpad performance
        });

        // Add smooth scrolling class temporarily
        container.style.scrollBehavior = 'smooth';
        
        scrollTimeout = setTimeout(() => {
          container.style.scrollBehavior = 'auto';
        }, 150);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // ✅ Auto-scroll based on cursor position (optimized)
  const handleMouseMove = (e) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    lastMouseYRef.current = mouseY;
    const containerHeight = rect.height;

    // Define scroll zones (top 25% and bottom 25%)
    const scrollZoneSize = containerHeight * 0.25;
    const scrollSpeed = 2.5; // Slightly reduced for smoother experience

    // Check if mouse is in scroll zones
    const inTopZone = mouseY < scrollZoneSize;
    const inBottomZone = mouseY > containerHeight - scrollZoneSize;

    // Cancel any existing animation
    if (animationFrameRef.current && !inTopZone && !inBottomZone) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      isAutoScrollingRef.current = false;
    }

    // Auto-scroll function
    const autoScroll = () => {
      const currentMouseY = lastMouseYRef.current;
      if (currentMouseY === null) return;

      if (currentMouseY < scrollZoneSize) {
        // Mouse in top zone - scroll up
        const intensity = 1 - (currentMouseY / scrollZoneSize);
        container.scrollTop -= scrollSpeed * intensity;
        animationFrameRef.current = requestAnimationFrame(autoScroll);
        isAutoScrollingRef.current = true;
      } else if (currentMouseY > containerHeight - scrollZoneSize) {
        // Mouse in bottom zone - scroll down
        const intensity = (currentMouseY - (containerHeight - scrollZoneSize)) / scrollZoneSize;
        container.scrollTop += scrollSpeed * intensity;
        animationFrameRef.current = requestAnimationFrame(autoScroll);
        isAutoScrollingRef.current = true;
      } else {
        isAutoScrollingRef.current = false;
      }
    };

    // Start auto-scrolling if in scroll zones and not already scrolling
    if ((inTopZone || inBottomZone) && !animationFrameRef.current) {
      autoScroll();
    }
  };

  // Stop auto-scroll when mouse leaves
  const handleMouseLeave = () => {
    lastMouseYRef.current = null;
    isAutoScrollingRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ✅ Allow arrow keys to scroll when container is focused
  const handleKeyDown = (e) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const step = 40;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      container.scrollBy({
        top: step,
        behavior: 'smooth'
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      container.scrollBy({
        top: -step,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sidebar">
      {/* --- Combined Bot Trigger and Counters --- */}
      <div className="triggers-combined">
        <div className="trigger-title" style={{ color: "#D7E4E3" }}>BOT TRIGGER</div>
        <div className="trigger-counters">
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "#D7E4E3",
                fontSize: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              Email
            </div>
            <div
              style={{ color: "#00FFDD", fontSize: "1rem", fontWeight: "600" }}
            >
              02
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "#D7E4E3",
                fontSize: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              Schedule
            </div>
            <div
              style={{ color: "#00FFDD", fontSize: "1rem", fontWeight: "600" }}
            >
              03
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "#D7E4E3",
                fontSize: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              File triggers
            </div>
            <div
              style={{ color: "#00FFDD", fontSize: "1rem", fontWeight: "600" }}
            >
              04
            </div>
          </div>
        </div>
      </div>

      {/* --- Bot Stack Scrollable Section --- */}
      <div className="bot-scroll-wrapper">
        <div
          className="bot-stack-container"
          ref={scrollContainerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            scrollBehavior: 'auto',
            WebkitOverflowScrolling: 'touch', // Better touchpad support
          }}
        >
          {baseBots.map((bot, index) => (
            <div
              className="bot-stack-item"
              key={bot.id}
              style={{ "--item-index": index }}
              onMouseEnter={() => setHoveredBot(bot.id)}
              onMouseLeave={() => setHoveredBot(null)}
            >
              <img src={botIcon} alt="Bot" className="bot-stack-img" />
              
              {/* Show bot name on hover */}
              {hoveredBot === bot.id && (
                <div className="bot-hover-name">{bot.name}</div>
              )}
            </div>
          ))}

          {/* Name label for bottom-most bot (always visible) */}
          <div className="bot-stack-name-label">
            {baseBots[baseBots.length - 1]?.name}
          </div>
        </div>
      </div>

      {/* --- Footer --- */}
      <div className="queue-footer">
        <div>BOTS in Queue</div>
        <div className="queue-count">09</div>
      </div>
    </div>
  );
}