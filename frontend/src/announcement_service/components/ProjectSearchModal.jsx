import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Users,
  Folder,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";
import { searchProjectsForAnnouncement } from "../services/announcementApi";
import Button from "../../shared/components/Button";

const ProjectSearchModal = ({ isOpen, onClose, onSelectProject }) => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjects("");
    } else {
      setSearch("");
      setProjects([]);
      setError(null);
    }
  }, [isOpen]);

  const fetchProjects = async (searchTerm) => {
    setLoading(true);
    setError(null);

    try {
      const res = await searchProjectsForAnnouncement({
        search: searchTerm,
      });

      setProjects(res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to search projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;

    setSearch(term);
    fetchProjects(term);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchProjects("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(3, 15, 10, 0.68)",
        backdropFilter: "blur(5px)",
      }}
    >
      {/* Modal */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "90vh",
          minHeight: "0",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-search-title"
      >
        {/* =========================================================
            HEADER
        ========================================================= */}
        <div
          style={{
            background: "#0f4d32",
            color: "#ffffff",
            padding: "24px 28px",
            position: "relative",
            flexShrink: 0,
            minHeight: "118px",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {/* Decorative circle */}
          <div
            style={{
              position: "absolute",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
              right: "-65px",
              top: "-95px",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              width: "100%",
              paddingRight: "55px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Folder icon */}
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Folder size={26} strokeWidth={2} />
            </div>

            {/* Header content */}
            <div
              style={{
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  marginBottom: "5px",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                PROJECT TARGETING
              </div>

              <h2
                id="project-search-title"
                style={{
                  margin: 0,
                  fontSize: "24px",
                  lineHeight: "1.25",
                  fontWeight: 800,
                  color: "#ffffff",
                }}
              >
                Select a Project
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "13px",
                  lineHeight: "1.4",
                  color: "rgba(255,255,255,0.70)",
                }}
              >
                Choose the project that should receive this announcement.
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 2,
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* =========================================================
            SEARCH SECTION
        ========================================================= */}
        <div
          style={{
            padding: "22px 28px",
            borderBottom: "1px solid #e5e7eb",
            background: "#ffffff",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "1.2px",
              color: "#166534",
              marginBottom: "9px",
            }}
          >
            FIND PROJECT
          </div>

          <div
            style={{
              position: "relative",
            }}
          >
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by project name or code..."
              style={{
                width: "100%",
                height: "54px",
                padding: "0 46px",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                background: "#f8fafc",
                color: "#17251d",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "32px",
                  height: "32px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#e2e8f0",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* =========================================================
            PROJECT RESULTS - ONLY THIS AREA SCROLLS
        ========================================================= */}
        <div
          className="flex-1 overflow-y-auto min-h-0"
          style={{
            padding: "22px 28px",
            background: "#ffffff",
          }}
        >
          {/* Results heading */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
              }}
            >
              <BriefcaseBusiness
                size={19}
                color="#166534"
                strokeWidth={2}
              />

              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#17251d",
                }}
              >
                Available Projects
              </span>
            </div>

            <div
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#ecfdf3",
                color: "#166534",
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              {projects.length} found
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div
              style={{
                minHeight: "220px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  border: "3px solid #d1fae5",
                  borderTopColor: "#15803d",
                  borderRadius: "50%",
                  animation: "projectModalSpin 0.8s linear infinite",
                }}
              />

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Searching projects...
              </span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                border: "1px solid #fecaca",
                background: "#fef2f2",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <AlertCircle
                size={20}
                color="#dc2626"
                style={{
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#991b1b",
                    marginBottom: "4px",
                  }}
                >
                  Unable to load projects
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#b91c1c",
                    lineHeight: "1.5",
                  }}
                >
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && projects.length === 0 && (
            <div
              style={{
                minHeight: "220px",
                border: "1px dashed #cbd5e1",
                borderRadius: "14px",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "30px",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background: "#ecfdf3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <Folder
                  size={24}
                  color="#15803d"
                />
              </div>

              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#17251d",
                  marginBottom: "5px",
                }}
              >
                No projects found
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  maxWidth: "340px",
                  lineHeight: "1.5",
                }}
              >
                Try searching with a different project name or project code.
              </div>
            </div>
          )}

          {/* Project list */}
          {!loading && !error && projects.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "14px",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#86efac";
                    e.currentTarget.style.background = "#f8fffa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  {/* Project icon */}
                  <div
                    style={{
                      width: "66px",
                      height: "66px",
                      borderRadius: "13px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Folder
                      size={21}
                      color="#15803d"
                      strokeWidth={2}
                    />

                    <span
                      style={{
                        marginTop: "4px",
                        fontSize: "9px",
                        fontWeight: 900,
                        color: "#166534",
                        letterSpacing: "0.4px",
                      }}
                    >
                      PROJECT
                    </span>
                  </div>

                  {/* Project information */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {/* Code + status */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "7px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "5px 8px",
                          borderRadius: "6px",
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          color: "#475569",
                          fontSize: "11px",
                          fontWeight: 800,
                        }}
                      >
                        {project.project_code}
                      </span>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#15803d",
                        }}
                      >
                        <CheckCircle2 size={13} />
                        {project.status || "ACTIVE"}
                      </span>
                    </div>

                    {/* Project name */}
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "#17251d",
                        lineHeight: "1.35",
                        marginBottom: "7px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={project.name}
                    >
                      {project.name}
                    </div>

                    {/* Members */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#94a3b8",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      <Users size={15} />

                      <span>
                        {project.member_count ?? 0} active members
                      </span>
                    </div>
                  </div>

                  {/* Select button */}
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    style={{
                      border: "none",
                      borderRadius: "10px",
                      background: "#ecfdf3",
                      color: "#166534",
                      padding: "11px 13px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#dcfce7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ecfdf3";
                    }}
                  >
                    Select
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================
            FOOTER
        ========================================================= */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid #e5e7eb",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexShrink: 0,
          }}
        >
          {/* Footer information */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              color: "#64748b",
              fontSize: "12px",
              lineHeight: "1.4",
            }}
          >
            <Users
              size={16}
              color="#64748b"
              style={{
                flexShrink: 0,
              }}
            />

            <span>
              Announcement will reach active project members.
            </span>
          </div>

          {/* Cancel */}
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Spinner animation */}
      <style>
        {`
          @keyframes projectModalSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ProjectSearchModal;