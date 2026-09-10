import React from "react";
import {
  X,
  CalendarDays,
  User,
  FolderKanban,
  Clock3,
  CheckCircle2,
  Eye,
  Megaphone,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import Button from "../../shared/components/Button";

const AnnouncementDetailModal = ({
  isOpen,
  onClose,
  announcement,
}) => {
  if (!isOpen || !announcement) return null;

  const isProjectScope =
    announcement.announcement_scope === "PROJECT";

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "URGENT":
        return {
          label: "Urgent",
          background: "#fdecec",
          color: "#a33a3a",
          border: "#efc6c6",
          icon: <ShieldAlert size={13} />,
        };

      case "IMPORTANT":
        return {
          label: "Important",
          background: "#fff5df",
          color: "#8a5a00",
          border: "#efd89e",
          icon: <AlertTriangle size={13} />,
        };

      default:
        return {
          label: priority || "Normal",
          background: "#f1f4f2",
          color: "#52615a",
          border: "#dce5df",
          icon: <Megaphone size={13} />,
        };
    }
  };

  const priority = getPriorityConfig(
    announcement.priority
  );

  const formatPublishedDate = (date) => {
    if (!date) return "Draft";

    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const formatExpiryDate = (date) => {
    if (!date) return null;

    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const expiryDate = formatExpiryDate(
    announcement.expires_at
  );

  return (
    <div style={styles.overlay}>
      <div
        className="announcement-modal-responsive"
        style={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-detail-title"
      >
        {/* =================================================
            HEADER
        ================================================= */}
        <div style={styles.header}>
          <div style={styles.headerPatternOne} />
          <div style={styles.headerPatternTwo} />

          <div style={styles.headerContent}>
            <div style={styles.topBar}>
              <div style={styles.headerIdentity}>
                <div style={styles.announcementIcon}>
                  <Megaphone size={21} />
                </div>

                <div>
                  <div style={styles.headerEyebrow}>
                    ANNOUNCEMENT DETAILS
                  </div>

                  <div style={styles.headerContext}>
                    HR COMMUNICATION
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={styles.closeButton}
                aria-label="Close announcement details"
              >
                <X size={19} />
              </button>
            </div>

            {/* Badges */}
            <div style={styles.badgeRow}>
              <span
                style={{
                  ...styles.scopeBadge,
                  ...(isProjectScope
                    ? styles.projectScopeBadge
                    : styles.companyScopeBadge),
                }}
              >
                {isProjectScope ? (
                  <>
                    <FolderKanban size={13} />
                    PROJECT
                    {announcement.project_code
                      ? ` • ${announcement.project_code}`
                      : ""}
                  </>
                ) : (
                  <>
                    <Megaphone size={13} />
                    COMPANY-WIDE
                  </>
                )}
              </span>

              <span
                style={{
                  ...styles.priorityBadge,
                  backgroundColor: priority.background,
                  color: priority.color,
                  borderColor: priority.border,
                }}
              >
                {priority.icon}
                {priority.label}
              </span>

              {announcement.announcement_type && (
                <span style={styles.typeBadge}>
                  {announcement.announcement_type}
                </span>
              )}
            </div>

            <h2
              id="announcement-detail-title"
              style={styles.title}
            >
              {announcement.title}
            </h2>

            {/* Meta */}
            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <User size={14} />
                </div>

                <div>
                  <span style={styles.metaLabel}>
                    POSTED BY
                  </span>

                  <strong style={styles.metaValue}>
                    {announcement.creator_name ||
                      "HR Admin"}
                  </strong>
                </div>
              </div>

              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <CalendarDays size={14} />
                </div>

                <div>
                  <span style={styles.metaLabel}>
                    PUBLISHED
                  </span>

                  <strong style={styles.metaValue}>
                    {formatPublishedDate(
                      announcement.published_at
                    )}
                  </strong>
                </div>
              </div>

              {expiryDate && (
                <div
                  style={{
                    ...styles.metaItem,
                    ...styles.expiryMeta,
                  }}
                >
                  <div
                    style={{
                      ...styles.metaIcon,
                      backgroundColor:
                        "rgba(255, 245, 223, 0.12)",
                      color: "#e7c675",
                    }}
                  >
                    <Clock3 size={14} />
                  </div>

                  <div>
                    <span style={styles.metaLabel}>
                      EXPIRES
                    </span>

                    <strong style={styles.metaValue}>
                      {expiryDate}
                    </strong>
                  </div>
                </div>
              )}

              {announcement.read_count !== null &&
                announcement.read_count !==
                  undefined && (
                  <div style={styles.metaItem}>
                    <div
                      style={{
                        ...styles.metaIcon,
                        backgroundColor:
                          "rgba(232, 242, 236, 0.12)",
                        color: "#b8d8c4",
                      }}
                    >
                      <Eye size={14} />
                    </div>

                    <div>
                      <span style={styles.metaLabel}>
                        READS
                      </span>

                      <strong style={styles.metaValue}>
                        {announcement.read_count}
                      </strong>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}
        <div style={styles.body}>
          {isProjectScope &&
            announcement.project_name && (
              <div style={styles.projectNotice}>
                <div style={styles.projectNoticeIcon}>
                  <FolderKanban size={17} />
                </div>

                <div style={styles.projectNoticeContent}>
                  <span style={styles.projectNoticeLabel}>
                    PROJECT ANNOUNCEMENT
                  </span>

                  <p style={styles.projectNoticeText}>
                    This announcement is targeted exclusively
                    to members of{" "}
                    <strong>
                      {announcement.project_name}
                    </strong>
                    {announcement.project_code
                      ? ` (${announcement.project_code})`
                      : ""}
                    .
                  </p>
                </div>
              </div>
            )}

          <div style={styles.contentHeader}>
            <div style={styles.contentIcon}>
              <Megaphone size={16} />
            </div>

            <div>
              <span style={styles.contentEyebrow}>
                MESSAGE
              </span>

              <h3 style={styles.contentTitle}>
                Announcement
              </h3>
            </div>
          </div>

          <div style={styles.contentBox}>
            <div style={styles.contentText}>
              {announcement.content}
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}
        <div
        className="announcement-detail-footer" 
        style={styles.footer}>
          <div style={styles.readState}>
            <div style={styles.readIcon}>
              <CheckCircle2 size={16} />
            </div>

            <div>
              <strong style={styles.readTitle}>
                Marked as Read
              </strong>

              <span style={styles.readDescription}>
                You have viewed this announcement.
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>

      <style>
        {`
          @keyframes announcementModalIn {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.985);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 640px) {
            .announcement-modal-responsive {
              max-height: 94vh !important;
              border-radius: 22px !important;
            }
            .announcement-detail-footer {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 0.75rem !important;
              padding: 0.85rem 1rem !important;
            }

            .announcement-detail-footer button {
              width: 100% !important;
              justify-content: center !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AnnouncementDetailModal;

const styles = {
  /* =====================================================
     OVERLAY
  ===================================================== */

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    backgroundColor: "rgba(23, 37, 31, 0.72)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxSizing: "border-box",
  },

  /* =====================================================
     MODAL
  ===================================================== */

  modal: {
    width: "100%",
    maxWidth: "780px",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    border: "1px solid #dce5df",
    borderRadius: "26px",
    boxShadow:
      "0 30px 80px rgba(23, 37, 31, 0.24)",
    animation:
      "announcementModalIn 180ms ease-out",
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
    backgroundColor: "#17251f",
    color: "#ffffff",
  },

  headerPatternOne: {
    position: "absolute",
    width: "260px",
    height: "260px",
    right: "-100px",
    top: "-145px",
    borderRadius: "50%",
    backgroundColor: "rgba(87, 139, 105, 0.18)",
  },

  headerPatternTwo: {
    position: "absolute",
    width: "180px",
    height: "180px",
    left: "45%",
    bottom: "-135px",
    borderRadius: "50%",
    backgroundColor: "rgba(47, 107, 79, 0.2)",
  },

  headerContent: {
    position: "relative",
    zIndex: 1,
    padding: "1.4rem 1.5rem 1.5rem",
  },

  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "1.2rem",
  },

  headerIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  announcementIcon: {
    width: "42px",
    height: "42px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "13px",
    backgroundColor: "#2f6b4f",
    color: "#ffffff",
    boxShadow:
      "0 8px 20px rgba(0, 0, 0, 0.12)",
  },

  headerEyebrow: {
    color: "#c4ddcc",
    fontSize: "0.67rem",
    fontWeight: "800",
    letterSpacing: "0.11em",
    marginBottom: "0.18rem",
  },

  headerContext: {
    color: "#8fa89a",
    fontSize: "0.62rem",
    fontWeight: "600",
    letterSpacing: "0.06em",
  },

  closeButton: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "11px",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    color: "#c3d1c9",
    cursor: "pointer",
  },

  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.45rem",
    marginBottom: "0.85rem",
  },

  scopeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.38rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.64rem",
    fontWeight: "800",
    letterSpacing: "0.03em",
    border: "1px solid transparent",
  },

  companyScopeBadge: {
    backgroundColor: "rgba(232, 242, 236, 0.13)",
    color: "#c5dfcd",
    borderColor: "rgba(197, 223, 205, 0.18)",
  },

  projectScopeBadge: {
    backgroundColor: "rgba(111, 166, 128, 0.16)",
    color: "#b8d8c4",
    borderColor: "rgba(184, 216, 196, 0.2)",
  },

  priorityBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.38rem 0.65rem",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "0.64rem",
    fontWeight: "800",
  },

  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.38rem 0.65rem",
    borderRadius: "999px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    color: "#c2d0c8",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    fontSize: "0.64rem",
    fontWeight: "700",
  },

  title: {
    margin: 0,
    maxWidth: "680px",
    color: "#ffffff",
    fontSize: "clamp(1.35rem, 3vw, 2rem)",
    lineHeight: 1.2,
    fontWeight: "800",
    letterSpacing: "-0.025em",
  },

  /* =====================================================
     META
  ===================================================== */

  metaGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(145px, 1fr))",
    gap: "0.65rem",
    marginTop: "1.35rem",
    paddingTop: "1rem",
    borderTop:
      "1px solid rgba(255, 255, 255, 0.1)",
  },

  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    minWidth: 0,
  },

  expiryMeta: {
    color: "#e7c675",
  },

  metaIcon: {
    width: "30px",
    height: "30px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    color: "#a9c1b2",
  },

  metaLabel: {
    display: "block",
    color: "#80978a",
    fontSize: "0.57rem",
    fontWeight: "800",
    letterSpacing: "0.09em",
    marginBottom: "0.15rem",
  },

  metaValue: {
    display: "block",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#e4ece7",
    fontSize: "0.7rem",
    fontWeight: "700",
  },

  /* =====================================================
     BODY
  ===================================================== */

  body: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "1.35rem 1.5rem",
    backgroundColor: "#fbfcfb",
    boxSizing: "border-box",
  },

  projectNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    marginBottom: "1.25rem",
    padding: "0.9rem",
    borderRadius: "15px",
    backgroundColor: "#eef6f0",
    border: "1px solid #d5e6da",
  },

  projectNoticeIcon: {
    width: "34px",
    height: "34px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#dcefe3",
    color: "#2f6b4f",
  },

  projectNoticeContent: {
    minWidth: 0,
  },

  projectNoticeLabel: {
    display: "block",
    color: "#52715f",
    fontSize: "0.6rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    marginBottom: "0.2rem",
  },

  projectNoticeText: {
    margin: 0,
    color: "#43564b",
    fontSize: "0.78rem",
    lineHeight: 1.55,
  },

  contentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    marginBottom: "0.8rem",
  },

  contentIcon: {
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#e8f2ec",
    color: "#2f6b4f",
  },

  contentEyebrow: {
    display: "block",
    color: "#789087",
    fontSize: "0.58rem",
    fontWeight: "800",
    letterSpacing: "0.09em",
    marginBottom: "0.1rem",
  },

  contentTitle: {
    margin: 0,
    color: "#17251f",
    fontSize: "0.95rem",
    fontWeight: "800",
  },

  contentBox: {
    padding: "1.15rem",
    backgroundColor: "#ffffff",
    border: "1px solid #dfe8e2",
    borderRadius: "17px",
    boxShadow:
      "0 5px 18px rgba(23, 37, 31, 0.035)",
  },

  contentText: {
    color: "#34463d",
    fontSize: "0.88rem",
    lineHeight: 1.75,
    whiteSpace: "pre-line",
    overflowWrap: "anywhere",
  },

  /* =====================================================
     FOOTER
  ===================================================== */

  footer: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "1rem 1.5rem",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e1e9e4",
  },

  readState: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    minWidth: 0,
  },

  readIcon: {
    width: "32px",
    height: "32px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#e8f2ec",
    color: "#2f6b4f",
  },

  readTitle: {
    display: "block",
    color: "#315640",
    fontSize: "0.72rem",
    fontWeight: "800",
  },

  readDescription: {
    display: "block",
    marginTop: "0.1rem",
    color: "#87938d",
    fontSize: "0.62rem",
  },
  
};
