import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const AnimationContext = createContext();

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation must be used within AnimationProvider");
  }
  return context;
};

export const AnimationProvider = ({ children }) => {
  // Queue of pending animations (VMs waiting to animate)
  const [pendingAnimations, setPendingAnimations] = useState([]);
  // Currently playing animation
  const [currentAnimation, setCurrentAnimation] = useState(null);
  // Animation phase: "highlight" -> "fly" -> null
  const [animationPhase, setAnimationPhase] = useState(null);
  // VMs that have completed animation and should be visible
  const [completedAnimations, setCompletedAnimations] = useState([]);
  // Highlighted items in each component
  const [highlightedBot, setHighlightedBot] = useState(null);
  const [highlightedVm, setHighlightedVm] = useState(null);
  // Ghost VM to show in Entry during animation (since it's removed from idle list)
  const [ghostVm, setGhostVm] = useState(null);
  // Ghost Bot to show in BotsInQueue during animation (in case it's removed from queue)
  const [ghostBot, setGhostBot] = useState(null);
  // Track VMs completing transactions with outcome
  const [completingVms, setCompletingVms] = useState(new Map()); // Map<machineName, outcome>
  // Exit animation state - VM flying back to Entry
  const [exitAnimation, setExitAnimation] = useState(null);
  // Ghost VM to show in Entry during exit animation (landing target)
  const [landingGhostVm, setLandingGhostVm] = useState(null);
  // Completion animation state - when VM starts blinking (for robot to pick up)
  const [completionAnimation, setCompletionAnimation] = useState(null);

  // Refs for element positions
  const botRefs = useRef({});
  const vmRefs = useRef({});
  const vmPositionsCache = useRef({}); // Cache positions before VMs disappear
  const botPositionsCache = useRef({}); // Cache bot positions before they disappear from queue
  const activeCenterRef = useRef(null);
  // Cache for active VM hexagon positions
  const activeVmHexPositionsRef = useRef({});

  // Animation in progress flag
  const isAnimating = useRef(false);

  // Register a bot row element and cache its position
  const registerBotRef = useCallback((processName, element) => {
    if (element) {
      botRefs.current[processName] = element;
      // Cache the position immediately
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        botPositionsCache.current[processName] = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height
        };
      }
    }
  }, []);

  // Register a VM row element and cache its position
  const registerVmRef = useCallback((vmName, element) => {
    if (element) {
      vmRefs.current[vmName] = element;
      // Cache the position
      const rect = element.getBoundingClientRect();
      vmPositionsCache.current[vmName] = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      };
    }
  }, []);

  // Register the active VMs center area
  const registerActiveCenter = useCallback((element) => {
    if (element) {
      activeCenterRef.current = element;
    }
  }, []);

  // Register an active VM hexagon position (for exit animation targeting)
  const registerActiveVmHex = useCallback((machineName, element) => {
    if (element && machineName) {
      const rect = element.getBoundingClientRect();
      // Only cache if element has valid dimensions (not 0,0)
      if (rect.width > 0 && rect.height > 0 && (rect.left > 0 || rect.top > 0)) {
        activeVmHexPositionsRef.current[machineName] = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height
        };
      }
    }
  }, []);

  // Get active VM hex position
  const getActiveVmHexPosition = useCallback((machineName) => {
    return activeVmHexPositionsRef.current[machineName] || null;
  }, []);

  // Get element position relative to viewport
  const getElementPosition = (element) => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height
    };
  };

  // Get fallback position for VM from right side of screen
  const getFallbackVmPosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    return {
      x: viewportWidth - 100, // Right side of screen
      y: viewportHeight / 2,   // Middle height
      width: 100,
      height: 40
    };
  };

  // Get Entry panel position for exit animation target
  const getEntryTargetPosition = (machineName) => {
    // Try to get cached position from vmRefs
    const { element } = findVmElement(machineName);
    if (element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      };
    }
    // Use cached position if available
    if (vmPositionsCache.current[machineName]) {
      return vmPositionsCache.current[machineName];
    }
    // Fallback to right side of screen
    return getFallbackVmPosition();
  };

  // Process the next animation in queue
  const processNextAnimation = useCallback(() => {
    if (isAnimating.current) return;

    setPendingAnimations(prev => {
      if (prev.length === 0) return prev;

      isAnimating.current = true;
      const [nextAnimation, ...rest] = prev;

      // Get positions
      const botElement = botRefs.current[nextAnimation.processName];
      const centerElement = activeCenterRef.current;

      // Try to get bot position from element first, then fall back to cache, then fallback position
      let botPos = getElementPosition(botElement);
      if (!botPos || botPos.x === 0 || botPos.y === 0) {
        // Element is gone or has invalid position, use cached position
        botPos = botPositionsCache.current[nextAnimation.processName];
        console.log(`Using cached bot position for ${nextAnimation.processName}:`, botPos);
      }
      // Final fallback if still no position
      if (!botPos) {
        botPos = getFallbackBotPosition();
        console.log(`No cached position, using fallback for ${nextAnimation.processName}:`, botPos);
      }
      const centerPos = getElementPosition(centerElement);

      // Always use right side position for VM (Entry component is on the right)
      const vmPos = getFallbackVmPosition();
      const vmPosSource = "right-side";

      console.log("Animation positions:", {
        bot: botPos,
        vm: vmPos,
        vmPosSource,
        center: centerPos,
        machineName: nextAnimation.machineName,
        viewportWidth: window.innerWidth
      });

      // Set ghost VM to show in Entry during animation
      setGhostVm({
        name: nextAnimation.machineName,
        position: vmPos
      });

      // Set ghost Bot to show in BotsInQueue during animation
      setGhostBot({
        processName: nextAnimation.processName,
        triggerIndication: nextAnimation.triggerIndication
      });

      // PHASE 1: Highlight first (no flying yet)
      setAnimationPhase("highlight");
      setHighlightedBot(nextAnimation.processName);
      setHighlightedVm(nextAnimation.machineName);

      // PHASE 2: After 600ms, start flying animation
      setTimeout(() => {
        setAnimationPhase("fly");
        // Set current animation with positions for flying
        setCurrentAnimation({
          ...nextAnimation,
          botPosition: botPos,
          vmPosition: vmPos,
          centerPosition: centerPos,
          id: Date.now()
        });
      }, 600);

      // PHASE 3: After flying completes, show the VM and process next
      setTimeout(() => {
        // Add to completed animations (VM can now appear in ActiveVMs)
        setCompletedAnimations(prevCompleted => [...prevCompleted, nextAnimation.machineName]);

        // Clear current animation state
        setCurrentAnimation(null);
        setAnimationPhase(null);
        setHighlightedBot(null);
        setHighlightedVm(null);
        setGhostVm(null);
        setGhostBot(null);
        isAnimating.current = false;

        // Process next in queue after a short delay
        setTimeout(() => {
          processNextAnimation();
        }, 300);
      }, 2800); // 600ms highlight + 2200ms fly

      return rest;
    });
  }, []);

  // Start processing when pending animations change
  useEffect(() => {
    if (pendingAnimations.length > 0 && !isAnimating.current) {
      processNextAnimation();
    }
  }, [pendingAnimations, processNextAnimation]);

  // Find VM element by trying multiple name variations
  const findVmElement = (machineName) => {
    // Try exact match first
    if (vmRefs.current[machineName]) {
      return { element: vmRefs.current[machineName], key: machineName };
    }
    // Try case-insensitive match
    const keys = Object.keys(vmRefs.current);
    for (const key of keys) {
      if (key.toLowerCase() === machineName.toLowerCase()) {
        return { element: vmRefs.current[key], key };
      }
    }
    // Try partial match (in case of extra whitespace or prefix/suffix differences)
    for (const key of keys) {
      if (key.includes(machineName) || machineName.includes(key)) {
        return { element: vmRefs.current[key], key };
      }
    }
    return { element: null, key: null };
  };

  // Get fallback position for bot from left side of screen
  const getFallbackBotPosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    return {
      x: viewportWidth * 0.15, // Left side of screen (BotsInQueue area)
      y: viewportHeight * 0.45, // Middle height
      width: 200,
      height: 40
    };
  };

  // Add animations to queue
  const queueAnimations = useCallback((newActiveVms) => {
    if (!newActiveVms || newActiveVms.length === 0) return;

    console.log("queueAnimations called with:", newActiveVms);
    console.log("Available VM refs:", Object.keys(vmRefs.current));
    console.log("Available Bot refs:", Object.keys(botRefs.current));
    console.log("Already cached VM positions:", Object.keys(vmPositionsCache.current));
    console.log("Already cached Bot positions:", Object.keys(botPositionsCache.current));

    // Cache current VM positions before they disappear from Entry
    newActiveVms.forEach(vm => {
      const machineName = vm.machineName;
      const processName = vm.processName;

      // Cache bot position FIRST (before it might disappear from queue)
      const botElement = botRefs.current[processName];
      if (botElement) {
        const botRect = botElement.getBoundingClientRect();
        if (botRect.width > 0 && botRect.height > 0) {
          botPositionsCache.current[processName] = {
            x: botRect.left + botRect.width / 2,
            y: botRect.top + botRect.height / 2,
            width: botRect.width,
            height: botRect.height
          };
          console.log(`Cached bot position for ${processName}:`, botPositionsCache.current[processName]);
        }
      } else if (!botPositionsCache.current[processName]) {
        // No element and no cache - use fallback
        botPositionsCache.current[processName] = getFallbackBotPosition();
        console.log(`No bot element for ${processName}, using fallback:`, botPositionsCache.current[processName]);
      }

      // Cache VM position
      const { element, key } = findVmElement(machineName);

      console.log(`Looking for VM element: "${machineName}", found:`, !!element, key ? `(matched key: ${key})` : '');

      if (element) {
        const rect = element.getBoundingClientRect();
        const position = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height
        };
        // Cache under the actual machineName (not the matched key)
        vmPositionsCache.current[machineName] = position;
        console.log(`Cached position for ${machineName}:`, position);
      } else {
        // Pre-cache fallback position for this VM
        const fallbackPos = getFallbackVmPosition();
        vmPositionsCache.current[machineName] = fallbackPos;
        console.log(`No element found for ${machineName}, using fallback position:`, fallbackPos);
      }
    });

    setPendingAnimations(prev => {
      const newAnimations = newActiveVms.map(vm => ({
        processName: vm.processName,
        machineName: vm.machineName,
        triggerIndication: vm.triggerIndication,
        rpaTool: vm.rpaTool,
        lastRunTime: vm.lastRunTime
      }));
      return [...prev, ...newAnimations];
    });
  }, []);

  // Add VMs to the visual exit queue (for ExitQueue component display)
  // This does NOT trigger robot animation - use queueCompletionAnimation for that
  const addToExitQueue = useCallback((vmsWithOutcomes) => {
    // vmsWithOutcomes is an array of { machineName, outcome }
    console.log(`Adding ${vmsWithOutcomes.length} VMs to exit queue:`, vmsWithOutcomes.map(v => v.machineName));

    setCompletingVms(prev => {
      const newMap = new Map(prev);
      vmsWithOutcomes.forEach(({ machineName, outcome }) => {
        newMap.set(machineName, outcome);
      });
      return newMap;
    });
  }, []);

  // Remove a VM from the visual exit queue
  const removeFromExitQueue = useCallback((machineName) => {
    setCompletingVms(prev => {
      const newMap = new Map(prev);
      newMap.delete(machineName);
      return newMap;
    });
  }, []);

  // Queue completion animation for a VM (triggers robot animation for ONE VM)
  // Optional hexPosition parameter allows passing fresh position from component
  const queueCompletionAnimation = useCallback((machineName, outcome, hexPosition = null) => {
    console.log(`Queueing robot animation for ${machineName} with outcome: ${outcome}`);

    // Use passed position, or fallback to cached position
    let vmHexPos = hexPosition || activeVmHexPositionsRef.current[machineName];
    const entryPos = getFallbackVmPosition();

    // Validate the position - if it's invalid (0,0 or too small), use center of ActiveVMs area
    const isValidPosition = vmHexPos && vmHexPos.x > 50 && vmHexPos.y > 50;
    if (!isValidPosition) {
      // Fallback to center of ActiveVMs area (roughly center of screen)
      const centerElement = activeCenterRef.current;
      if (centerElement) {
        const rect = centerElement.getBoundingClientRect();
        vmHexPos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height
        };
      } else {
        // Ultimate fallback - center of viewport
        vmHexPos = {
          x: window.innerWidth * 0.5,
          y: window.innerHeight * 0.5,
          width: 100,
          height: 100
        };
      }
      console.log(`⚠️ Invalid hex position for ${machineName}, using fallback:`, vmHexPos);
    }

    console.log(`VM hex position for ${machineName}:`, vmHexPos, hexPosition ? '(fresh)' : '(cached)');

    // Set the completion animation state (robot will listen to this)
    setCompletionAnimation({
      machineName,
      outcome,
      vmPosition: vmHexPos,
      entryPosition: entryPos,
      id: Date.now()
    });

    // Also ensure it's in completingVms (in case addToExitQueue wasn't called)
    setCompletingVms(prev => {
      const newMap = new Map(prev);
      newMap.set(machineName, outcome);
      return newMap;
    });
  }, []);

  // Track VMs currently in exit animation to prevent duplicates
  const exitAnimatingVmsRef = useRef(new Set());

  // Queue exit animation - VM flies back to Entry list
  const queueExitAnimation = useCallback((vmData, outcome) => {
    const { machineName } = vmData;

    // Prevent duplicate exit animations for the same VM
    if (exitAnimatingVmsRef.current.has(machineName)) {
      console.log(`⚠️ Exit animation already in progress for ${machineName}, skipping duplicate`);
      return;
    }

    console.log(`Queueing exit animation for ${machineName} with outcome: ${outcome}`);
    exitAnimatingVmsRef.current.add(machineName);

    // Get center position (start point - from ActiveVMs)
    const centerElement = activeCenterRef.current;
    const centerPos = getElementPosition(centerElement);

    // Always use right side position for exit animation (where Entry is located)
    // This matches the entry animation behavior
    const entryTargetPos = getFallbackVmPosition();

    console.log("Exit animation positions:", {
      center: centerPos,
      entryTarget: entryTargetPos,
      machineName
    });

    // Set landing ghost in Entry to show where VM will land
    setLandingGhostVm({
      name: machineName,
      position: entryTargetPos
    });

    // Start exit animation
    setExitAnimation({
      machineName,
      outcome,
      startPosition: centerPos,
      endPosition: entryTargetPos,
      id: Date.now()
    });

    // Clear exit animation after it completes (1.8s fly animation)
    setTimeout(() => {
      setExitAnimation(null);
      setLandingGhostVm(null);
      exitAnimatingVmsRef.current.delete(machineName);
      // Clear the completing state after exit animation
      setCompletingVms(prev => {
        const newMap = new Map(prev);
        newMap.delete(machineName);
        return newMap;
      });
    }, 1800);
  }, []);

  // Check if VM is currently completing (for applying blink class)
  const isVmCompleting = useCallback((machineName) => {
    return completingVms.has(machineName);
  }, [completingVms]);

  // Get completion outcome for a VM
  const getVmCompletionOutcome = useCallback((machineName) => {
    return completingVms.get(machineName) || 'unknown';
  }, [completingVms]);

  // Check if a VM should be visible in ActiveVMs
  const isVmVisible = useCallback((machineName) => {
    // VM is visible if it has completed animation
    return completedAnimations.includes(machineName);
  }, [completedAnimations]);

  // Get VMs that are currently animating (not yet visible)
  const getAnimatingVms = useCallback(() => {
    const animating = [];
    if (currentAnimation) {
      animating.push(currentAnimation.machineName);
    }
    pendingAnimations.forEach(a => animating.push(a.machineName));
    return animating;
  }, [currentAnimation, pendingAnimations]);

  // Clear completed animations for a VM that's no longer active
  const clearCompletedAnimation = useCallback((machineName) => {
    setCompletedAnimations(prev => prev.filter(name => name !== machineName));
  }, []);

  const value = {
    currentAnimation,
    animationPhase,
    highlightedBot,
    highlightedVm,
    ghostVm,
    ghostBot,
    registerBotRef,
    registerVmRef,
    registerActiveCenter,
    registerActiveVmHex,
    getActiveVmHexPosition,
    queueAnimations,
    isVmVisible,
    getAnimatingVms,
    completedAnimations,
    clearCompletedAnimation,
    pendingAnimations,
    addToExitQueue,
    removeFromExitQueue,
    queueCompletionAnimation,
    queueExitAnimation,
    isVmCompleting,
    getVmCompletionOutcome,
    completingVms,
    exitAnimation,
    completionAnimation,
    landingGhostVm
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};
