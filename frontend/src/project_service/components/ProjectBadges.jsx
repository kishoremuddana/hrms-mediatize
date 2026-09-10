import React from "react";

/* =========================================================
   PROJECT STATUS
========================================================= */

export function ProjectStatusBadge({ status }) {
  const getStatusConfig = () => {
    switch (status) {
      case "PLANNED":
        return {
          label: "PLANNED",
          bg: "#f1f5f3",
          color: "#52645a",
          border: "#d8e1dc",
          dot: "#7b8d83",
        };

      case "IN_PROGRESS":
        return {
          label: "IN PROGRESS",
          bg: "#e8f2ec",
          color: "#2f6b4f",
          border: "#c8ded1",
          dot: "#2f6b4f",
        };

      case "ON_HOLD":
        return {
          label: "ON HOLD",
          bg: "#fff7e6",
          color: "#9a6700",
          border: "#f0d99b",
          dot: "#c58a00",
        };

      case "COMPLETED":
        return {
          label: "COMPLETED",
          bg: "#e8f5ed",
          color: "#277447",
          border: "#c6e2d1",
          dot: "#3b8b5c",
        };

      case "CANCELLED":
        return {
          label: "CANCELLED",
          bg: "#fdf0f0",
          color: "#a33a3a",
          border: "#eccaca",
          dot: "#c45454",
        };

      default:
        return {
          label: status || "UNKNOWN",
          bg: "#f1f5f3",
          color: "#52645a",
          border: "#d8e1dc",
          dot: "#7b8d83",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.35rem 0.7rem",
        borderRadius: "9999px",
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: "0.7rem",
        fontWeight: "700",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: config.dot,
          flexShrink: 0,
        }}
      />

      {config.label}
    </span>
  );
}


/* =========================================================
   PROJECT PRIORITY
========================================================= */

export function ProjectPriorityBadge({ priority }) {
  const getPriorityConfig = () => {
    switch (priority) {
      case "LOW":
        return {
          bg: "#f1f5f3",
          color: "#607169",
          border: "#d8e1dc",
        };

      case "MEDIUM":
        return {
          bg: "#edf4ef",
          color: "#3c7056",
          border: "#d1e2d7",
        };

      case "HIGH":
        return {
          bg: "#fff7e6",
          color: "#9a6700",
          border: "#f0d99b",
        };

      case "CRITICAL":
        return {
          bg: "#fdf0f0",
          color: "#a33a3a",
          border: "#eccaca",
        };

      default:
        return {
          bg: "#f1f5f3",
          color: "#52645a",
          border: "#d8e1dc",
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.3rem 0.65rem",
        borderRadius: "9999px",
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: "0.68rem",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {priority || "N/A"}
    </span>
  );
}


/* =========================================================
   PROJECT PROGRESS
========================================================= */

export function ProjectProgress({ percentage }) {
  const safePercent = Math.min(
    Math.max(Number(percentage) || 0, 0),
    100
  );

  const getProgressColor = () => {
    if (safePercent >= 100) {
      return "#2f6b4f";
    }

    if (safePercent >= 60) {
      return "#4b8065";
    }

    if (safePercent >= 30) {
      return "#b58a35";
    }

    return "#9b5c5c";
  };

  const progressColor = getProgressColor();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        width: "100%",
        minWidth: "110px",
      }}
    >
      {/* TRACK */}

      <div
        style={{
          flex: 1,
          height: "7px",
          backgroundColor: "#e8eeeb",
          borderRadius: "9999px",
          overflow: "hidden",
          minWidth: "50px",
        }}
      >
        {/* PROGRESS */}

        <div
          style={{
            height: "100%",
            width: `${safePercent}%`,
            backgroundColor: progressColor,
            borderRadius: "9999px",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* VALUE */}

      <span
        style={{
          minWidth: "34px",
          textAlign: "right",
          fontSize: "0.75rem",
          fontWeight: "700",
          color: "#34483e",
        }}
      >
        {safePercent}%
      </span>
    </div>
  );
}


/* Keep compatibility with existing imports */

export const ProgressBar = ProjectProgress;


/* =========================================================
   ROLE STATUS
========================================================= */

export function RoleStatusBadge({ isActive }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.3rem 0.65rem",
        borderRadius: "9999px",
        backgroundColor: isActive
          ? "#e8f5ed"
          : "#fdf0f0",
        color: isActive
          ? "#277447"
          : "#a33a3a",
        border: `1px solid ${
          isActive
            ? "#c6e2d1"
            : "#eccaca"
        }`,
        fontSize: "0.7rem",
        fontWeight: "700",
        letterSpacing: "0.04em",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: isActive
            ? "#3b8b5c"
            : "#c45454",
        }}
      />

      {isActive ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}