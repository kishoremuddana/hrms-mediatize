import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Send,
  Upload,
  ShieldCheck,
  ClipboardList,
  CheckCircle,
  Info,
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
  getActiveComplaintCategories,
  submitComplaint,
} from "../services/complaintApi";

function SubmitComplaint() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [categoryId, setCategoryId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // LOAD ACTIVE COMPLAINT CATEGORIES
  // =========================================================

  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true);

      try {
        const res = await getActiveComplaintCategories();

        setCategories(res.data || []);

        if (res.data && res.data.length > 0) {
          setCategoryId(String(res.data[0].id));
        }
      } catch (err) {
        console.error("Failed to fetch complaint categories", err);
        showError("Failed to load complaint categories.");
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  // =========================================================
  // FILE CHANGE
  // =========================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate size (5 MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      showWarning(
        "File size exceeds 5 MB limit. Please select a smaller file."
      );

      e.target.value = "";
      setFile(null);
      return;
    }

    // Validate extension
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

  // =========================================================
  // REMOVE FILE
  // =========================================================

  const removeFile = () => {
    setFile(null);

    const input = document.getElementById("complaint-file");

    if (input) {
      input.value = "";
    }
  };

  // =========================================================
  // SUBMIT COMPLAINT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId) {
      showWarning("Please select a complaint category.");
      return;
    }

    if (!subject || subject.trim().length < 3) {
      showWarning("Subject must be at least 3 characters long.");
      return;
    }

    if (!description || description.trim().length < 10) {
      showWarning("Description must be at least 10 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("category_id", categoryId);
      formData.append("subject", subject.trim());
      formData.append("description", description.trim());
      formData.append("priority", priority);

      if (file) {
        formData.append("attachment", file);
      }

      await submitComplaint(formData);

      showSuccess(
        "Complaint submitted successfully! HR has been notified."
      );

      navigate("/employee/complaints");
    } catch (err) {
      console.error("Failed to submit complaint", err);

      const errText =
        err.response?.data?.detail ||
        "Failed to submit complaint.";

      showError(errText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Submit Workplace Complaint">
      <div style={styles.container}>
        {/* =====================================================
            BACK NAVIGATION
        ====================================================== */}

        <BackToDashboard
          to="/employee/dashboard"
          role="EMPLOYEE"
          icon={ArrowLeft}
        />

        {/* =====================================================
            HERO
        ====================================================== */}

        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.eyebrow}>
              <span style={styles.eyebrowLine} />
              EMPLOYEE SELF SERVICE
            </div>

            <h1 style={styles.heroTitle}>
              Submit Workplace Complaint
            </h1>

            <p style={styles.heroDescription}>
              Report workplace grievances, policy concerns, facilities
              issues, or HR inquiries securely through the HRMS.
            </p>
          </div>

          <Link
            to="/employee/complaints"
            style={styles.historyButton}
          >
            <FileText size={16} />
            My Complaints
          </Link>
        </section>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div style={styles.contentGrid}>
          {/* ===================================================
              FORM CARD
          ==================================================== */}

          <section style={styles.formCard}>
            <div style={styles.formHeader}>
              <div style={styles.formHeaderIcon}>
                <ClipboardList size={20} />
              </div>

              <div>
                <div style={styles.sectionEyebrow}>
                  COMPLAINT FORM
                </div>

                <h2 style={styles.formTitle}>
                  Complaint Information
                </h2>

                <p style={styles.formSubtitle}>
                  Provide accurate information so HR can review your
                  complaint effectively.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* ===============================================
                  01 - CATEGORY
              ================================================ */}

              <div style={styles.formSection}>
                <div style={styles.sectionNumber}>01</div>

                <div style={styles.formSectionContent}>
                  <label style={styles.label}>
                    Complaint Category
                    <span style={styles.required}>*</span>
                  </label>

                  {loadingCategories ? (
                    <div style={styles.loadingBox}>
                      <div style={styles.smallSpinner} />
                      Loading active categories...
                    </div>
                  ) : categories.length === 0 ? (
                    <div style={styles.alertBox}>
                      <AlertCircle
                        size={18}
                        style={{ flexShrink: 0 }}
                      />

                      <span>
                        No active complaint categories are currently
                        available. Please contact HR administration.
                      </span>
                    </div>
                  ) : (
                    <>
                      <select
                        style={styles.input}
                        value={categoryId}
                        onChange={(e) =>
                          setCategoryId(e.target.value)
                        }
                        required
                      >
                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                            {category.description
                              ? ` — ${category.description}`
                              : ""}
                          </option>
                        ))}
                      </select>

                      <span style={styles.helpText}>
                        Select the category that best describes your
                        complaint.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* ===============================================
                  02 - PRIORITY
              ================================================ */}

              <div style={styles.formSection}>
                <div style={styles.sectionNumber}>02</div>

                <div style={styles.formSectionContent}>
                  <label style={styles.label}>
                    Priority Level
                    <span style={styles.required}>*</span>
                  </label>

                  <div style={styles.priorityGrid}>
                    {/* LOW */}
                    <button
                      type="button"
                      onClick={() => setPriority("LOW")}
                      style={{
                        ...styles.priorityCard,
                        ...(priority === "LOW"
                          ? styles.prioritySelected
                          : {}),
                      }}
                    >
                      <span
                        style={{
                          ...styles.priorityIndicator,
                          backgroundColor: "#64748b",
                        }}
                      />

                      <span style={styles.priorityText}>
                        <strong>Low</strong>
                        <small>General query</small>
                      </span>
                    </button>

                    {/* MEDIUM */}
                    <button
                      type="button"
                      onClick={() => setPriority("MEDIUM")}
                      style={{
                        ...styles.priorityCard,
                        ...(priority === "MEDIUM"
                          ? styles.prioritySelected
                          : {}),
                      }}
                    >
                      <span
                        style={{
                          ...styles.priorityIndicator,
                          backgroundColor: "#a16207",
                        }}
                      />

                      <span style={styles.priorityText}>
                        <strong>Medium</strong>
                        <small>Standard grievance</small>
                      </span>
                    </button>

                    {/* HIGH */}
                    <button
                      type="button"
                      onClick={() => setPriority("HIGH")}
                      style={{
                        ...styles.priorityCard,
                        ...(priority === "HIGH"
                          ? styles.prioritySelected
                          : {}),
                      }}
                    >
                      <span
                        style={{
                          ...styles.priorityIndicator,
                          backgroundColor: "#c2410c",
                        }}
                      />

                      <span style={styles.priorityText}>
                        <strong>High</strong>
                        <small>Significant issue</small>
                      </span>
                    </button>

                    {/* URGENT */}
                    <button
                      type="button"
                      onClick={() => setPriority("URGENT")}
                      style={{
                        ...styles.priorityCard,
                        ...(priority === "URGENT"
                          ? styles.prioritySelectedUrgent
                          : {}),
                      }}
                    >
                      <span
                        style={{
                          ...styles.priorityIndicator,
                          backgroundColor: "#b91c1c",
                        }}
                      />

                      <span style={styles.priorityText}>
                        <strong>Urgent</strong>
                        <small>Immediate attention</small>
                      </span>
                    </button>
                  </div>

                  <span style={styles.helpText}>
                    HR may adjust priority based on policy evaluation.
                  </span>
                </div>
              </div>

              {/* ===============================================
                  03 - SUBJECT
              ================================================ */}

              <div style={styles.formSection}>
                <div style={styles.sectionNumber}>03</div>

                <div style={styles.formSectionContent}>
                  <label style={styles.label}>
                    Subject / Summary
                    <span style={styles.required}>*</span>
                  </label>

                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Briefly describe the complaint..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={255}
                    required
                  />

                  <div style={styles.inputFooter}>
                    <span style={styles.helpText}>
                      Keep the subject short and specific.
                    </span>

                    <span style={styles.characterCount}>
                      {subject.length}/255
                    </span>
                  </div>
                </div>
              </div>

              {/* ===============================================
                  04 - DESCRIPTION
              ================================================ */}

              <div style={styles.formSection}>
                <div style={styles.sectionNumber}>04</div>

                <div style={styles.formSectionContent}>
                  <label style={styles.label}>
                    Detailed Description
                    <span style={styles.required}>*</span>
                  </label>

                  <textarea
                    style={{
                      ...styles.input,
                      ...styles.textarea,
                    }}
                    rows={7}
                    placeholder="Provide a detailed, clear description of the issue, relevant dates, individuals involved, and useful context..."
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    required
                  />

                  <div style={styles.inputFooter}>
                    <span style={styles.helpText}>
                      Minimum 10 characters required.
                    </span>

                    <span style={styles.characterCount}>
                      {description.length} characters
                    </span>
                  </div>
                </div>
              </div>

              {/* ===============================================
                  05 - ATTACHMENT
              ================================================ */}

              <div style={styles.formSection}>
                <div style={styles.sectionNumber}>05</div>

                <div style={styles.formSectionContent}>
                  <label style={styles.label}>
                    Supporting Document
                    <span style={styles.optional}>
                      Optional
                    </span>
                  </label>

                  {!file ? (
                    <div style={styles.uploadBox}>
                      <div style={styles.uploadIcon}>
                        <Upload size={21} />
                      </div>

                      <div style={styles.uploadTitle}>
                        Attach supporting evidence
                      </div>

                      <div style={styles.uploadDescription}>
                        Upload a document or image related to your
                        complaint.
                      </div>

                      <label
                        htmlFor="complaint-file"
                        style={styles.chooseFileButton}
                      >
                        Choose File
                      </label>

                      <input
                        type="file"
                        id="complaint-file"
                        style={styles.fileInput}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                      />

                      <div style={styles.fileHelpText}>
                        PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG,
                        JPG, JPEG · Maximum 5 MB
                      </div>
                    </div>
                  ) : (
                    <div style={styles.selectedFile}>
                      <div style={styles.selectedFileIcon}>
                        <Paperclip size={18} />
                      </div>

                      <div style={styles.selectedFileInfo}>
                        <strong style={styles.selectedFileName}>
                          {file.name}
                        </strong>

                        <span style={styles.selectedFileSize}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={removeFile}
                        style={styles.removeFileButton}
                        aria-label="Remove attachment"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ===============================================
                  FORM ACTIONS
              ================================================ */}

              <div style={styles.formActions}>
                <Link
                  to="/employee/complaints"
                  style={styles.cancelButton}
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  style={{
                    ...styles.submitButton,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting
                      ? "not-allowed"
                      : "pointer",
                  }}
                  disabled={
                    submitting || categories.length === 0
                  }
                >
                  {submitting ? (
                    <>
                      <span style={styles.buttonSpinner} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* ===================================================
              INFORMATION SIDEBAR
          ==================================================== */}

          <aside style={styles.sideColumn}>
            {/* SECURITY */}
            <div style={styles.securityCard}>
              <div style={styles.securityIcon}>
                <ShieldCheck size={21} />
              </div>

              <h3 style={styles.sideTitle}>
                Secure HR Submission
              </h3>

              <p style={styles.sideText}>
                Your complaint is submitted through the HRMS and
                becomes available to the authorized HR team for
                review.
              </p>
            </div>

            {/* BEFORE SUBMIT */}
            <div style={styles.infoCard}>
              <div style={styles.sideEyebrow}>
                <Info size={14} />
                BEFORE YOU SUBMIT
              </div>

              <h3 style={styles.sideTitle}>
                Make your report useful
              </h3>

              <div style={styles.guidelineList}>
                <div style={styles.guideline}>
                  <div style={styles.guidelineIcon}>
                    <CheckCircle size={14} />
                  </div>

                  <div>
                    <strong style={styles.guidelineStrong}>
                      Be specific
                    </strong>

                    <p style={styles.guidelineText}>
                      Clearly explain what happened and what
                      assistance you need.
                    </p>
                  </div>
                </div>

                <div style={styles.guideline}>
                  <div style={styles.guidelineIcon}>
                    <CheckCircle size={14} />
                  </div>

                  <div>
                    <strong style={styles.guidelineStrong}>
                      Include context
                    </strong>

                    <p style={styles.guidelineText}>
                      Add relevant dates, locations, or other
                      useful details.
                    </p>
                  </div>
                </div>

                <div style={styles.guideline}>
                  <div style={styles.guidelineIcon}>
                    <CheckCircle size={14} />
                  </div>

                  <div>
                    <strong style={styles.guidelineStrong}>
                      Attach evidence
                    </strong>

                    <p style={styles.guidelineText}>
                      Include supporting documents when they are
                      relevant to your complaint.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PROCESS */}
            <div style={styles.processCard}>
              <div style={styles.sideEyebrow}>
                <ClipboardList size={14} />
                WHAT HAPPENS NEXT
              </div>

              <div style={styles.processStep}>
                <span style={styles.processNumber}>1</span>

                <div>
                  <strong style={styles.processStrong}>
                    Submit
                  </strong>

                  <p style={styles.processText}>
                    Your complaint is recorded in HRMS.
                  </p>
                </div>
              </div>

              <div style={styles.processLine} />

              <div style={styles.processStep}>
                <span style={styles.processNumber}>2</span>

                <div>
                  <strong style={styles.processStrong}>
                    HR Review
                  </strong>

                  <p style={styles.processText}>
                    HR reviews the complaint and its priority.
                  </p>
                </div>
              </div>

              <div style={styles.processLine} />

              <div style={styles.processStep}>
                <span style={styles.processNumber}>3</span>

                <div>
                  <strong style={styles.processStrong}>
                    Resolution
                  </strong>

                  <p style={styles.processText}>
                    Track updates and resolution from My Complaints.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* =====================================================
            RESPONSIVE CSS
        ====================================================== */}

        <style>
          {`
            .submit-complaint-spin {
              animation: submitComplaintSpin 0.8s linear infinite;
            }

            @keyframes submitComplaintSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }

            @media (max-width: 980px) {
              .submit-complaint-content-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 640px) {
              .submit-complaint-form-section {
                grid-template-columns: 1fr !important;
              }

              .submit-complaint-section-number {
                display: none !important;
              }

              .submit-complaint-hero-actions {
                width: 100%;
              }
            }
          `}
        </style>
      </div>
    </AppLayout>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = {
  // -----------------------------------------------------------
  // Container
  // -----------------------------------------------------------

  container: {
    padding: "0 0 3rem 0",
  },

  // -----------------------------------------------------------
  // Hero
  // -----------------------------------------------------------

  hero: {
    marginTop: "1rem",
    marginBottom: "1.5rem",
    padding: "1.65rem",
    borderRadius: "19px",
    background:
      "linear-gradient(135deg, #123d29 0%, #195c3c 62%, #28734b 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
    boxShadow: "0 14px 35px rgba(18, 61, 41, 0.14)",
  },

  heroContent: {
    maxWidth: "720px",
  },

  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#b9e4c8",
    fontSize: "0.68rem",
    fontWeight: "800",
    letterSpacing: "0.14em",
    marginBottom: "0.55rem",
  },

  eyebrowLine: {
    width: "25px",
    height: "2px",
    backgroundColor: "#86efac",
    borderRadius: "999px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "clamp(1.55rem, 3vw, 2.2rem)",
    lineHeight: "1.15",
    fontWeight: "800",
    letterSpacing: "-0.03em",
  },

  heroDescription: {
    margin: "0.6rem 0 0",
    maxWidth: "650px",
    color: "#d5ebdc",
    fontSize: "0.88rem",
    lineHeight: "1.6",
  },

  historyButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.45rem",
    padding: "0.65rem 0.95rem",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#14532d",
    border: "1px solid #ffffff",
    textDecoration: "none",
    fontSize: "0.8rem",
    fontWeight: "750",
    whiteSpace: "nowrap",
  },

  // -----------------------------------------------------------
  // Main Content
  // -----------------------------------------------------------

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.7fr) minmax(260px, 0.8fr)",
    gap: "1.15rem",
    alignItems: "start",
  },

  // -----------------------------------------------------------
  // Form Card
  // -----------------------------------------------------------

  formCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e1",
    borderRadius: "17px",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.035)",
  },

  formHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.85rem",
    padding: "1.3rem 1.35rem",
    borderBottom: "1px solid #e5ebe7",
    backgroundColor: "#f7faf8",
  },

  formHeaderIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    backgroundColor: "#e7f5eb",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  sectionEyebrow: {
    color: "#28754c",
    fontSize: "0.65rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
    marginBottom: "0.25rem",
  },

  formTitle: {
    margin: 0,
    color: "#183326",
    fontSize: "1.1rem",
    fontWeight: "800",
  },

  formSubtitle: {
    margin: "0.3rem 0 0",
    color: "#77867d",
    fontSize: "0.77rem",
    lineHeight: "1.5",
  },

  // -----------------------------------------------------------
  // Form Sections
  // -----------------------------------------------------------

  formSection: {
    display: "grid",
    gridTemplateColumns: "38px minmax(0, 1fr)",
    gap: "0.85rem",
    padding: "1.2rem 1.35rem",
    borderBottom: "1px solid #edf1ee",
  },

  sectionNumber: {
    width: "29px",
    height: "29px",
    borderRadius: "9px",
    backgroundColor: "#eff8f2",
    color: "#28754c",
    border: "1px solid #d5e6da",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.68rem",
    fontWeight: "800",
  },

  formSectionContent: {
    minWidth: 0,
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#243a2d",
    fontSize: "0.8rem",
    fontWeight: "750",
    marginBottom: "0.5rem",
  },

  required: {
    color: "#b91c1c",
    fontWeight: "800",
  },

  optional: {
    color: "#7c8b82",
    fontSize: "0.67rem",
    fontWeight: "600",
    backgroundColor: "#f1f5f3",
    border: "1px solid #dfe7e2",
    borderRadius: "999px",
    padding: "0.15rem 0.4rem",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#fbfcfb",
    color: "#1f3327",
    border: "1px solid #d6e0d9",
    borderRadius: "9px",
    padding: "0.68rem 0.78rem",
    fontSize: "0.82rem",
    outline: "none",
    fontFamily: "inherit",
  },

  textarea: {
    resize: "vertical",
    minHeight: "150px",
    lineHeight: "1.55",
  },

  helpText: {
    display: "block",
    color: "#829087",
    fontSize: "0.68rem",
    marginTop: "0.4rem",
    lineHeight: "1.4",
  },

  inputFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },

  characterCount: {
    color: "#8a978f",
    fontSize: "0.67rem",
    whiteSpace: "nowrap",
  },

  loadingBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minHeight: "40px",
    color: "#718078",
    fontSize: "0.77rem",
  },

  smallSpinner: {
    width: "14px",
    height: "14px",
    border: "2px solid #dce9df",
    borderTop: "2px solid #28754c",
    borderRadius: "50%",
    animation:
      "submitComplaintSpin 0.8s linear infinite",
  },

  alertBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.55rem",
    backgroundColor: "#fff7f7",
    border: "1px solid #fecaca",
    color: "#991b1b",
    borderRadius: "9px",
    padding: "0.75rem",
    fontSize: "0.76rem",
    lineHeight: "1.45",
  },

  // -----------------------------------------------------------
  // Priority
  // -----------------------------------------------------------

  priorityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 145px), 1fr))",
    gap: "0.55rem",
  },

  priorityCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    textAlign: "left",
    backgroundColor: "#ffffff",
    color: "#334155",
    border: "1px solid #dce4de",
    borderRadius: "10px",
    padding: "0.65rem",
    cursor: "pointer",
  },

  prioritySelected: {
    border: "1px solid #74a987",
    backgroundColor: "#f2faf4",
    boxShadow:
      "0 0 0 2px rgba(40, 117, 76, 0.08)",
  },

  prioritySelectedUrgent: {
    border: "1px solid #efb0b0",
    backgroundColor: "#fff7f7",
    boxShadow:
      "0 0 0 2px rgba(185, 28, 28, 0.07)",
  },

  priorityIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },

  priorityText: {
    display: "flex",
    flexDirection: "column",
    gap: "0.1rem",
  },

  // -----------------------------------------------------------
  // Upload
  // -----------------------------------------------------------

  uploadBox: {
    position: "relative",
    minHeight: "155px",
    border: "1px dashed #b9cdbf",
    borderRadius: "12px",
    backgroundColor: "#f8fbf9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "1.25rem",
    boxSizing: "border-box",
  },

  uploadIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    backgroundColor: "#e7f5eb",
    color: "#28754c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.55rem",
  },

  uploadTitle: {
    color: "#294333",
    fontSize: "0.8rem",
    fontWeight: "750",
  },

  uploadDescription: {
    color: "#829087",
    fontSize: "0.69rem",
    marginTop: "0.25rem",
  },

  chooseFileButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "0.7rem",
    backgroundColor: "#166534",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "0.5rem 0.8rem",
    fontSize: "0.72rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  fileInput: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },

  fileHelpText: {
    color: "#8a978f",
    fontSize: "0.63rem",
    marginTop: "0.55rem",
  },

  selectedFile: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    border: "1px solid #cfe0d4",
    backgroundColor: "#f3f8f4",
    borderRadius: "10px",
    padding: "0.7rem",
  },

  selectedFileIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    backgroundColor: "#e2f1e6",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  selectedFileInfo: {
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
  },

  selectedFileName: {
    color: "#243a2d",
    fontSize: "0.77rem",
    fontWeight: "700",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  selectedFileSize: {
    color: "#829087",
    fontSize: "0.67rem",
  },

  removeFileButton: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    border: "1px solid #d7e0da",
    backgroundColor: "#ffffff",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  // -----------------------------------------------------------
  // Form Actions
  // -----------------------------------------------------------

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "0.6rem",
    padding: "1rem 1.35rem",
    backgroundColor: "#f8faf9",
  },

  cancelButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    color: "#526158",
    border: "1px solid #d5ded8",
    borderRadius: "9px",
    padding: "0.62rem 0.95rem",
    fontSize: "0.77rem",
    fontWeight: "700",
    textDecoration: "none",
  },

  submitButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    backgroundColor: "#166534",
    color: "#ffffff",
    border: "1px solid #166534",
    borderRadius: "9px",
    padding: "0.62rem 1rem",
    fontSize: "0.77rem",
    fontWeight: "750",
  },

  buttonSpinner: {
    width: "13px",
    height: "13px",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation:
      "submitComplaintSpin 0.8s linear infinite",
  },

  // -----------------------------------------------------------
  // Sidebar
  // -----------------------------------------------------------

  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },

  securityCard: {
    background:
      "linear-gradient(135deg, #f0faf3 0%, #e8f5ec 100%)",
    border: "1px solid #cfe4d5",
    borderRadius: "15px",
    padding: "1.15rem",
  },

  securityIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    backgroundColor: "#dff1e4",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.75rem",
  },

  sideTitle: {
    margin: 0,
    color: "#23402f",
    fontSize: "0.9rem",
    fontWeight: "800",
  },

  sideText: {
    margin: "0.45rem 0 0",
    color: "#66796d",
    fontSize: "0.74rem",
    lineHeight: "1.55",
  },

  infoCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e1",
    borderRadius: "15px",
    padding: "1.15rem",
  },

  sideEyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#28754c",
    fontSize: "0.64rem",
    fontWeight: "800",
    letterSpacing: "0.09em",
    marginBottom: "0.65rem",
  },

  guidelineList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    marginTop: "0.95rem",
  },

  guideline: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.55rem",
  },

  guidelineIcon: {
    width: "25px",
    height: "25px",
    borderRadius: "7px",
    backgroundColor: "#eff8f2",
    color: "#28754c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  guidelineStrong: {
    color: "#314639",
    fontSize: "0.75rem",
  },

  guidelineText: {
    margin: "0.2rem 0 0",
    color: "#78877e",
    fontSize: "0.7rem",
    lineHeight: "1.45",
  },

  processCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e1",
    borderRadius: "15px",
    padding: "1.15rem",
  },

  processStep: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.65rem",
  },

  processNumber: {
    width: "27px",
    height: "27px",
    borderRadius: "50%",
    backgroundColor: "#eff8f2",
    color: "#166534",
    border: "1px solid #cfe0d4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "0.7rem",
    fontWeight: "800",
  },

  processStrong: {
    color: "#314639",
    fontSize: "0.75rem",
  },

  processText: {
    margin: "0.2rem 0 0",
    color: "#78877e",
    fontSize: "0.69rem",
    lineHeight: "1.45",
  },

  processLine: {
    width: "1px",
    height: "17px",
    backgroundColor: "#d7e2da",
    marginLeft: "13px",
    marginTop: "2px",
    marginBottom: "2px",
  },
};

export default SubmitComplaint;