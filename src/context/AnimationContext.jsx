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

  // Refs for element positions
  const botRefs = useRef({});
  const vmRefs = useRef({});
  const vmPositionsCache = useRef({}); // Cache positions before VMs disappear
  const activeCenterRef = useRef(null);

  // Animation in progress flag
  const isAnimating = useRef(false);

  // Register a bot row element
  const registerBotRef = useCallback((processName, element) => {
    if (element) {
      botRefs.current[processName] = element;
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

      const botPos = getElementPosition(botElement);
      const centerPos = getElementPosition(centerElement);

      // Always use right side position for VM animation
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

  // Add animations to queue
  const queueAnimations = useCallback((newActiveVms) => {
    if (!newActiveVms || newActiveVms.length === 0) return;

    console.log("queueAnimations called with:", newActiveVms);
    console.log("Available VM refs:", Object.keys(vmRefs.current));
    console.log("Already cached positions:", Object.keys(vmPositionsCache.current));

    // Cache current VM positions before they disappear from Entry
    newActiveVms.forEach(vm => {
      const machineName = vm.machineName;
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

  // Queue completion animation for a VM
  const queueCompletionAnimation = useCallback((machineName, outcome) => {
    console.log(`Queueing completion animation for ${machineName} with outcome: ${outcome}`);

    setCompletingVms(prev => {
      const newMap = new Map(prev);
      newMap.set(machineName, outcome);
      return newMap;
    });

    // Auto-clear after animation completes (2.5s blink + 0.5s fade = 3s total)
    setTimeout(() => {
      setCompletingVms(prev => {
        const newMap = new Map(prev);
        newMap.delete(machineName);
        return newMap;
      });
    }, 3000); // 3 second animation (2.5s blink + 0.5s fade)
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
    queueAnimations,
    isVmVisible,
    getAnimatingVms,
    completedAnimations,
    clearCompletedAnimation,
    pendingAnimations,
    queueCompletionAnimation,
    isVmCompleting,
    getVmCompletionOutcome,
    completingVms
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};
