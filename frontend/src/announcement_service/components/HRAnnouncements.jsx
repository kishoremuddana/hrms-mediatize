import React, { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Folder,
  Search,
  Eye,
  Edit,
  Send,
  Archive,
  RefreshCw,
  Calendar,
  AlertCircle,
  Clock,
  Building2,
  FileText,
  CheckCircle2,
  ArchiveRestore,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getHRAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
} from "../services/announcementApi";

import Button from "../../shared/components/Button";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import ProjectSearchModal from "./ProjectSearchModal";
import AnnouncementFormModal from "./AnnouncementFormModal";
import AnnouncementDetailModal from "./AnnouncementDetailModal";

const HRAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isProjectSearchOpen, setIsProjectSearchOpen] =
    useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState(null);

  const [viewingAnnouncement, setViewingAnnouncement] =
    useState(null);

  const [submitting, setSubmitting] = useState(false);

  /* =========================================================
     FETCH ANNOUNCEMENTS
  ========================================================= */

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
      };

      if (activeTab === "COMPANY") {
        params.scope = "COMPANY";
      }

      if (activeTab === "PROJECT") {
        params.scope = "PROJECT";
      }

      if (activeTab === "DRAFT") {
        params.status = "DRAFT";
      }

      if (activeTab === "PUBLISHED") {
        params.status = "PUBLISHED";
      }

      if (activeTab === "ARCHIVED") {
        params.status = "ARCHIVED";
      }

      const res = await getHRAnnouncements(params);

      setAnnouncements(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load announcements."
      );

      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, search]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  /* =========================================================
     CREATE COMPANY ANNOUNCEMENT
  ========================================================= */

  const handleOpenCompanyCreate = () => {
    setSelectedProject(null);
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  /* =========================================================
     CREATE PROJECT ANNOUNCEMENT
  ========================================================= */

  const handleProjectSelect = (project) => {
    setIsProjectSearchOpen(false);
    setSelectedProject(project);
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (announcement) => {
    setSelectedProject(null);
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  /* =========================================================
     FORM SUBMIT
  ========================================================= */

  const handleFormSubmit = async (
    payload,
    announcementId
  ) => {
    setSubmitting(true);

    try {
      if (announcementId) {
        await updateAnnouncement(announcementId, {
          title: payload.title,
          content: payload.content,
          announcement_type:
            payload.announcement_type,
          priority: payload.priority,
          expires_at: payload.expires_at,
        });

        toast.success(
          "Announcement updated successfully."
        );
      } else {
        await createAnnouncement(payload);

        toast.success(
          payload.publish_now
            ? "Announcement published successfully!"
            : "Announcement saved as draft."
        );
      }

      setIsFormOpen(false);
      setSelectedProject(null);
      setEditingAnnouncement(null);

      fetchAnnouncements();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to save announcement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     PUBLISH
  ========================================================= */

  const handlePublish = async (id) => {
    try {
      await publishAnnouncement(id);

      toast.success(
        "Announcement published successfully."
      );

      fetchAnnouncements();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to publish announcement."
      );
    }
  };

  /* =========================================================
     ARCHIVE
  ========================================================= */

  const handleArchive = async (id) => {
    try {
      await archiveAnnouncement(id);

      toast.success(
        "Announcement archived."
      );

      fetchAnnouncements();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to archive announcement."
      );
    }
  };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const allCount = announcements.length;

  const draftCount = announcements.filter(
    (item) => item.status === "DRAFT"
  ).length;

  const publishedCount = announcements.filter(
    (item) => item.status === "PUBLISHED"
  ).length;

  const archivedCount = announcements.filter(
    (item) => item.status === "ARCHIVED"
  ).length;

  const companyCount = announcements.filter(
    (item) =>
      item.announcement_scope === "COMPANY"
  ).length;

  const projectCount = announcements.filter(
    (item) =>
      item.announcement_scope === "PROJECT"
  ).length;

  /* =========================================================
     STATUS CONFIG
  ========================================================= */

  const getStatusConfig = (status) => {
    if (status === "PUBLISHED") {
      return {
        label: "Published",
        background: "#ECFDF5",
        color: "#047857",
        border: "#A7F3D0",
        icon: CheckCircle2,
      };
    }

    if (status === "DRAFT") {
      return {
        label: "Draft",
        background: "#FFF7ED",
        color: "#C2410C",
        border: "#FED7AA",
        icon: FileText,
      };
    }

    return {
      label: "Archived",
      background: "#F3F4F6",
      color: "#6B7280",
      border: "#D1D5DB",
      icon: ArchiveRestore,
    };
  };

  /* =========================================================
     PRIORITY CONFIG
  ========================================================= */

  const getPriorityConfig = (priority) => {
    if (priority === "URGENT") {
      return {
        color: "#B91C1C",
        background: "#FEF2F2",
        border: "#FECACA",
        dot: "#DC2626",
      };
    }

    if (priority === "IMPORTANT") {
      return {
        color: "#B45309",
        background: "#FFFBEB",
        border: "#FDE68A",
        dot: "#D97706",
      };
    }

    return {
      color: "#64748B",
      background: "#F8FAFC",
      border: "#E2E8F0",
      dot: "#94A3B8",
    };
  };

  const tabs = [
    {
      id: "ALL",
      label: "All",
      icon: Megaphone,
      count: allCount,
    },
    {
      id: "COMPANY",
      label: "Company",
      icon: Building2,
      count: companyCount,
    },
    {
      id: "PROJECT",
      label: "Projects",
      icon: Folder,
      count: projectCount,
    },
    {
      id: "DRAFT",
      label: "Drafts",
      icon: FileText,
      count: draftCount,
    },
    {
      id: "PUBLISHED",
      label: "Published",
      icon: CheckCircle2,
      count: publishedCount,
    },
    {
      id: "ARCHIVED",
      label: "Archived",
      icon: Archive,
      count: archivedCount,
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <AppLayout title="Announcements Management">
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "22px 24px 40px",
        }}
      >
        <BackToDashboard role="HR" />

        {/* =================================================
            HERO
        ================================================= */}

        <section
          style={{
            marginTop: "20px",
            padding: "26px",
            borderRadius: "17px",
            background:
              "linear-gradient(135deg, #123524 0%, #1F5A3A 100%)",
            position: "relative",
            overflow: "hidden",
            color: "#FFFFFF",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "230px",
              height: "230px",
              borderRadius: "50%",
              border:
                "1px solid rgba(255,255,255,0.08)",
              right: "-80px",
              top: "-110px",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  opacity: 0.75,
                }}
              >
                <Megaphone size={14} />
                HR COMMUNICATION MANAGEMENT
              </div>

              <h1
                style={{
                  margin: "8px 0 0",
                  fontSize: "29px",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                Announcement Center
              </h1>

              <p
                style={{
                  margin: "7px 0 0",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  opacity: 0.75,
                  maxWidth: "560px",
                }}
              >
                Create, manage, publish and archive
                company-wide and project-specific
                communication.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              <button
                onClick={() =>
                  setIsProjectSearchOpen(true)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "10px 13px",
                  borderRadius: "8px",
                  border:
                    "1px solid rgba(255,255,255,0.2)",
                  background:
                    "rgba(255,255,255,0.09)",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  flex: "1 1 180px",
                }}
              >
                <Folder size={14} />
                Project Announcement
              </button>

              <button
                onClick={
                  handleOpenCompanyCreate
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "10px 13px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#FFFFFF",
                  color: "#166534",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                  flex: "1 1 180px",
                }}
              >
                <Plus size={14} />
                Company Announcement
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section
          style={{
            marginTop: "15px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
          }}
        >
          <SummaryCard
            label="Total"
            value={allCount}
            icon={Megaphone}
            active={activeTab === "ALL"}
            onClick={() => {
              setActiveTab("ALL");
              setPage(1);
            }}
          />

          <SummaryCard
            label="Drafts"
            value={draftCount}
            icon={FileText}
            active={activeTab === "DRAFT"}
            onClick={() => {
              setActiveTab("DRAFT");
              setPage(1);
            }}
          />

          <SummaryCard
            label="Published"
            value={publishedCount}
            icon={CheckCircle2}
            active={activeTab === "PUBLISHED"}
            onClick={() => {
              setActiveTab("PUBLISHED");
              setPage(1);
            }}
          />

          <SummaryCard
            label="Archived"
            value={archivedCount}
            icon={Archive}
            active={activeTab === "ARCHIVED"}
            onClick={() => {
              setActiveTab("ARCHIVED");
              setPage(1);
            }}
          />
        </section>

        {/* =================================================
            MANAGEMENT AREA
        ================================================= */}

        <section
          style={{
            marginTop: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "13px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#17231B",
                }}
              >
                Manage Announcements
              </div>

              <div
                style={{
                  marginTop: "3px",
                  color: "#9CA3AF",
                  fontSize: "10px",
                }}
              >
                Review and manage your communication
                records.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "250px",
                }}
              >
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color: "#9CA3AF",
                  }}
                />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(
                      e.target.value
                    );
                    setPage(1);
                  }}
                  placeholder="Search announcements..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding:
                      "9px 11px 9px 32px",
                    border:
                      "1px solid #D1D5DB",
                    borderRadius: "8px",
                    outline: "none",
                    background:
                      "#FFFFFF",
                    color: "#17231B",
                    fontSize: "11px",
                  }}
                />
              </div>

              <button
                onClick={fetchAnnouncements}
                disabled={loading}
                title="Refresh"
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "8px",
                  border:
                    "1px solid #D1D5DB",
                  background:
                    "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#166534",
                  cursor: "pointer",
                }}
              >
                <RefreshCw
                  size={14}
                  style={{
                    animation: loading
                      ? "hrAnnouncementSpin 1s linear infinite"
                      : "none",
                  }}
                />
              </button>
            </div>
          </div>

          {/* =================================================
              FILTER NAVIGATION
          ================================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px",
              background: "#F3F4F6",
              borderRadius: "10px",
              overflowX: "auto",
              marginBottom: "13px",
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding:
                      "8px 11px",
                    border: "none",
                    borderRadius: "7px",
                    background: active
                      ? "#FFFFFF"
                      : "transparent",
                    color: active
                      ? "#166534"
                      : "#6B7280",
                    fontSize: "10px",
                    fontWeight: active
                      ? 800
                      : 600,
                    whiteSpace:
                      "nowrap",
                    cursor: "pointer",
                    boxShadow: active
                      ? "0 1px 3px rgba(0,0,0,0.08)"
                      : "none",
                  }}
                >
                  <Icon size={13} />

                  {tab.label}

                  <span
                    style={{
                      minWidth: "18px",
                      height: "18px",
                      padding:
                        "0 5px",
                      display: "inline-flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      borderRadius:
                        "20px",
                      background:
                        active
                          ? "#DCFCE7"
                          : "#E5E7EB",
                      color: active
                        ? "#166534"
                        : "#6B7280",
                      fontSize:
                        "8px",
                      fontWeight: 800,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          {loading ? (
            <div
              style={{
                border:
                  "1px solid #E5E7EB",
                borderRadius: "12px",
                overflow: "hidden",
                background:
                  "#FFFFFF",
              }}
            >
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      height: "78px",
                      borderBottom:
                        "1px solid #F1F5F2",
                      background:
                        "linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)",
                      backgroundSize:
                        "200% 100%",
                      animation:
                        "hrAnnouncementShimmer 1.5s infinite",
                    }}
                  />
                )
              )}
            </div>
          ) : error ? (
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: "#FEF2F2",
                border:
                  "1px solid #FECACA",
                color: "#B91C1C",
                display: "flex",
                gap: "10px",
                alignItems:
                  "center",
                fontSize: "12px",
              }}
            >
              <AlertCircle size={19} />
              {error}
            </div>
          ) : announcements.length ===
            0 ? (
            <EmptyState
              search={search}
              activeTab={
                activeTab
              }
              onCreate={
                handleOpenCompanyCreate
              }
            />
          ) : (
            <div
              style={{
                border:
                  "1px solid #E5E7EB",
                borderRadius: "12px",
                overflow: "hidden",
                background:
                  "#FFFFFF",
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "70px minmax(280px, 1fr) 150px 120px 110px 210px",
                  gap: "10px",
                  alignItems:
                    "center",
                  padding:
                    "11px 15px",
                  background:
                    "#F8FAFC",
                  borderBottom:
                    "1px solid #E5E7EB",
                  color:
                    "#64748B",
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing:
                    "0.07em",
                  textTransform:
                    "uppercase",
                }}
              >
                <span>Date</span>
                <span>Announcement</span>
                <span>Scope</span>
                <span>Status</span>
                <span>Audience</span>
                <span>Actions</span>
              </div>

              {announcements.map(
                (ann) => {
                  return (
                    <AnnouncementTableRow
                      key={ann.id}
                      announcement={
                        ann
                      }
                      onView={() =>
                        setViewingAnnouncement(
                          ann
                        )
                      }
                      onEdit={() =>
                        handleEdit(
                          ann
                        )
                      }
                      onPublish={() =>
                        handlePublish(
                          ann.id
                        )
                      }
                      onArchive={() =>
                        handleArchive(
                          ann.id
                        )
                      }
                      getStatusConfig={
                        getStatusConfig
                      }
                      getPriorityConfig={
                        getPriorityConfig
                      }
                    />
                  );
                }
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    padding:
                      "13px 15px",
                    borderTop:
                      "1px solid #E5E7EB",
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                  }}
                >
                  <span
                    style={{
                      fontSize:
                        "10px",
                      color:
                        "#9CA3AF",
                    }}
                  >
                    Page {page} of{" "}
                    {totalPages}
                  </span>

                  <div
                    style={{
                      display:
                        "flex",
                      gap: "5px",
                    }}
                  >
                    <button
                      disabled={
                        page <= 1
                      }
                      onClick={() =>
                        setPage(
                          (p) =>
                            Math.max(
                              1,
                              p - 1
                            )
                        )
                      }
                      style={{
                        padding:
                          "7px 10px",
                        border:
                          "1px solid #D1D5DB",
                        borderRadius:
                          "7px",
                        background:
                          "#FFFFFF",
                        color:
                          "#475569",
                        fontSize:
                          "10px",
                        fontWeight:
                          700,
                        cursor:
                          "pointer",
                        opacity:
                          page <= 1
                            ? 0.4
                            : 1,
                      }}
                    >
                      Previous
                    </button>

                    <button
                      disabled={
                        page >=
                        totalPages
                      }
                      onClick={() =>
                        setPage(
                          (p) =>
                            Math.min(
                              totalPages,
                              p + 1
                            )
                        )
                      }
                      style={{
                        padding:
                          "7px 10px",
                        border:
                          "1px solid #D1D5DB",
                        borderRadius:
                          "7px",
                        background:
                          "#FFFFFF",
                        color:
                          "#475569",
                        fontSize:
                          "10px",
                        fontWeight:
                          700,
                        cursor:
                          "pointer",
                        opacity:
                          page >=
                          totalPages
                            ? 0.4
                            : 1,
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          PROJECT SEARCH
      ===================================================== */}

      <ProjectSearchModal
        isOpen={
          isProjectSearchOpen
        }
        onClose={() =>
          setIsProjectSearchOpen(
            false
          )
        }
        onSelectProject={
          handleProjectSelect
        }
      />

      {/* =====================================================
          FORM
      ===================================================== */}

      <AnnouncementFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProject(null);
          setEditingAnnouncement(null);
        }}
        onSubmit={
          handleFormSubmit
        }
        selectedProject={
          selectedProject
        }
        editingAnnouncement={
          editingAnnouncement
        }
        loading={submitting}
      />

      {/* =====================================================
          DETAIL
      ===================================================== */}

      <AnnouncementDetailModal
        isOpen={
          !!viewingAnnouncement
        }
        onClose={() =>
          setViewingAnnouncement(
            null
          )
        }
        announcement={
          viewingAnnouncement
        }
      />

      <style>
        {`
          @keyframes hrAnnouncementSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes hrAnnouncementShimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>
    </AppLayout>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "15px",
        borderRadius: "12px",
        border: active
          ? "1px solid #86EFAC"
          : "1px solid #E5E7EB",
        background: active
          ? "#F0FDF4"
          : "#FFFFFF",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            background: active
              ? "#DCFCE7"
              : "#F3F4F6",
            color: active
              ? "#166534"
              : "#64748B",
          }}
        >
          <Icon size={16} />
        </div>

        {active && (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius:
                "50%",
              background:
                "#16A34A",
            }}
          />
        )}
      </div>

      <div
        style={{
          marginTop: "12px",
          fontSize: "23px",
          fontWeight: 900,
          color: "#17231B",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "2px",
          fontSize: "10px",
          fontWeight: 700,
          color: "#6B7280",
        }}
      >
        {label}
      </div>
    </button>
  );
};

/* =========================================================
   TABLE ROW
========================================================= */

const AnnouncementTableRow = ({
  announcement,
  onView,
  onEdit,
  onPublish,
  onArchive,
  getStatusConfig,
  getPriorityConfig,
}) => {
  const status =
    getStatusConfig(
      announcement.status
    );

  const StatusIcon =
    status.icon;

  const priority =
    getPriorityConfig(
      announcement.priority
    );

  const isProject =
    announcement.announcement_scope ===
    "PROJECT";

  const date = announcement.published_at
    ? new Date(
        announcement.published_at
      )
    : null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "70px minmax(280px, 1fr) 150px 120px 110px 210px",
        gap: "10px",
        alignItems: "center",
        padding:
          "14px 15px",
        borderBottom:
          "1px solid #F1F5F2",
        transition:
          "background 0.2s ease",
      }}
    >
      {/* Date */}
      <div>
        {date ? (
          <>
            <div
              style={{
                fontSize:
                  "16px",
                fontWeight:
                  900,
                color:
                  "#17231B",
              }}
            >
              {date
                .getDate()
                .toString()
                .padStart(
                  2,
                  "0"
                )}
            </div>

            <div
              style={{
                marginTop:
                  "2px",
                fontSize:
                  "8px",
                fontWeight:
                  800,
                color:
                  "#9CA3AF",
              }}
            >
              {date
                .toLocaleString(
                  "en-US",
                  {
                    month:
                      "short",
                  }
                )
                .toUpperCase()}
            </div>
          </>
        ) : (
          <span
            style={{
              color:
                "#9CA3AF",
              fontSize:
                "10px",
            }}
          >
            Draft
          </span>
        )}
      </div>

      {/* Announcement */}
      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: "6px",
            flexWrap:
              "wrap",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius:
                "50%",
              background:
                priority.dot,
            }}
          />

          <span
            style={{
              color:
                priority.color,
              fontSize:
                "8px",
              fontWeight:
                800,
              textTransform:
                "uppercase",
            }}
          >
            {announcement.priority}
          </span>
        </div>

        <div
          style={{
            marginTop:
              "4px",
            color:
              "#17231B",
            fontSize:
              "12px",
            fontWeight:
              800,
            overflow:
              "hidden",
            textOverflow:
              "ellipsis",
            whiteSpace:
              "nowrap",
          }}
        >
          {announcement.title}
        </div>

        <div
          style={{
            marginTop:
              "3px",
            color:
              "#9CA3AF",
            fontSize:
              "9px",
            overflow:
              "hidden",
            textOverflow:
              "ellipsis",
            whiteSpace:
              "nowrap",
          }}
        >
          {announcement.content}
        </div>
      </div>

      {/* Scope */}
      <div>
        <span
          style={{
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: "5px",
            padding:
              "5px 7px",
            borderRadius:
              "5px",
            background:
              isProject
                ? "#F0FDF4"
                : "#F8FAFC",
            color:
              isProject
                ? "#166534"
                : "#475569",
            border:
              `1px solid ${
                isProject
                  ? "#BBF7D0"
                  : "#E2E8F0"
              }`,
            fontSize:
              "8px",
            fontWeight:
              800,
          }}
        >
          {isProject ? (
            <Folder size={10} />
          ) : (
            <Building2
              size={10}
            />
          )}

          {isProject
            ? announcement.project_code ||
              "PROJECT"
            : "COMPANY"}
        </span>
      </div>

      {/* Status */}
      <div>
        <span
          style={{
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: "5px",
            padding:
              "5px 7px",
            borderRadius:
              "5px",
            background:
              status.background,
            color:
              status.color,
            border:
              `1px solid ${status.border}`,
            fontSize:
              "8px",
            fontWeight:
              800,
          }}
        >
          <StatusIcon
            size={10}
          />

          {status.label}
        </span>
      </div>

      {/* Audience */}
      <div
        style={{
          color:
            "#6B7280",
          fontSize:
            "9px",
        }}
      >
        {isProject
          ? announcement.project_name ||
            "Project team"
          : "All employees"}
      </div>

      {/* Actions */}
      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          gap: "5px",
        }}
      >
        <ActionButton
          icon={Eye}
          label="View"
          onClick={onView}
        />

        {announcement.status !==
          "ARCHIVED" && (
          <ActionButton
            icon={Edit}
            label="Edit"
            onClick={onEdit}
          />
        )}

        {announcement.status ===
          "DRAFT" && (
          <ActionButton
            icon={Send}
            label="Publish"
            primary
            onClick={
              onPublish
            }
          />
        )}

        {announcement.status !==
          "ARCHIVED" && (
          <ActionButton
            icon={Archive}
            label="Archive"
            danger
            onClick={
              onArchive
            }
          />
        )}
      </div>
    </div>
  );
};

/* =========================================================
   ACTION BUTTON
========================================================= */

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  primary = false,
  danger = false,
}) => {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: "flex",
        alignItems:
          "center",
        gap: "4px",
        padding:
          "6px 7px",
        borderRadius:
          "6px",
        border:
          `1px solid ${
            danger
              ? "#FECACA"
              : primary
              ? "#BBF7D0"
              : "#E5E7EB"
          }`,
        background:
          danger
            ? "#FEF2F2"
            : primary
            ? "#F0FDF4"
            : "#FFFFFF",
        color:
          danger
            ? "#B91C1C"
            : primary
            ? "#166534"
            : "#64748B",
        fontSize:
          "8px",
        fontWeight:
          800,
        cursor:
          "pointer",
        whiteSpace:
          "nowrap",
      }}
    >
      <Icon size={10} />
      {label}
    </button>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  search,
  activeTab,
  onCreate,
}) => {
  return (
    <div
      style={{
        minHeight: "350px",
        display: "flex",
        flexDirection:
          "column",
        alignItems:
          "center",
        justifyContent:
          "center",
        border:
          "1px solid #E5E7EB",
        borderRadius:
          "13px",
        background:
          "#FFFFFF",
        textAlign:
          "center",
      }}
    >
      <div
        style={{
          width: "58px",
          height: "58px",
          borderRadius:
            "14px",
          background:
            "#F0FDF4",
          color:
            "#15803D",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >
        <Megaphone
          size={26}
        />
      </div>

      <h3
        style={{
          margin:
            "15px 0 0",
          color:
            "#17231B",
          fontSize:
            "15px",
          fontWeight:
            800,
        }}
      >
        No announcements found
      </h3>

      <p
        style={{
          margin:
            "6px 0 0",
          color:
            "#9CA3AF",
          fontSize:
            "10px",
          maxWidth:
            "350px",
          lineHeight:
            1.6,
        }}
      >
        {search
          ? "No announcements match your search. Try a different keyword."
          : `There are no announcements in the ${activeTab.toLowerCase()} section.`}
      </p>

      {!search &&
        activeTab ===
          "ALL" && (
          <button
            onClick={onCreate}
            style={{
              marginTop:
                "15px",
              display:
                "flex",
              alignItems:
                "center",
              gap: "6px",
              padding:
                "8px 11px",
              border:
                "none",
              borderRadius:
                "7px",
              background:
                "#166534",
              color:
                "#FFFFFF",
              fontSize:
                "10px",
              fontWeight:
                800,
              cursor:
                "pointer",
            }}
          >
            <Plus size={12} />
            Create Announcement
          </button>
        )}
    </div>
  );
};

export default HRAnnouncements;