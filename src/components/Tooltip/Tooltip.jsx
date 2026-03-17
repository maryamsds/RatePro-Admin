// src/components/Tooltip/Tooltip.jsx
import { useId } from "react";

/**
 * Reusable Tooltip component with keyboard + hover accessibility.
 *
 * @param {string}  text       - Tooltip content
 * @param {string}  position   - "top" | "bottom" | "left" | "right"
 * @param {number}  threshold  - Only show tooltip if text.length > threshold (perf optimization)
 * @param {React.ReactNode} children
 */
const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2 tooltip-arrow tooltip-top",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2 tooltip-arrow tooltip-bottom",
  left: "right-full top-1/2 -translate-y-1/2 mr-2 tooltip-arrow tooltip-left",
  right: "left-full top-1/2 -translate-y-1/2 ml-2 tooltip-arrow tooltip-right",
};

const Tooltip = ({ text, position = "top", threshold = 0, children }) => {
  const tooltipId = useId();

  // Performance: skip tooltip if text is short enough
  if (!text || (threshold > 0 && text.length <= threshold)) {
    return children;
  }

  return (
    <div className="relative group inline-flex">
      <div aria-describedby={tooltipId} className="inline-flex">
        {children}
      </div>

      <div
        id={tooltipId}
        role="tooltip"
        className={`
          absolute z-50 opacity-0 pointer-events-none
          group-hover:opacity-100 group-focus-within:opacity-100
          transition-opacity duration-150
          bg-[var(--dark-card)] text-white text-xs rounded-md px-2.5 py-1.5
          max-w-[260px] whitespace-normal leading-relaxed
          shadow-lg
          ${positionClasses[position] || positionClasses.top}
        `}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
