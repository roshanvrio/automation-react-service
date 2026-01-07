import { useEffect, useRef, useState, useCallback } from "react";
import { useAnimation } from "../../context/AnimationContext";
import "./Entry.css";

const Entry = ({ idleVmUpdate }) => {
  const { registerVmRef, highlightedVm, ghostVm } = useAnimation();
  const rowRefs = useRef({});

  // Displayed VMs - what's actually rendered on screen
  const [displayedVMs, setDisplayedVMs] = useState([]);
  // Track VM being removed (for blink animation)
  const [removingVm, setRemovingVm] = useState(null);

  // Track displayed VM names in a ref (to avoid stale closures)
  const displayedNamesRef = useRef(new Set());
  // Removal queue - VMs waiting to be removed
  const removalQueue = useRef([]);
  // Flag to track if we're processing removals
  const isProcessingRemoval = useRef(false);
  // Track if this is first data load
  const isFirstLoad = useRef(true);
  // Delay for blink animation before removal (ms)
  const REMOVAL_BLINK_DURATION = 1500;
  // Delay between removals (ms)
  const REMOVAL_DELAY = 500;

  // Get VM name from various data formats
  const getVmName = useCallback((vm) => {
    if (typeof vm === 'string') return vm;
    return vm.machineName || vm.name || vm.id || '';
  }, []);

  // Process the removal queue one by one
  const processRemovalQueue = useCallback(() => {
    if (isProcessingRemoval.current || removalQueue.current.length === 0) {
      return;
    }

    isProcessingRemoval.current = true;

    // Get the next VM to remove
    const vmToRemove = removalQueue.current.shift();
    const vmName = getVmName(vmToRemove);

    //console.log("Entry: Processing removal - VM:", vmName, "Remaining in queue:", removalQueue.current.length);

    // Start blink animation
    setRemovingVm(vmName);

    // After blink animation, remove from displayed
    setTimeout(() => {
      setDisplayedVMs(prev => prev.filter(vm => getVmName(vm) !== vmName));
      displayedNamesRef.current.delete(vmName);
      setRemovingVm(null);

      isProcessingRemoval.current = false;

      // Process next removal after delay
      if (removalQueue.current.length > 0) {
        setTimeout(() => {
          processRemovalQueue();
        }, REMOVAL_DELAY);
      }
    }, REMOVAL_BLINK_DURATION);
  }, [getVmName]);

  // Detect changes and queue additions/removals
  useEffect(() => {
    if (!Array.isArray(idleVmUpdate)) return;

    //console.log("Entry: idleVmUpdate received:", idleVmUpdate.map(vm => getVmName(vm)));
    //console.log("Entry: Current displayedNamesRef:", [...displayedNamesRef.current]);

    // First load - display all immediately
    if (isFirstLoad.current) {
      //console.log("Entry: First load - displaying all VMs immediately");
      isFirstLoad.current = false;
      const names = new Set();
      idleVmUpdate.forEach(vm => {
        const name = getVmName(vm);
        names.add(name);
      });
      displayedNamesRef.current = names;
      setDisplayedVMs([...idleVmUpdate]);
      return;
    }

    const currentNames = new Set(idleVmUpdate.map(vm => getVmName(vm)));

    // Find new VMs to add (in current update but not in displayedNamesRef)
    const newVMs = idleVmUpdate.filter(vm => {
      const name = getVmName(vm);
      return !displayedNamesRef.current.has(name);
    });

    if (newVMs.length > 0) {
      //console.log("Entry: New VMs detected:", newVMs.map(vm => getVmName(vm)));
      newVMs.forEach(vm => {
        const name = getVmName(vm);
        displayedNamesRef.current.add(name);
      });
      // Use the API order directly instead of appending
      setDisplayedVMs([...idleVmUpdate]);
    }

    // Find VMs to remove (in displayedNamesRef but not in current update)
    const vmsToRemove = [];
    displayedNamesRef.current.forEach(name => {
      if (!currentNames.has(name)) {
        // Check if not already in removal queue
        const alreadyQueued = removalQueue.current.some(qVm => getVmName(qVm) === name);
        if (!alreadyQueued) {
          vmsToRemove.push({ name });
        }
      }
    });

    if (vmsToRemove.length > 0) {
      //console.log("Entry: VMs to remove:", vmsToRemove.map(vm => getVmName(vm)));
      removalQueue.current.push(...vmsToRemove);

      // Start processing if not already
      if (!isProcessingRemoval.current) {
        processRemovalQueue();
      }
    }
  }, [idleVmUpdate, getVmName, processRemovalQueue]);

  // Cache all VM positions whenever the list changes
  useEffect(() => {
    if (!Array.isArray(displayedVMs)) return;

    displayedVMs.forEach(vm => {
      const vmName = getVmName(vm);
      const element = rowRefs.current[vmName];
      if (element) {
        registerVmRef(vmName, element);
      }
    });
  }, [displayedVMs, registerVmRef, getVmName]);

  // Ref callback to store element reference
  const setRowRef = (vmName) => (element) => {
    if (element) {
      rowRefs.current[vmName] = element;
      registerVmRef(vmName, element);
    }
  };

  // Build the list of VMs to display (including ghost VM if animating)
  const buildVmList = () => {
    const vmList = [...displayedVMs];

    // Add ghost VM if it's not already in the list
    if (ghostVm && ghostVm.name) {
      const ghostExists = vmList.some(vm => getVmName(vm) === ghostVm.name);
      if (!ghostExists) {
        vmList.push({ name: ghostVm.name, isGhost: true });
      }
    }

    return vmList;
  };

  // Group VMs into pairs for 2-column layout
  const groupIntoPairs = (list) => {
    const pairs = [];
    for (let i = 0; i < list.length; i += 2) {
      pairs.push(list.slice(i, i + 2));
    }
    return pairs;
  };

  const vmList = buildVmList();
  const vmPairs = groupIntoPairs(vmList);

  // Render a single VM row
  const renderVmRow = (vm, index) => {
    const vmName = getVmName(vm);
    const isHighlighted = highlightedVm &&
      (highlightedVm === vmName ||
       highlightedVm.toLowerCase() === vmName.toLowerCase());
    const isGhost = vm.isGhost === true;
    const isRemoving = removingVm === vmName;

    return (
      <div
        className={`entry-row ${isHighlighted ? 'vm-highlighted' : ''} ${isGhost ? 'vm-ghost' : ''} ${isRemoving ? 'vm-removing' : ''}`}
        key={vmName || index}
        ref={setRowRef(vmName)}
      >
        <i className="bi bi-display"></i>
        <span>{vmName}</span>
      </div>
    );
  };

  return (
    <div className="dashboard-card entry-card">

      <div className="entry-title">ENTRY</div>

      <div className="entry-list">
        {vmPairs.map((pair, pairIndex) => (
          <div className="entry-row-pair" key={pairIndex}>
            {pair.map((vm, vmIndex) => renderVmRow(vm, pairIndex * 2 + vmIndex))}
          </div>
        ))}
      </div>

    </div>
  );
};

export default Entry;
