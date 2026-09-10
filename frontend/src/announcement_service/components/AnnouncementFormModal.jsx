import React, { useEffect, useState } from "react";
import {
  X,
  Megaphone,
  FolderKanban,
  CalendarDays,
  AlertCircle,
  Send,
  Save,
  FileText,
  Clock3,
  ShieldAlert,
  Info,
  ChevronDown,
  Check,
} from "lucide-react";
import Button from "../../shared/components/Button";

const ANNOUNCEMENT_TYPES = [
  { value: "GENERAL", label: "General Announcement" },
  { value: "COMPANY_UPDATE", label: "Company Update" },
  { value: "HR_NOTICE", label: "HR Notice" },
  { value: "HOLIDAY", label: "Holiday" },
  { value: "SALARY", label: "Salary / Payroll Notice" },
];

const PRIORITIES = [
  { value: "NORMAL", label: "Normal" },
  { value: "IMPORTANT", label: "Important" },
  { value: "URGENT", label: "Urgent" },
];

const AnnouncementFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedProject = null,
  editingAnnouncement = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    announcement_type: "GENERAL",
    priority: "NORMAL",
    announcement_scope: "COMPANY",
    expires_at: "",
  });

  const [errors, setErrors] = useState({});
  const [announcementTypeOpen, setAnnouncementTypeOpen] = useState(false);
  useEffect(() => {
    if (editingAnnouncement) {
      setFormData({
        title: editingAnnouncement.title || "",
        content: editingAnnouncement.content || "",
        announcement_type:
          editingAnnouncement.announcement_type ||
          "GENERAL",
        priority:
          editingAnnouncement.priority || "NORMAL",
        announcement_scope:
          editingAnnouncement.announcement_scope ||
          "COMPANY",
        expires_at: editingAnnouncement.expires_at
          ? new Date(editingAnnouncement.expires_at)
              .toISOString()
              .slice(0, 16)
          : "",
      });
    } else if (selectedProject) {
      setFormData({
        title: "",
        content: "",
        announcement_type: "GENERAL",
        priority: "NORMAL",
        announcement_scope: "PROJECT",
        expires_at: "",
      });
    } else {
      setFormData({
        title: "",
        content: "",
        announcement_type: "GENERAL",
        priority: "NORMAL",
        announcement_scope: "COMPANY",
        expires_at: "",
      });
    }

    setErrors({});
  }, [isOpen, selectedProject, editingAnnouncement]);

  if (!isOpen) return null;

  const isProjectScope =
    selectedProject ||
    formData.announcement_scope === "PROJECT";

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.title.trim()) {
      errs.title = "Title is required.";
    }

    if (!formData.content.trim()) {
      errs.content = "Message content is required.";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (publishNow) => {
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      announcement_type: formData.announcement_type,
      priority: formData.priority,
      announcement_scope: isProjectScope
        ? "PROJECT"
        : "COMPANY",
      project_id: isProjectScope
        ? selectedProject
          ? selectedProject.id
          : editingAnnouncement?.project_id
        : null,
      expires_at: formData.expires_at
        ? new Date(formData.expires_at).toISOString()
        : null,
      publish_now: publishNow,
    };

    onSubmit(
      payload,
      editingAnnouncement?.id
    );
  };

  const getPriorityVisual = (priority) => {
    switch (priority) {
      case "URGENT":
        return {
          icon: <ShieldAlert size={16} />,
          background: "#fdecec",
          border: "#efc6c6",
          color: "#a33a3a",
          description:
            "Requires immediate attention from recipients.",
        };

      case "IMPORTANT":
        return {
          icon: <AlertCircle size={16} />,
          background: "#fff5df",
          border: "#efd89e",
          color: "#8a5a00",
          description:
            "Important information employees should review.",
        };

      default:
        return {
          icon: <Info size={16} />,
          background: "#e8f2ec",
          border: "#c9dfd0",
          color: "#2f6b4f",
          description:
            "Standard communication for employees.",
        };
    }
  };

  const priorityVisual = getPriorityVisual(
    formData.priority
  );

  return (
    <div style={styles.overlay}>
      <div
        style={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-form-title"
      >
        {/* =================================================
            HEADER
        ================================================= */}
        <div style={styles.header}>
          <div style={styles.headerGlowOne} />
          <div style={styles.headerGlowTwo} />

          <div style={styles.headerContent}>
            <div style={styles.headerTop}>
              <div style={styles.headerIdentity}>
                <div style={styles.headerIcon}>
                  {isProjectScope ? (
                    <FolderKanban size={21} />
                  ) : (
                    <Megaphone size={21} />
                  )}
                </div>

                <div>
                  <div style={styles.headerEyebrow}>
                    HR COMMUNICATION
                  </div>

                  <h2
                    id="announcement-form-title"
                    style={styles.headerTitle}
                  >
                    {editingAnnouncement
                      ? "Edit Announcement"
                      : isProjectScope
                      ? "Project Announcement"
                      : "Company Announcement"}
                  </h2>

                  <p style={styles.headerSubtitle}>
                    {isProjectScope
                      ? "Targeted to active project team members only"
                      : "Visible to active employees company-wide"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={styles.closeButton}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            {/* Scope indicator */}
            <div style={styles.scopeIndicator}>
              <div
                style={{
                  ...styles.scopeDot,
                  backgroundColor: isProjectScope
                    ? "#b8d8c4"
                    : "#d7ebde",
                }}
              />

              <span>
                {isProjectScope
                  ? "PROJECT-SCOPED ANNOUNCEMENT"
                  : "COMPANY-WIDE ANNOUNCEMENT"}
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            BODY
        ================================================= */}
        <div style={styles.body}>
          {/* Project association */}
          {selectedProject && (
            <section style={styles.projectCard}>
              <div style={styles.projectCardIcon}>
                <FolderKanban size={18} />
              </div>

              <div style={styles.projectCardContent}>
                <div style={styles.projectCardLabel}>
                  ASSOCIATED PROJECT
                </div>

                <div style={styles.projectNameRow}>
                  <h3 style={styles.projectName}>
                    {selectedProject.name}
                  </h3>

                  <span style={styles.projectCode}>
                    {selectedProject.project_code}
                  </span>
                </div>

                <p style={styles.projectDescription}>
                  {selectedProject.member_count} active team
                  member
                  {selectedProject.member_count !== 1
                    ? "s"
                    : ""}{" "}
                  will receive this announcement.
                </p>
              </div>
            </section>
          )}

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>
                01
              </div>

              <div>
                <div style={styles.sectionEyebrow}>
                  BASIC INFORMATION
                </div>

                <h3 style={styles.sectionTitle}>
                  What do you want to announce?
                </h3>
              </div>
            </div>

            {/* Title */}
            <div style={styles.field}>
              <label style={styles.label}>
                Announcement Title
                <span style={styles.required}>*</span>
              </label>

              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  handleChange(
                    "title",
                    e.target.value
                  )
                }
                placeholder="e.g. Q3 Town Hall Scheduled"
                style={{
                  ...styles.input,
                  ...(errors.title
                    ? styles.inputError
                    : {}),
                }}
              />

              {errors.title && (
                <div style={styles.errorMessage}>
                  <AlertCircle size={13} />
                  {errors.title}
                </div>
              )}
            </div>

            {/* Type */}
            <div style={styles.field}>
              <label style={styles.label}>
                Announcement Type
              </label>

              <div style={{ position: "relative", width: "100%" }}>
                <button
                  type="button"
                  onClick={() =>
                    setAnnouncementTypeOpen((prev) => !prev)
                  }
                  style={{
                    ...styles.select,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={announcementTypeOpen}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <FileText
                      size={16}
                      color="#718078"
                      style={{ flexShrink: 0 }}
                    />

                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {
                        ANNOUNCEMENT_TYPES.find(
                          (type) =>
                            type.value === formData.announcement_type
                        )?.label
                      }
                    </span>
                  </span>

                  <ChevronDown
                    size={16}
                    color="#52615a"
                    style={{
                      flexShrink: 0,
                      transform: announcementTypeOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 150ms ease",
                    }}
                  />
                </button>

                {announcementTypeOpen && (
                  <div
                    role="listbox"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 5px)",
                      left: 0,
                      right: 0,
                      zIndex: 2000,
                      padding: "0.35rem",
                      backgroundColor: "#ffffff",
                      border: "1px solid #dce5df",
                      borderRadius: "12px",
                      boxShadow:
                        "0 12px 30px rgba(23, 37, 31, 0.16)",
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {ANNOUNCEMENT_TYPES.map((type) => {
                      const selected =
                        formData.announcement_type === type.value;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            handleChange(
                              "announcement_type",
                              type.value
                            );
                            setAnnouncementTypeOpen(false);
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.65rem 0.75rem",
                            border: "none",
                            borderRadius: "8px",
                            backgroundColor: selected
                              ? "#e8f2ec"
                              : "transparent",
                            color: selected
                              ? "#064e3b"
                              : "#26352e",
                            fontSize: "0.78rem",
                            fontWeight: selected ? 700 : 500,
                            textAlign: "left",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <span>{type.label}</span>

                          {selected && (
                            <Check
                              size={15}
                              color="#2f6b4f"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              PRIORITY
          ================================================= */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>
                02
              </div>

              <div>
                <div style={styles.sectionEyebrow}>
                  PRIORITY
                </div>

                <h3 style={styles.sectionTitle}>
                  How important is this message?
                </h3>
              </div>
            </div>

            <div style={styles.priorityGrid}>
              {PRIORITIES.map((priority) => {
                const selected =
                  formData.priority ===
                  priority.value;

                const visual =
                  getPriorityVisual(
                    priority.value
                  );

                return (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() =>
                      handleChange(
                        "priority",
                        priority.value
                      )
                    }
                    style={{
                      ...styles.priorityOption,
                      ...(selected
                        ? {
                            backgroundColor:
                              visual.background,
                            borderColor:
                              visual.border,
                          }
                        : {}),
                    }}
                  >
                    <div
                      style={{
                        ...styles.priorityIcon,
                        color: selected
                          ? visual.color
                          : "#718078",
                        backgroundColor: selected
                          ? "#ffffff"
                          : "#f3f6f4",
                      }}
                    >
                      {visual.icon}
                    </div>

                    <div
                      style={
                        styles.priorityContent
                      }
                    >
                      <span
                        style={{
                          ...styles.priorityName,
                          color: selected
                            ? visual.color
                            : "#34463d",
                        }}
                      >
                        {priority.label}
                      </span>

                      <span
                        style={
                          styles.priorityDescription
                        }
                      >
                        {visual.description}
                      </span>
                    </div>

                    <span
                      style={{
                        ...styles.radio,
                        ...(selected
                          ? {
                              borderColor:
                                visual.color,
                            }
                          : {}),
                      }}
                    >
                      {selected && (
                        <span
                          style={{
                            ...styles.radioDot,
                            backgroundColor:
                              visual.color,
                          }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* =================================================
              EXPIRY
          ================================================= */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>
                03
              </div>

              <div>
                <div style={styles.sectionEyebrow}>
                  AVAILABILITY
                </div>

                <h3 style={styles.sectionTitle}>
                  Set an optional expiry
                </h3>
              </div>
            </div>

            <div style={styles.expiryCard}>
              <div style={styles.expiryIcon}>
                <Clock3 size={17} />
              </div>

              <div style={styles.expiryContent}>
                <label style={styles.label}>
                  Expiry Date & Time
                </label>

                <p style={styles.helperText}>
                  Leave this blank if the announcement
                  should remain available without an
                  expiry date.
                </p>

                <div style={styles.dateWrapper}>
                  <CalendarDays
                    size={16}
                    style={styles.dateIcon}
                  />

                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) =>
                      handleChange(
                        "expires_at",
                        e.target.value
                      )
                    }
                    style={styles.dateInput}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              MESSAGE
          ================================================= */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>
                04
              </div>

              <div>
                <div style={styles.sectionEyebrow}>
                  MESSAGE
                </div>

                <h3 style={styles.sectionTitle}>
                  Write your announcement
                </h3>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Message Content
                <span style={styles.required}>*</span>
              </label>

              <textarea
                rows={7}
                value={formData.content}
                onChange={(e) =>
                  handleChange(
                    "content",
                    e.target.value
                  )
                }
                placeholder="Write the announcement details here..."
                style={{
                  ...styles.textarea,
                  ...(errors.content
                    ? styles.inputError
                    : {}),
                }}
              />

              <div style={styles.textareaFooter}>
                {errors.content ? (
                  <div style={styles.errorMessage}>
                    <AlertCircle size={13} />
                    {errors.content}
                  </div>
                ) : (
                  <span style={styles.helperText}>
                    Keep the message clear and easy to
                    understand.
                  </span>
                )}

                <span style={styles.characterHint}>
                  {formData.content.length} characters
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              PREVIEW SUMMARY
          ================================================= */}
          <section style={styles.summaryCard}>
            <div style={styles.summaryHeader}>
              <div style={styles.summaryIcon}>
                <Megaphone size={17} />
              </div>

              <div>
                <div style={styles.sectionEyebrow}>
                  READY TO SEND
                </div>

                <h3 style={styles.summaryTitle}>
                  Announcement summary
                </h3>
              </div>
            </div>

            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>
                  SCOPE
                </span>

                <strong style={styles.summaryValue}>
                  {isProjectScope
                    ? "Project"
                    : "Company-wide"}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>
                  TYPE
                </span>

                <strong style={styles.summaryValue}>
                  {formData.announcement_type}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>
                  PRIORITY
                </span>

                <strong
                  style={{
                    ...styles.summaryValue,
                    color:
                      priorityVisual.color,
                  }}
                >
                  {formData.priority}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>
                  EXPIRY
                </span>

                <strong style={styles.summaryValue}>
                  {formData.expires_at
                    ? "Scheduled"
                    : "No expiry"}
                </strong>
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}
        <div style={styles.footer}>
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <div style={styles.footerActions}>
            {!editingAnnouncement && (
              <Button
                variant="outline"
                size="md"
                onClick={() =>
                  handleSubmit(false)
                }
                disabled={loading}
                className="flex items-center gap-1.5"
              >
                <Save size={16} />
                Save as Draft
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={() =>
                handleSubmit(true)
              }
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <Send size={16} />

              {editingAnnouncement
                ? "Save Changes"
                : "Publish Announcement"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;

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
    backgroundColor: "rgba(23, 37, 31, 0.74)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxSizing: "border-box",
  },

  /* =====================================================
     MODAL
  ===================================================== */

  modal: {
    width: "100%",
    maxWidth: "820px",
    maxHeight: "94vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    border: "1px solid #dce5df",
    borderRadius: "26px",
    boxShadow:
      "0 30px 80px rgba(23, 37, 31, 0.25)",
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
    backgroundColor: "#17251f",
  },

  headerGlowOne: {
    position: "absolute",
    width: "270px",
    height: "270px",
    borderRadius: "50%",
    right: "-110px",
    top: "-150px",
    backgroundColor: "rgba(88, 143, 108, 0.18)",
  },

  headerGlowTwo: {
    position: "absolute",
    width: "200px",
    height: "200px",
    left: "48%",
    bottom: "-160px",
    borderRadius: "50%",
    backgroundColor: "rgba(47, 107, 79, 0.18)",
  },

  headerContent: {
    position: "relative",
    zIndex: 1,
    padding: "1.4rem 1.5rem",
  },

  headerTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
  },

  headerIdentity: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.8rem",
  },

  headerIcon: {
    width: "44px",
    height: "44px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "13px",
    backgroundColor: "#2f6b4f",
    color: "#ffffff",
  },

  headerEyebrow: {
    color: "#a9cbb5",
    fontSize: "0.64rem",
    fontWeight: "800",
    letterSpacing: "0.11em",
    marginBottom: "0.2rem",
  },

  headerTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "1.25rem",
    lineHeight: 1.2,
    fontWeight: "800",
    letterSpacing: "-0.02em",
  },

  headerSubtitle: {
    margin: "0.35rem 0 0",
    color: "#a8bcb0",
    fontSize: "0.74rem",
    lineHeight: 1.45,
  },

  closeButton: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    border:
      "1px solid rgba(255, 255, 255, 0.12)",
    backgroundColor:
      "rgba(255, 255, 255, 0.07)",
    color: "#c3d1c9",
    cursor: "pointer",
  },

  scopeIndicator: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    marginTop: "1rem",
    padding: "0.42rem 0.65rem",
    borderRadius: "999px",
    backgroundColor:
      "rgba(255, 255, 255, 0.07)",
    border:
      "1px solid rgba(255, 255, 255, 0.09)",
    color: "#b7ccbf",
    fontSize: "0.59rem",
    fontWeight: "800",
    letterSpacing: "0.07em",
  },

  scopeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
  },

  /* =====================================================
     BODY
  ===================================================== */

  body: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "1.4rem 1.5rem 1.6rem",
    backgroundColor: "#f7f9f7",
    boxSizing: "border-box",
  },

  /* =====================================================
     PROJECT CARD
  ===================================================== */

  projectCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.8rem",
    marginBottom: "1.2rem",
    padding: "0.95rem",
    backgroundColor: "#eef6f0",
    border: "1px solid #d3e5d9",
    borderRadius: "17px",
  },

  projectCardIcon: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    backgroundColor: "#dcefe3",
    color: "#2f6b4f",
  },

  projectCardContent: {
    minWidth: 0,
  },

  projectCardLabel: {
    color: "#597564",
    fontSize: "0.59rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    marginBottom: "0.25rem",
  },

  projectNameRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.45rem",
  },

  projectName: {
    margin: 0,
    color: "#244d38",
    fontSize: "0.9rem",
    fontWeight: "800",
  },

  projectCode: {
    padding: "0.2rem 0.45rem",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#557060",
    fontSize: "0.61rem",
    fontWeight: "800",
    border: "1px solid #d4e2d8",
  },

  projectDescription: {
    margin: "0.25rem 0 0",
    color: "#65766d",
    fontSize: "0.7rem",
    lineHeight: 1.5,
  },

  /* =====================================================
     SECTIONS
  ===================================================== */

  section: {
    marginBottom: "1.15rem",
    padding: "1.15rem",
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e1",
    borderRadius: "20px",
    boxShadow:
      "0 5px 18px rgba(23, 37, 31, 0.035)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.7rem",
    marginBottom: "1rem",
  },

  sectionNumber: {
    width: "30px",
    height: "30px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9px",
    backgroundColor: "#e8f2ec",
    color: "#2f6b4f",
    fontSize: "0.62rem",
    fontWeight: "900",
  },

  sectionEyebrow: {
    color: "#74847c",
    fontSize: "0.58rem",
    fontWeight: "800",
    letterSpacing: "0.09em",
    marginBottom: "0.15rem",
  },

  sectionTitle: {
    margin: 0,
    color: "#17251f",
    fontSize: "0.95rem",
    fontWeight: "800",
  },

  /* =====================================================
     FIELDS
  ===================================================== */

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    marginBottom: "0.9rem",
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: "0.2rem",
    color: "#405148",
    fontSize: "0.7rem",
    fontWeight: "800",
  },

  required: {
    color: "#b34b4b",
  },

  input: {
    width: "100%",
    height: "46px",
    boxSizing: "border-box",
    padding: "0 0.9rem",
    borderRadius: "12px",
    border: "1px solid #d4dfd8",
    backgroundColor: "#fbfcfb",
    color: "#17251f",
    fontSize: "0.82rem",
    outline: "none",
  },

  inputError: {
    borderColor: "#d76b6b",
    backgroundColor: "#fffafa",
  },

  selectWrapper: {
    position: "relative",
  },

  inputIcon: {
    position: "absolute",
    left: "0.85rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#718078",
    pointerEvents: "none",
  },

  select: {
    width: "100%",
    height: "46px",
    boxSizing: "border-box",
    padding: "0 0.85rem 0 2.55rem",
    borderRadius: "12px",
    border: "1px solid #d4dfd8",
    backgroundColor: "#fbfcfb",
    color: "#17251f",
    fontSize: "0.82rem",
    outline: "none",
  },

  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    color: "#a33a3a",
    fontSize: "0.68rem",
    fontWeight: "600",
  },

  /* =====================================================
     PRIORITY
  ===================================================== */

  priorityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "0.65rem",
  },

  priorityOption: {
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    minWidth: 0,
    padding: "0.8rem",
    textAlign: "left",
    border: "1px solid #dce5df",
    borderRadius: "15px",
    backgroundColor: "#fbfcfb",
    cursor: "pointer",
  },

  priorityIcon: {
    width: "32px",
    height: "32px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
  },

  priorityContent: {
    minWidth: 0,
    flex: 1,
    paddingRight: "0.7rem",
  },

  priorityName: {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: "800",
    marginBottom: "0.15rem",
  },

  priorityDescription: {
    display: "block",
    color: "#7b8982",
    fontSize: "0.61rem",
    lineHeight: 1.4,
  },

  radio: {
    position: "absolute",
    top: "0.75rem",
    right: "0.7rem",
    width: "15px",
    height: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: "1.5px solid #cbd7cf",
    backgroundColor: "#ffffff",
  },

  radioDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
  },

  /* =====================================================
     EXPIRY
  ===================================================== */

  expiryCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.8rem",
    padding: "0.9rem",
    borderRadius: "15px",
    backgroundColor: "#f7faf8",
    border: "1px solid #e1e9e4",
  },

  expiryIcon: {
    width: "35px",
    height: "35px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#e8f2ec",
    color: "#2f6b4f",
  },

  expiryContent: {
    flex: 1,
    minWidth: 0,
  },

  helperText: {
    margin: "0 0 0.55rem",
    color: "#7b8982",
    fontSize: "0.67rem",
    lineHeight: 1.5,
  },

  dateWrapper: {
    position: "relative",
  },

  dateIcon: {
    position: "absolute",
    left: "0.8rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#718078",
    pointerEvents: "none",
  },

  dateInput: {
    width: "100%",
    height: "44px",
    boxSizing: "border-box",
    padding: "0 0.75rem 0 2.4rem",
    borderRadius: "11px",
    border: "1px solid #d4dfd8",
    backgroundColor: "#ffffff",
    color: "#17251f",
    fontSize: "0.78rem",
    outline: "none",
  },

  /* =====================================================
     MESSAGE
  ===================================================== */

  textarea: {
    width: "100%",
    minHeight: "160px",
    boxSizing: "border-box",
    padding: "0.85rem",
    resize: "vertical",
    borderRadius: "13px",
    border: "1px solid #d4dfd8",
    backgroundColor: "#fbfcfb",
    color: "#17251f",
    fontSize: "0.82rem",
    lineHeight: 1.6,
    outline: "none",
    fontFamily: "inherit",
  },

  textareaFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },

  characterHint: {
    color: "#8a9790",
    fontSize: "0.63rem",
    whiteSpace: "nowrap",
  },

  /* =====================================================
     SUMMARY
  ===================================================== */

  summaryCard: {
    padding: "1rem",
    marginBottom: "0.15rem",
    borderRadius: "18px",
    backgroundColor: "#17251f",
    border: "1px solid #263a31",
  },

  summaryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    marginBottom: "1rem",
  },

  summaryIcon: {
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#2f6b4f",
    color: "#ffffff",
  },

  summaryTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "0.9rem",
    fontWeight: "800",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "0.55rem",
  },

  summaryItem: {
    minWidth: 0,
    padding: "0.65rem",
    borderRadius: "11px",
    backgroundColor:
      "rgba(255, 255, 255, 0.06)",
    border:
      "1px solid rgba(255, 255, 255, 0.08)",
  },

  summaryLabel: {
    display: "block",
    color: "#8fa89a",
    fontSize: "0.55rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    marginBottom: "0.22rem",
  },

  summaryValue: {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#e1ebe5",
    fontSize: "0.7rem",
    fontWeight: "800",
  },

  /* =====================================================
     FOOTER
  ===================================================== */

  footer: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    padding: "0.85rem 1rem",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #dfe7e1",
    flexWrap: "wrap",
  },

  footerActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "0.55rem",
    flexWrap: "wrap",
  },
};