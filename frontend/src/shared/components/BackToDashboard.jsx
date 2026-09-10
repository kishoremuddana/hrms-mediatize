import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackToDashboard({ to, role = "HR" }) {
  const targetPath = to || (role === "EMPLOYEE" ? "/employee/dashboard" : "/hr/dashboard");

  return (
    <div style={styles.container}>
      <Link to={targetPath} style={styles.link}>
        <ArrowLeft size={16} strokeWidth={2} />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
}

const styles = {
  container: {
    marginBottom: "1rem",
  },

  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",

    backgroundColor: "#ffffff",
    color: "#2f6b4f",

    border: "1px solid #dce5df",

    padding: "0.625rem 1rem",
    borderRadius: "12px",

    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: "600",

    transition: "all 0.2s ease",

    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
  },
};
