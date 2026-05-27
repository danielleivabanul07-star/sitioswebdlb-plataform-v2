export function DraggableElement({
  id,
  project,
  setProject,
  children,
  style = {},
  disabled = false
}) {
  const design = project?.design || {};
  const positions = design.positions || {};
  const hiddenElements = design.hiddenElements || {};
  const lockedElements = design.lockedElements || {};

  const current = positions[id] || { x: 0, y: 0 };
  const isHidden = hiddenElements[id];
  const isLocked = lockedElements[id];

  if (isHidden) {
    return null;
  }

  function updateDesignData(patch) {
    if (!setProject) return;

    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      design: {
        ...prev.design,
        ...patch
      }
    }));
  }

  function savePosition(x, y) {
    if (!setProject || disabled || isLocked) return;

    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      design: {
        ...prev.design,
        positions: {
          ...(prev.design?.positions || {}),
          [id]: { x, y }
        }
      }
    }));
  }

  function hideElement(e) {
    e.preventDefault();
    e.stopPropagation();

    updateDesignData({
      hiddenElements: {
        ...hiddenElements,
        [id]: true
      }
    });
  }

  function resetPosition(e) {
    e.preventDefault();
    e.stopPropagation();

    const nextPositions = { ...positions };
    delete nextPositions[id];

    updateDesignData({
      positions: nextPositions
    });
  }

  function toggleLock(e) {
    e.preventDefault();
    e.stopPropagation();

    updateDesignData({
      lockedElements: {
        ...lockedElements,
        [id]: !isLocked
      }
    });
  }

  function startDrag(e) {
    if (!setProject || disabled || isLocked) return;

    e.preventDefault();
    e.stopPropagation();

    const isTouch = e.type === "touchstart";

    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startY = isTouch ? e.touches[0].clientY : e.clientY;

    const startPosition = {
      x: current.x || 0,
      y: current.y || 0
    };

    let moved = false;

    function onMove(moveEvent) {
      const moveX = moveEvent.touches
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;

      const moveY = moveEvent.touches
        ? moveEvent.touches[0].clientY
        : moveEvent.clientY;

      const deltaX = moveX - startX;
      const deltaY = moveY - startY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        moved = true;
      }

      if (moved) {
        moveEvent.preventDefault();
        moveEvent.stopPropagation();

        savePosition(startPosition.x + deltaX, startPosition.y + deltaY);
      }
    }

    function onEnd(endEvent) {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("mouseup", onEnd, true);
      window.removeEventListener("touchmove", onMove, true);
      window.removeEventListener("touchend", onEnd, true);

      if (moved) {
        const blockClick = (clickEvent) => {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          clickEvent.stopImmediatePropagation();
          window.removeEventListener("click", blockClick, true);
        };

        window.addEventListener("click", blockClick, true);
      }

      if (endEvent) {
        endEvent.preventDefault?.();
        endEvent.stopPropagation?.();
      }
    }

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onEnd, true);
    window.addEventListener("touchmove", onMove, {
      passive: false,
      capture: true
    });
    window.addEventListener("touchend", onEnd, true);
  }

  return (
    <div
      onMouseDownCapture={startDrag}
      onTouchStartCapture={startDrag}
      draggable={false}
      style={{
        transform: `translate(${current.x || 0}px, ${current.y || 0}px)`,
        cursor:
          setProject && !disabled && !isLocked
            ? "move"
            : "default",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
        display: "inline-block",
        position: "relative",
        zIndex: 999,
        outline: isLocked ? "1px dashed #facc15" : "none",
        ...style
      }}
    >
      {setProject && !disabled && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "-28px",
            right: "0",
            display: "flex",
            gap: "4px",
            background: "rgba(0,0,0,.75)",
            padding: "3px",
            borderRadius: "8px",
            zIndex: 1000
          }}
        >
          <button
            type="button"
            title="Ocultar elemento"
            onClick={hideElement}
            style={controlButtonStyle}
          >
            👁
          </button>

          <button
            type="button"
            title="Resetear posición"
            onClick={resetPosition}
            style={controlButtonStyle}
          >
            ↺
          </button>

          <button
            type="button"
            title="Bloquear / desbloquear"
            onClick={toggleLock}
            style={{
              ...controlButtonStyle,
              background: isLocked ? "#facc15" : "#111",
              color: isLocked ? "#000" : "#fff"
            }}
          >
            🔒
          </button>
        </div>
      )}

      {children}
    </div>
  );
}

const controlButtonStyle = {
  border: "1px solid rgba(255,255,255,.25)",
  background: "#111",
  color: "#fff",
  borderRadius: "6px",
  fontSize: "12px",
  cursor: "pointer",
  padding: "2px 5px",
  lineHeight: "1.2"
};