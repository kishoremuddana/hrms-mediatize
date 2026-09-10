import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  Upload,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FolderKanban,
  ClipboardList,
  AlertTriangle,
  Paperclip,
  X,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  showSuccess,
  showError,
  showWarning,
} from "../../shared/utils/toast";
import {
  getMyAssignedProjects,
  submitWorkReport,
} from "../services/workReportApi";

function SubmitWorkReport() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Form State
  const [projectId, setProjectId] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [problemsFaced, setProblemsFaced] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ---------------------------------------------------------
  // Today's date
  // ---------------------------------------------------------
  const todayFormatted = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ---------------------------------------------------------
  // Load assigned projects
  // ---------------------------------------------------------
  useEffect(() => {
    async function fetchAssignedProjects() {
      setLoadingProjects(true);

      try {
        const res = await getMyAssignedProjects();

        setProjects(res.data || []);

        if (res.data && res.data.length > 0) {
          setProjectId(String(res.data[0].project_id));
        }
      } catch (err) {
        console.error("Failed to fetch assigned projects", err);
        showError("Failed to load assigned projects.");
      } finally {
        setLoadingProjects(false);
      }
    }

    fetchAssignedProjects();
  }, []);

  // ---------------------------------------------------------
  // File validation
  // ---------------------------------------------------------
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // 5 MB validation
    if (selectedFile.size > 5 * 1024 * 1024) {
      showWarning(
        "File size exceeds 5 MB limit. Please select a smaller file."
      );

      e.target.value = "";
      setFile(null);
      return;
    }

    // Extension validation
    const ext = selectedFile.name
      .split(".")
      .pop()
      ?.toLowerCase();

    const allowedExts = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "png",
      "jpg",
      "jpeg",
    ];

    if (!ext || !allowedExts.includes(ext)) {
      showWarning(
        "Invalid file type. Allowed formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG, JPEG."
      );

      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // ---------------------------------------------------------
  // Remove selected file
  // ---------------------------------------------------------
  const removeFile = () => {
    setFile(null);

    const input = document.getElementById("work-report-file");

    if (input) {
      input.value = "";
    }
  };

  // ---------------------------------------------------------
  // Submit work report
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      showWarning("Please select a project.");
      return;
    }

    if (!workDescription || !workDescription.trim()) {
      showWarning(
        "Work description cannot be empty or whitespace only."
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("project_id", projectId);
      formData.append(
        "work_description",
        workDescription.trim()
      );

      if (problemsFaced && problemsFaced.trim()) {
        formData.append(
          "problems_faced",
          problemsFaced.trim()
        );
      }

      if (file) {
        formData.append("document", file);
      }

      await submitWorkReport(formData);

      showSuccess("Work report submitted successfully!");

      navigate("/employee/work-reports");
    } catch (err) {
      console.error("Failed to submit work report", err);

      const errText =
        err.response?.data?.detail ||
        "Failed to submit work report.";

      showError(errText);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // Selected project
  // ---------------------------------------------------------
  const selectedProject = projects.find(
    (project) =>
      String(project.project_id) === String(projectId)
  );

  return (
    <AppLayout title="Submit Daily Work Report">
      <div style={styles.page}>
        {/* =====================================================
            TOP NAVIGATION
        ====================================================== */}
        <div style={styles.topBar}>
          <BackToDashboard
            to="/employee/dashboard"
            role="EMPLOYEE"
            icon={ArrowLeft}
          />

          <Link
            to="/employee/work-reports"
            style={styles.historyButton}
          >
            <FileText size={15} />
            My Reports History
          </Link>
        </div>

        {/* =====================================================
            HERO
        ====================================================== */}
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.heroEyebrow}>
              <ClipboardList size={14} />
              DAILY WORK UPDATE
            </div>

            <h1 style={styles.heroTitle}>
              Submit Daily Work Report
            </h1>

            <p style={styles.heroDescription}>
              Record what you accomplished today, mention any
              blockers, and attach supporting documents when
              required.
            </p>

            <div style={styles.heroMeta}>
              <div style={styles.heroMetaItem}>
                <Calendar size={14} />
                {todayFormatted}
              </div>

              <div style={styles.heroMetaDivider}>•</div>

              <div style={styles.heroMetaItem}>
                <FolderKanban size={14} />
                Employee Report
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.heroCheck}>
              <CheckCircle2 size={28} />
            </div>

            <div>
              <div style={styles.heroRightLabel}>
                REPORT STATUS
              </div>

              <div style={styles.heroRightValue}>
                Draft
              </div>

              <div style={styles.heroRightText}>
                Complete the form below
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}
        <div style={styles.contentGrid}>
          {/* ===================================================
              LEFT INFORMATION PANEL
          ==================================================== */}
          <aside style={styles.infoPanel}>
            <div style={styles.infoPanelHeader}>
              <div style={styles.infoIcon}>
                <ClipboardList size={18} />
              </div>

              <div>
                <div style={styles.infoEyebrow}>
                  REPORT GUIDE
                </div>

                <h2 style={styles.infoTitle}>
                  What to include
                </h2>
              </div>
            </div>

            <div style={styles.guideList}>
              <div style={styles.guideItem}>
                <div style={styles.guideNumber}>01</div>

                <div>
                  <strong style={styles.guideTitle}>
                    Select your project
                  </strong>

                  <p style={styles.guideText}>
                    Choose one of your currently assigned
                    projects.
                  </p>
                </div>
              </div>

              <div style={styles.guideItem}>
                <div style={styles.guideNumber}>02</div>

                <div>
                  <strong style={styles.guideTitle}>
                    Describe today's work
                  </strong>

                  <p style={styles.guideText}>
                    Mention tasks completed, implementations,
                    progress, or deliverables.
                  </p>
                </div>
              </div>

              <div style={styles.guideItem}>
                <div style={styles.guideNumber}>03</div>

                <div>
                  <strong style={styles.guideTitle}>
                    Mention blockers
                  </strong>

                  <p style={styles.guideText}>
                    Add technical issues, dependencies, or
                    challenges if you faced any.
                  </p>
                </div>
              </div>

              <div style={styles.guideItem}>
                <div style={styles.guideNumber}>04</div>

                <div>
                  <strong style={styles.guideTitle}>
                    Add supporting files
                  </strong>

                  <p style={styles.guideText}>
                    Upload a relevant document or image when
                    needed.
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.infoNote}>
              <AlertTriangle size={15} />

              <div>
                <strong style={styles.infoNoteTitle}>
                  Keep it specific
                </strong>

                <p style={styles.infoNoteText}>
                  A clear report helps HR and project managers
                  understand your actual daily progress.
                </p>
              </div>
            </div>
          </aside>

          {/* ===================================================
              FORM
          ==================================================== */}
          <main style={styles.formCard}>
            <div style={styles.formHeader}>
              <div>
                <div style={styles.formEyebrow}>
                  WORK REPORT FORM
                </div>

                <h2 style={styles.formTitle}>
                  Today's Contribution
                </h2>

                <p style={styles.formSubtitle}>
                  Fill in the details below before submitting
                  your report.
                </p>
              </div>

              <div style={styles.requiredLegend}>
                <span style={styles.requiredDot}>*</span>
                Required
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* =================================================
                  DATE
              ================================================== */}
              <section style={styles.formSection}>
                <div style={styles.fieldHeading}>
                  <div style={styles.fieldHeadingIcon}>
                    <Calendar size={15} />
                  </div>

                  <div>
                    <h3 style={styles.fieldTitle}>
                      Report Date
                    </h3>

                    <p style={styles.fieldDescription}>
                      Automatically generated for today's
                      report.
                    </p>
                  </div>
                </div>

                <div style={styles.dateBox}>
                  <div style={styles.dateBoxLeft}>
                    <Calendar size={18} />

                    <div>
                      <div style={styles.dateValue}>
                        {todayFormatted}
                      </div>

                      <div style={styles.dateSubtext}>
                        Current report date
                      </div>
                    </div>
                  </div>

                  <span style={styles.serverBadge}>
                    Server Date
                  </span>
                </div>
              </section>

              {/* =================================================
                  PROJECT
              ================================================== */}
              <section style={styles.formSection}>
                <div style={styles.fieldHeading}>
                  <div style={styles.fieldHeadingIcon}>
                    <FolderKanban size={15} />
                  </div>

                  <div>
                    <h3 style={styles.fieldTitle}>
                      Assigned Project
                      <span style={styles.required}> *</span>
                    </h3>

                    <p style={styles.fieldDescription}>
                      Select the project related to today's
                      work.
                    </p>
                  </div>
                </div>

                {loadingProjects ? (
                  <div style={styles.loadingProject}>
                    <div style={styles.loadingSpinner} />
                    Loading assigned projects...
                  </div>
                ) : projects.length === 0 ? (
                  <div style={styles.noProjectAlert}>
                    <div style={styles.noProjectIcon}>
                      <AlertCircle size={18} />
                    </div>

                    <div>
                      <strong style={styles.alertTitle}>
                        No active project assignments
                      </strong>

                      <p style={styles.alertText}>
                        You currently have no active project
                        assignments. You can only submit work
                        reports for projects assigned to you.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={styles.selectContainer}>
                      <FolderKanban
                        size={17}
                        style={styles.selectIcon}
                      />

                      <select
                        style={styles.select}
                        value={projectId}
                        onChange={(e) =>
                          setProjectId(e.target.value)
                        }
                        required
                      >
                        {projects.map((project) => (
                          <option
                            key={project.project_id}
                            value={project.project_id}
                          >
                            {project.project_name} (
                            {project.project_code}) •{" "}
                            {project.role_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProject && (
                      <div style={styles.projectPreview}>
                        <div style={styles.projectPreviewIcon}>
                          <FolderKanban size={16} />
                        </div>

                        <div>
                          <div
                            style={
                              styles.projectPreviewName
                            }
                          >
                            {selectedProject.project_name}
                          </div>

                          <div
                            style={
                              styles.projectPreviewMeta
                            }
                          >
                            {selectedProject.project_code}{" "}
                            • {selectedProject.role_name}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* =================================================
                  WORK DESCRIPTION
              ================================================== */}
              <section style={styles.formSection}>
                <div style={styles.fieldHeading}>
                  <div style={styles.fieldHeadingIcon}>
                    <FileText size={15} />
                  </div>

                  <div>
                    <h3 style={styles.fieldTitle}>
                      Work Description
                      <span style={styles.required}> *</span>
                    </h3>

                    <p style={styles.fieldDescription}>
                      Describe the tasks, implementation, and
                      progress completed today.
                    </p>
                  </div>
                </div>

                <textarea
                  style={styles.textarea}
                  rows={7}
                  placeholder="Example: Implemented the employee project filtering API, updated the work report UI, tested project selection, and fixed validation issues..."
                  value={workDescription}
                  onChange={(e) =>
                    setWorkDescription(e.target.value)
                  }
                  required
                />

                <div style={styles.textareaFooter}>
                  <span style={styles.helperText}>
                    Be clear and specific about your
                    contribution.
                  </span>

                  <span style={styles.characterHint}>
                    {workDescription.length} characters
                  </span>
                </div>
              </section>

              {/* =================================================
                  PROBLEMS FACED
              ================================================== */}
              <section style={styles.formSection}>
                <div style={styles.fieldHeading}>
                  <div
                    style={{
                      ...styles.fieldHeadingIcon,
                      background: "#fff5df",
                      color: "#80611e",
                    }}
                  >
                    <AlertTriangle size={15} />
                  </div>

                  <div>
                    <h3 style={styles.fieldTitle}>
                      Problems Faced
                      <span style={styles.optional}>
                        Optional
                      </span>
                    </h3>

                    <p style={styles.fieldDescription}>
                      Mention blockers, dependencies, or
                      technical challenges.
                    </p>
                  </div>
                </div>

                <textarea
                  style={{
                    ...styles.textarea,
                    minHeight: "100px",
                  }}
                  rows={4}
                  placeholder="Example: Waiting for API access from another team, encountered an integration issue, or leave empty if there were no blockers..."
                  value={problemsFaced}
                  onChange={(e) =>
                    setProblemsFaced(e.target.value)
                  }
                />
              </section>

              {/* =================================================
                  FILE UPLOAD
              ================================================== */}
              <section style={styles.formSection}>
                <div style={styles.fieldHeading}>
                  <div style={styles.fieldHeadingIcon}>
                    <Paperclip size={15} />
                  </div>

                  <div>
                    <h3 style={styles.fieldTitle}>
                      Supporting Document
                      <span style={styles.optional}>
                        Optional
                      </span>
                    </h3>

                    <p style={styles.fieldDescription}>
                      Attach a relevant document, screenshot,
                      spreadsheet, or presentation.
                    </p>
                  </div>
                </div>

                {!file ? (
                  <div style={styles.uploadArea}>
                    <input
                      type="file"
                      id="work-report-file"
                      style={styles.fileInput}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                    />

                    <label
                      htmlFor="work-report-file"
                      style={styles.uploadContent}
                    >
                      <div style={styles.uploadIcon}>
                        <Upload size={21} />
                      </div>

                      <div style={styles.uploadTitle}>
                        Choose a supporting file
                      </div>

                      <div style={styles.uploadSubtitle}>
                        PDF, DOC, DOCX, XLS, XLSX, PPT,
                        PPTX, PNG, JPG, JPEG
                      </div>

                      <span style={styles.uploadButton}>
                        Browse Files
                      </span>

                      <div style={styles.uploadLimit}>
                        Maximum file size: 5 MB
                      </div>
                    </label>
                  </div>
                ) : (
                  <div style={styles.selectedFile}>
                    <div style={styles.selectedFileIcon}>
                      <FileText size={19} />
                    </div>

                    <div style={styles.selectedFileInfo}>
                      <div style={styles.selectedFileName}>
                        {file.name}
                      </div>

                      <div style={styles.selectedFileMeta}>
                        {(file.size / (1024 * 1024)).toFixed(
                          2
                        )}{" "}
                        MB • File selected
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      style={styles.removeFileButton}
                      aria-label="Remove selected file"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </section>

              {/* =================================================
                  FORM ACTIONS
              ================================================== */}
              <div style={styles.actions}>
                <Link
                  to="/employee/work-reports"
                  style={styles.cancelButton}
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  style={{
                    ...styles.submitButton,
                    opacity:
                      submitting || projects.length === 0
                        ? 0.6
                        : 1,
                    cursor:
                      submitting || projects.length === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                  disabled={
                    submitting || projects.length === 0
                  }
                >
                  {submitting ? (
                    <>
                      <span style={styles.buttonSpinner} />
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Submit Work Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>

      {/* =======================================================
          RESPONSIVE STYLES
      ======================================================== */}
      <style>
        {`
          @keyframes submitReportSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {
            .submit-work-report-content {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 700px) {
            .submit-work-report-hero {
              flex-direction: column;
              align-items: flex-start;
            }

            .submit-work-report-hero-side {
              width: 100%;
              box-sizing: border-box;
            }

            .submit-work-report-actions {
              flex-direction: column-reverse;
            }

            .submit-work-report-actions a,
            .submit-work-report-actions button {
              width: 100%;
              box-sizing: border-box;
              justify-content: center;
            }
          }

          @media (max-width: 500px) {
            .submit-work-report-hero {
              padding: 20px;
            }

            .submit-work-report-form {
              padding: 16px;
            }

            .submit-work-report-top {
              align-items: flex-start;
            }
          }
        `}
      </style>
    </AppLayout>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = {
  page: {
    padding: "0 0 40px",
    color: "#20352a",
  },

  // -----------------------------------------------------------
  // Top bar
  // -----------------------------------------------------------

  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  historyButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    height: "37px",
    padding: "0 12px",
    borderRadius: "9px",
    border: "1px solid #d5e2da",
    background: "#ffffff",
    color: "#315c46",
    fontSize: "10px",
    fontWeight: "800",
    textDecoration: "none",
  },

  // -----------------------------------------------------------
  // Hero
  // -----------------------------------------------------------

  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    padding: "27px 29px",
    marginBottom: "16px",
    borderRadius: "17px",
    background:
      "linear-gradient(135deg, #124d31 0%, #236c47 100%)",
    boxShadow: "0 12px 28px rgba(18, 77, 49, 0.14)",
  },

  heroLeft: {
    flex: 1,
    minWidth: 0,
  },

  heroEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#d8eddf",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.13em",
    marginBottom: "8px",
  },

  heroTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "clamp(1.65rem, 3vw, 2.25rem)",
    fontWeight: "800",
    lineHeight: 1.15,
    letterSpacing: "-0.025em",
  },

  heroDescription: {
    maxWidth: "700px",
    margin: "9px 0 0",
    color: "#d2e6da",
    fontSize: "12px",
    lineHeight: 1.65,
  },

  heroMeta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "15px",
  },

  heroMetaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    color: "#e0eee5",
    fontSize: "9px",
    fontWeight: "700",
  },

  heroMetaDivider: {
    color: "#83b698",
    fontSize: "9px",
  },

  heroRight: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: "180px",
    padding: "14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.15)",
  },

  heroCheck: {
    width: "45px",
    height: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    flexShrink: 0,
  },

  heroRightLabel: {
    color: "#a8cdb6",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.1em",
  },

  heroRightValue: {
    marginTop: "2px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "800",
  },

  heroRightText: {
    marginTop: "1px",
    color: "#c3ddcd",
    fontSize: "8px",
  },

  // -----------------------------------------------------------
  // Content
  // -----------------------------------------------------------

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(230px, 0.7fr) minmax(0, 1.8fr)",
    gap: "15px",
    alignItems: "start",
  },

  // -----------------------------------------------------------
  // Information panel
  // -----------------------------------------------------------

  infoPanel: {
    background: "#f4f9f6",
    border: "1px solid #dce8df",
    borderRadius: "15px",
    padding: "18px",
  },

  infoPanelHeader: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    paddingBottom: "15px",
    borderBottom: "1px solid #dce8df",
  },

  infoIcon: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    background: "#dceee3",
    color: "#17613d",
    flexShrink: 0,
  },

  infoEyebrow: {
    color: "#397254",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "3px",
  },

  infoTitle: {
    margin: 0,
    color: "#24382d",
    fontSize: "14px",
    fontWeight: "800",
  },

  guideList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    padding: "17px 0",
  },

  guideItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
  },

  guideNumber: {
    width: "25px",
    height: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "7px",
    background: "#ffffff",
    border: "1px solid #cfe0d5",
    color: "#397254",
    fontSize: "8px",
    fontWeight: "800",
    flexShrink: 0,
  },

  guideTitle: {
    display: "block",
    color: "#30463a",
    fontSize: "10px",
    fontWeight: "800",
  },

  guideText: {
    margin: "3px 0 0",
    color: "#75837b",
    fontSize: "9px",
    lineHeight: 1.55,
  },

  infoNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "11px",
    borderRadius: "9px",
    background: "#fff8e8",
    border: "1px solid #ead9aa",
    color: "#80611e",
  },

  infoNoteTitle: {
    display: "block",
    fontSize: "9px",
    fontWeight: "800",
  },

  infoNoteText: {
    margin: "3px 0 0",
    fontSize: "8px",
    lineHeight: 1.5,
    color: "#80611e",
  },

  // -----------------------------------------------------------
  // Form Card
  // -----------------------------------------------------------

  formCard: {
    background: "#ffffff",
    border: "1px solid #dfe9e2",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(18, 77, 49, 0.04)",
  },

  formHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    padding: "19px 21px",
    background: "#f7faf8",
    borderBottom: "1px solid #dfe9e2",
  },

  formEyebrow: {
    color: "#397254",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "4px",
  },

  formTitle: {
    margin: 0,
    color: "#22372b",
    fontSize: "17px",
    fontWeight: "800",
  },

  formSubtitle: {
    margin: "4px 0 0",
    color: "#7b8981",
    fontSize: "10px",
  },

  requiredLegend: {
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    padding: "5px 8px",
    borderRadius: "7px",
    background: "#ffffff",
    border: "1px solid #dce7df",
    color: "#7b8981",
    fontSize: "8px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  requiredDot: {
    color: "#b54b42",
    fontWeight: "900",
  },

  formSection: {
    padding: "19px 21px",
    borderBottom: "1px solid #edf2ee",
  },

  fieldHeading: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    marginBottom: "11px",
  },

  fieldHeadingIcon: {
    width: "31px",
    height: "31px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background: "#eaf4ed",
    color: "#347452",
    flexShrink: 0,
  },

  fieldTitle: {
    margin: 0,
    color: "#2a3e33",
    fontSize: "11px",
    fontWeight: "800",
  },

  fieldDescription: {
    margin: "3px 0 0",
    color: "#89958e",
    fontSize: "9px",
    lineHeight: 1.45,
  },

  required: {
    color: "#b54b42",
  },

  optional: {
    display: "inline-block",
    marginLeft: "6px",
    padding: "3px 5px",
    borderRadius: "5px",
    background: "#f1f4f2",
    color: "#7d8983",
    fontSize: "7px",
    fontWeight: "700",
    verticalAlign: "middle",
  },

  // -----------------------------------------------------------
  // Date
  // -----------------------------------------------------------

  dateBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: "11px 12px",
    borderRadius: "9px",
    background: "#f6faf7",
    border: "1px solid #dbe7df",
  },

  dateBoxLeft: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#347452",
  },

  dateValue: {
    color: "#2b4035",
    fontSize: "11px",
    fontWeight: "800",
  },

  dateSubtext: {
    marginTop: "2px",
    color: "#8b9690",
    fontSize: "8px",
  },

  serverBadge: {
    padding: "4px 7px",
    borderRadius: "6px",
    background: "#ffffff",
    border: "1px solid #d5e1d9",
    color: "#6e7d75",
    fontSize: "7px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  // -----------------------------------------------------------
  // Project
  // -----------------------------------------------------------

  selectContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  selectIcon: {
    position: "absolute",
    left: "11px",
    color: "#397254",
    pointerEvents: "none",
    zIndex: 1,
  },

  select: {
    width: "100%",
    height: "42px",
    boxSizing: "border-box",
    padding: "0 12px 0 35px",
    border: "1px solid #d1dfd7",
    borderRadius: "9px",
    background: "#fbfdfc",
    color: "#2d4237",
    fontSize: "10px",
    outline: "none",
  },

  loadingProject: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "42px",
    padding: "0 12px",
    boxSizing: "border-box",
    borderRadius: "9px",
    background: "#f7faf8",
    border: "1px solid #dce7df",
    color: "#78867e",
    fontSize: "9px",
  },

  loadingSpinner: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    border: "2px solid #cfe0d5",
    borderTopColor: "#17613d",
    animation:
      "submitReportSpin 0.8s linear infinite",
  },

  noProjectAlert: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    padding: "11px",
    borderRadius: "9px",
    background: "#fff8e8",
    border: "1px solid #ead9aa",
  },

  noProjectIcon: {
    color: "#80611e",
    flexShrink: 0,
  },

  alertTitle: {
    display: "block",
    color: "#70551d",
    fontSize: "9px",
    fontWeight: "800",
  },

  alertText: {
    margin: "3px 0 0",
    color: "#80611e",
    fontSize: "8px",
    lineHeight: 1.5,
  },

  projectPreview: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
    padding: "9px",
    borderRadius: "8px",
    background: "#f5faf7",
    border: "1px solid #dce9e0",
  },

  projectPreviewIcon: {
    width: "29px",
    height: "29px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "7px",
    background: "#e2f0e7",
    color: "#347452",
    flexShrink: 0,
  },

  projectPreviewName: {
    color: "#2c4336",
    fontSize: "9px",
    fontWeight: "800",
  },

  projectPreviewMeta: {
    marginTop: "2px",
    color: "#849089",
    fontSize: "7px",
  },

  // -----------------------------------------------------------
  // Textareas
  // -----------------------------------------------------------

  textarea: {
    width: "100%",
    minHeight: "125px",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d1dfd7",
    borderRadius: "9px",
    background: "#fbfdfc",
    color: "#30443a",
    fontSize: "10px",
    lineHeight: 1.6,
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
  },

  textareaFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "5px",
  },

  helperText: {
    color: "#89958e",
    fontSize: "8px",
  },

  characterHint: {
    color: "#9aa59f",
    fontSize: "8px",
  },

  // -----------------------------------------------------------
  // File upload
  // -----------------------------------------------------------

  uploadArea: {
    position: "relative",
    minHeight: "150px",
    borderRadius: "11px",
    border: "1px dashed #b9cfc1",
    background: "#f8fbf9",
    overflow: "hidden",
  },

  fileInput: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
    zIndex: 2,
  },

  uploadContent: {
    minHeight: "150px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    cursor: "pointer",
    padding: "18px",
    boxSizing: "border-box",
  },

  uploadIcon: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    background: "#e4f1e8",
    color: "#347452",
    marginBottom: "7px",
  },

  uploadTitle: {
    color: "#315443",
    fontSize: "10px",
    fontWeight: "800",
  },

  uploadSubtitle: {
    maxWidth: "400px",
    marginTop: "3px",
    color: "#89958e",
    fontSize: "8px",
    lineHeight: 1.5,
  },

  uploadButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "9px",
    padding: "6px 10px",
    borderRadius: "7px",
    background: "#17613d",
    color: "#ffffff",
    fontSize: "8px",
    fontWeight: "800",
  },

  uploadLimit: {
    marginTop: "6px",
    color: "#9aa59f",
    fontSize: "7px",
  },

  selectedFile: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "11px",
    borderRadius: "10px",
    background: "#f5faf7",
    border: "1px solid #cfe0d5",
  },

  selectedFileIcon: {
    width: "37px",
    height: "37px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9px",
    background: "#e0f0e6",
    color: "#17613d",
    flexShrink: 0,
  },

  selectedFileInfo: {
    flex: 1,
    minWidth: 0,
  },

  selectedFileName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#2d4237",
    fontSize: "10px",
    fontWeight: "800",
  },

  selectedFileMeta: {
    marginTop: "3px",
    color: "#849089",
    fontSize: "8px",
  },

  removeFileButton: {
    width: "31px",
    height: "31px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid #dfd0ce",
    borderRadius: "8px",
    background: "#fffafa",
    color: "#a65a52",
    cursor: "pointer",
  },

  // -----------------------------------------------------------
  // Actions
  // -----------------------------------------------------------

  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
    padding: "15px 21px",
    background: "#f7faf8",
    borderTop: "1px solid #dfe9e2",
  },

  cancelButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "37px",
    boxSizing: "border-box",
    padding: "0 13px",
    borderRadius: "8px",
    border: "1px solid #d4e0d8",
    background: "#ffffff",
    color: "#617169",
    fontSize: "9px",
    fontWeight: "800",
    textDecoration: "none",
  },

  submitButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    height: "37px",
    boxSizing: "border-box",
    padding: "0 14px",
    borderRadius: "8px",
    border: "1px solid #17613d",
    background: "#17613d",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: "800",
    boxShadow: "0 5px 12px rgba(23, 97, 61, 0.15)",
  },

  buttonSpinner: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#ffffff",
    animation:
      "submitReportSpin 0.8s linear infinite",
  },
};

export default SubmitWorkReport;