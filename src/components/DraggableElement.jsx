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

    function onMove(moveEvent) {
      const moveX = moveEvent.touches
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;

      const moveY = moveEvent.touches
        ? moveEvent.touches[0].clientY
        : moveEvent.clientY;

      const nextX = startPosition.x + (moveX - startX);
      const nextY = startPosition.y + (moveY - startY);

      savePosition(nextX, nextY);
    }

    function onEnd() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }

  return (
    <div
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      draggable={false}
      style={{
        transform: `translate(${current.x || 0}px, ${current.y || 0}px)`,
        cursor: setProject && !disabled ? "move" : "default",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
        display: "inline-block",
        position: "relative",
        zIndex: 20,
        ...style
      }}
    >
      {children}
    </div>
  );
}