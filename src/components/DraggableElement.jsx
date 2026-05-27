export function DraggableElement({
  id,
  project,
  setProject,
  children,
  style = {},
  disabled = false
}) {
  const positions = project?.design?.positions || {};
  const current = positions[id] || { x: 0, y: 0 };

  function savePosition(x, y) {
    if (!setProject || disabled) return;

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

  function startDrag(e) {
    if (!setProject || disabled) return;

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
    window.addEventListener("touchmove", onMove, { passive: false, capture: true });
    window.addEventListener("touchend", onEnd, true);
  }

  return (
    <div
      onMouseDownCapture={startDrag}
      onTouchStartCapture={startDrag}
      draggable={false}
      style={{
        transform: `translate(${current.x || 0}px, ${current.y || 0}px)`,
        cursor: setProject && !disabled ? "move" : "default",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
        display: "inline-block",
        position: "relative",
        zIndex: 999,
        ...style
      }}
    >
      {children}
    </div>
  );
}