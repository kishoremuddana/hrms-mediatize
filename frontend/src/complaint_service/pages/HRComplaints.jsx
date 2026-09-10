import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Paperclip,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Tags,
  Ban,
  ShieldCheck,
  Clock3,
  CircleAlert,
  UserRound,
  CalendarDays,
  SlidersHorizontal,
  ArrowUpRight,
  Check,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";

import {
  getAllComplaints,
  getAllComplaintCategories,
  updateComplaintStatus,
  updateComplaintPriority,
  respondComplaint,
  resolveComplaint,
  closeComplaint,
} from "../services/complaintApi";

import { getEmployees } from "../../employee_service/services/employeeApi";
import { showSuccess, showError } from "../../shared/utils/toast";


function HRComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter options
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [respondModalComplaint, setRespondModalComplaint] = useState(null);
  const [resolveModalComplaint, setResolveModalComplaint] = useState(null);

  const [hrResponseInput, setHrResponseInput] = useState("");
  const [resolutionInput, setResolutionInput] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);


  // ------------------------------------------------------------
  // LOAD FILTER OPTIONS
  // ------------------------------------------------------------

  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [empRes, catRes] = await Promise.allSettled([
          getEmployees({ limit: 100 }),
          getAllComplaintCategories(),
        ]);

        if (empRes.status === "fulfilled") {
          setEmployees(empRes.value.data?.items || []);
        }

        if (catRes.status === "fulfilled") {
          setCategories(catRes.value.data || []);
        }
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    }

    loadFilterOptions();
  }, []);


  // ------------------------------------------------------------
  // FETCH COMPLAINTS
  // ------------------------------------------------------------

  const fetchComplaints = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 10,
        employee_id: selectedEmployeeId || undefined,
        category_id: selectedCategoryId || undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
        search: searchTerm.trim() || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      };

      const res = await getAllComplaints(params);

      setComplaints(res.data?.items || []);
      setTotalPages(res.data?.pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch HR complaints", err);
      showError("Failed to load workplace complaints.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    selectedEmployeeId,
    selectedCategoryId,
    selectedStatus,
    selectedPriority,
    searchTerm,
    fromDate,
    toDate,
  ]);


  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);


  // ------------------------------------------------------------
  // FILTER HANDLERS
  // ------------------------------------------------------------

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };


  const handleResetFilters = () => {
    setSelectedEmployeeId("");
    setSelectedCategoryId("");
    setSelectedStatus("");
    setSelectedPriority("");
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };


  const hasActiveFilters =
    selectedEmployeeId ||
    selectedCategoryId ||
    selectedStatus ||
    selectedPriority ||
    searchTerm ||
    fromDate ||
    toDate;


  // ------------------------------------------------------------
  // STATUS UPDATE
  // ------------------------------------------------------------

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatus(complaintId, newStatus);

      showSuccess(`Status updated to ${newStatus}`);

      fetchComplaints();

      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint((prev) => ({
          ...prev,
          status: newStatus,
        }));
      }
    } catch (err) {
      console.error("Failed to update status", err);

      showError(
        err.response?.data?.detail ||
          "Failed to update complaint status."
      );
    }
  };


  // ------------------------------------------------------------
  // PRIORITY UPDATE
  // ------------------------------------------------------------

  const handlePriorityChange = async (complaintId, newPriority) => {
    try {
      await updateComplaintPriority(complaintId, newPriority);

      showSuccess(`Priority updated to ${newPriority}`);

      fetchComplaints();

      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint((prev) => ({
          ...prev,
          priority: newPriority,
        }));
      }
    } catch (err) {
      console.error("Failed to update priority", err);

      showError(
        err.response?.data?.detail ||
          "Failed to update complaint priority."
      );
    }
  };


  // ------------------------------------------------------------
  // HR RESPONSE
  // ------------------------------------------------------------

  const handleRespondSubmit = async (e) => {
    e.preventDefault();

    if (!hrResponseInput || !hrResponseInput.trim()) {
      showError("Please enter an HR response.");
      return;
    }

    setActionSubmitting(true);

    try {
      await respondComplaint(
        respondModalComplaint.id,
        hrResponseInput.trim()
      );

      showSuccess("HR response saved successfully.");

      setRespondModalComplaint(null);
      setHrResponseInput("");

      fetchComplaints();
    } catch (err) {
      console.error("Failed to submit HR response", err);

      showError(
        err.response?.data?.detail ||
          "Failed to submit response."
      );
    } finally {
      setActionSubmitting(false);
    }
  };


  // ------------------------------------------------------------
  // RESOLVE
  // ------------------------------------------------------------

  const handleResolveSubmit = async (e) => {
    e.preventDefault();

    if (!resolutionInput || !resolutionInput.trim()) {
      showError("Please enter resolution details.");
      return;
    }

    setActionSubmitting(true);

    try {
      await resolveComplaint(
        resolveModalComplaint.id,
        resolutionInput.trim()
      );

      showSuccess("Complaint resolved successfully!");

      setResolveModalComplaint(null);
      setResolutionInput("");

      fetchComplaints();
    } catch (err) {
      console.error("Failed to resolve complaint", err);

      showError(
        err.response?.data?.detail ||
          "Failed to resolve complaint."
      );
    } finally {
      setActionSubmitting(false);
    }
  };


  // ------------------------------------------------------------
  // CLOSE
  // ------------------------------------------------------------

  const handleCloseComplaint = async (complaintId) => {
    if (
      !window.confirm(
        "Are you sure you want to close this resolved complaint?"
      )
    ) {
      return;
    }

    try {
      await closeComplaint(complaintId);

      showSuccess("Complaint closed.");

      fetchComplaints();

      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint((prev) => ({
          ...prev,
          status: "CLOSED",
        }));
      }
    } catch (err) {
      console.error("Failed to close complaint", err);

      showError(
        err.response?.data?.detail ||
          "Failed to close complaint."
      );
    }
  };


  // ------------------------------------------------------------
  // STATUS BADGE
  // ------------------------------------------------------------

  const getStatusBadge = (status) => {
    const config = {
      OPEN: {
        label: "Open",
        bg: "#ecfdf5",
        color: "#047857",
        border: "#a7f3d0",
      },

      UNDER_REVIEW: {
        label: "Under Review",
        bg: "#fffbeb",
        color: "#b45309",
        border: "#fde68a",
      },

      IN_PROGRESS: {
        label: "In Progress",
        bg: "#f0fdf4",
        color: "#15803d",
        border: "#bbf7d0",
      },

      RESOLVED: {
        label: "Resolved",
        bg: "#f0fdf4",
        color: "#166534",
        border: "#bbf7d0",
      },

      CLOSED: {
        label: "Closed",
        bg: "#f3f4f6",
        color: "#4b5563",
        border: "#d1d5db",
      },

      REJECTED: {
        label: "Rejected",
        bg: "#fef2f2",
        color: "#b91c1c",
        border: "#fecaca",
      },
    };

    const item = config[status] || {
      label: status,
      bg: "#f8fafc",
      color: "#475569",
      border: "#e2e8f0",
    };

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          borderRadius: "999px",
          background: item.bg,
          color: item.color,
          border: `1px solid ${item.border}`,
          fontSize: "12px",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: item.color,
          }}
        />
        {item.label}
      </span>
    );
  };


  // ------------------------------------------------------------
  // PRIORITY BADGE
  // ------------------------------------------------------------

  const getPriorityBadge = (priority) => {
    const config = {
      URGENT: {
        color: "#b91c1c",
        bg: "#fef2f2",
        border: "#fecaca",
      },

      HIGH: {
        color: "#c2410c",
        bg: "#fff7ed",
        border: "#fed7aa",
      },

      MEDIUM: {
        color: "#a16207",
        bg: "#fefce8",
        border: "#fde68a",
      },

      LOW: {
        color: "#64748b",
        bg: "#f8fafc",
        border: "#e2e8f0",
      },
    };

    const item = config[priority] || config.LOW;

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "5px 9px",
          borderRadius: "7px",
          background: item.bg,
          color: item.color,
          border: `1px solid ${item.border}`,
          fontSize: "11px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        {priority || "LOW"}
      </span>
    );
  };


  // ------------------------------------------------------------
  // DATE FORMAT
  // ------------------------------------------------------------

  const formatDate = (value, includeTime = false) => {
    if (!value) return "—";

    try {
      return new Date(value).toLocaleString("en-GB", {
        dateStyle: "medium",
        ...(includeTime ? { timeStyle: "short" } : {}),
      });
    } catch {
      return "—";
    }
  };


  // ------------------------------------------------------------
  // PAGE SNAPSHOT COUNTS
  // These are calculated only from currently loaded complaints.
  // ------------------------------------------------------------

  const openCount = complaints.filter(
    (c) => c.status === "OPEN"
  ).length;

  const reviewCount = complaints.filter(
    (c) =>
      c.status === "UNDER_REVIEW" ||
      c.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = complaints.filter(
    (c) =>
      c.status === "RESOLVED" ||
      c.status === "CLOSED"
  ).length;


  // ------------------------------------------------------------
  // RETURN
  // ------------------------------------------------------------

  return (
    <AppLayout title="HR Workplace Complaints Management">
      <div
        style={{
          minHeight: "100%",
          background: "#f8faf9",
          padding: "0 0 40px",
          color: "#17231c",
        }}
      >

        {/* ======================================================
            TOP NAV / BACK
        ====================================================== */}

        <div
          style={{
            maxWidth: "1450px",
            margin: "0 auto",
            padding: "18px 24px 0",
          }}
        >
          <BackToDashboard
            to="/hr/dashboard"
            role="HR"
            icon={ArrowLeft}
          />
        </div>


        {/* ======================================================
            HERO
        ====================================================== */}

        <section
          style={{
            maxWidth: "1450px",
            margin: "0 auto",
            padding: "22px 24px 28px",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, #123b29 0%, #19543a 55%, #236a49 100%)",
              borderRadius: "24px",
              padding: "32px",
              color: "#ffffff",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 16px 40px rgba(18,59,41,0.16)",
            }}
          >

            <div
              style={{
                position: "absolute",
                width: "260px",
                height: "260px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.10)",
                right: "-70px",
                top: "-120px",
              }}
            />

            <div
              style={{
                position: "absolute",
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.08)",
                right: "80px",
                bottom: "-120px",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ maxWidth: "720px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 11px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  <ShieldCheck size={14} />
                  HR Case Management
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(28px, 4vw, 44px)",
                    lineHeight: 1.1,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Workplace Complaints
                </h1>

                <p
                  style={{
                    margin: "13px 0 0",
                    color: "rgba(255,255,255,0.78)",
                    fontSize: "15px",
                    lineHeight: 1.7,
                  }}
                >
                  Review employee concerns, manage case priorities,
                  communicate with employees, and document official
                  resolutions from one workspace.
                </p>
              </div>


              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to="/hr/complaint-categories"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "11px 16px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    color: "#14532d",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: 750,
                  }}
                >
                  <Tags size={16} />
                  Manage Categories
                </Link>

                <button
                  type="button"
                  onClick={fetchComplaints}
                  disabled={loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "11px 16px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.10)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.20)",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: 700,
                    opacity: loading ? 0.65 : 1,
                  }}
                >
                  <RefreshCw
                    size={15}
                    style={{
                      animation: loading
                        ? "hrComplaintSpin 1s linear infinite"
                        : "none",
                    }}
                  />
                  Refresh Cases
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ======================================================
            PAGE SNAPSHOT
        ====================================================== */}

        <section
          style={{
            maxWidth: "1450px",
            margin: "0 auto",
            padding: "0 24px 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "14px",
            }}
          >

            {/* Total */}
            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <FileText size={19} />
              </div>

              <div>
                <div style={styles.statLabel}>
                  CASES IN VIEW
                </div>

                <div style={styles.statNumber}>
                  {complaints.length}
                </div>

                <div style={styles.statDescription}>
                  Current page
                </div>
              </div>
            </div>


            {/* Open */}
            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#ecfdf5",
                  color: "#047857",
                }}
              >
                <CircleAlert size={19} />
              </div>

              <div>
                <div style={styles.statLabel}>
                  OPEN
                </div>

                <div style={styles.statNumber}>
                  {openCount}
                </div>

                <div style={styles.statDescription}>
                  Awaiting review
                </div>
              </div>
            </div>


            {/* Review */}
            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#fffbeb",
                  color: "#b45309",
                }}
              >
                <Clock3 size={19} />
              </div>

              <div>
                <div style={styles.statLabel}>
                  IN REVIEW
                </div>

                <div style={styles.statNumber}>
                  {reviewCount}
                </div>

                <div style={styles.statDescription}>
                  Active processing
                </div>
              </div>
            </div>


            {/* Resolved */}
            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#f0fdf4",
                  color: "#166534",
                }}
              >
                <CheckCircle size={19} />
              </div>

              <div>
                <div style={styles.statLabel}>
                  RESOLVED
                </div>

                <div style={styles.statNumber}>
                  {resolvedCount}
                </div>

                <div style={styles.statDescription}>
                  Resolved or closed
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ======================================================
            FILTER / EXPLORER
        ====================================================== */}

        <section
          style={{
            maxWidth: "1450px",
            margin: "0 auto",
            padding: "0 24px 22px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dce7e0",
              borderRadius: "18px",
              boxShadow: "0 5px 18px rgba(18,59,41,0.05)",
              overflow: "hidden",
            }}
          >

            <div
              style={{
                padding: "20px 22px",
                borderBottom: "1px solid #e7eee9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    color: "#174b33",
                    fontSize: "15px",
                    fontWeight: 800,
                  }}
                >
                  <SlidersHorizontal size={18} />
                  Case Explorer
                </div>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#718078",
                    fontSize: "12px",
                  }}
                >
                  Search and narrow workplace cases by employee,
                  status, priority, category, or date.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={styles.clearButton}
                >
                  <X size={14} />
                  Clear all filters
                </button>
              )}
            </div>


            <div style={{ padding: "20px 22px" }}>

              {/* Search */}
              <div
                style={{
                  position: "relative",
                  marginBottom: "16px",
                }}
              >
                <Search
                  size={18}
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#819089",
                  }}
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search complaint code, subject, employee name or description..."
                  aria-label="Search complaints"
                  style={styles.searchInput}
                />
              </div>


              {/* Filters */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                }}
              >

                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  style={styles.filterSelect}
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="UNDER_REVIEW">
                    Under Review
                  </option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected</option>
                </select>


                <select
                  value={selectedPriority}
                  onChange={(e) => {
                    setSelectedPriority(e.target.value);
                    setPage(1);
                  }}
                  style={styles.filterSelect}
                  aria-label="Filter by priority"
                >
                  <option value="">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>


                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setPage(1);
                  }}
                  style={styles.filterSelect}
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>


                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setPage(1);
                  }}
                  style={styles.filterSelect}
                  aria-label="Filter by employee"
                >
                  <option value="">All Employees</option>

                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.first_name} {employee.last_name} (
                      {employee.employee_code})
                    </option>
                  ))}
                </select>


                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  style={styles.filterSelect}
                  aria-label="From date"
                />


                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  style={styles.filterSelect}
                  aria-label="To date"
                />

              </div>
            </div>
          </div>
        </section>


        {/* ======================================================
            CASE LIST
        ====================================================== */}

        <section
          style={{
            maxWidth: "1450px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#173326",
                  fontSize: "19px",
                  fontWeight: 800,
                }}
              >
                Complaint Cases
              </h2>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#7a8981",
                  fontSize: "12px",
                }}
              >
                Review and manage employee workplace concerns.
              </p>
            </div>

            <div
              style={{
                padding: "8px 12px",
                background: "#ffffff",
                border: "1px solid #dce7e0",
                borderRadius: "9px",
                color: "#5e6f66",
                fontSize: "12px",
              }}
            >
              Showing{" "}
              <strong style={{ color: "#174b33" }}>
                {complaints.length}
              </strong>{" "}
              of{" "}
              <strong style={{ color: "#174b33" }}>
                {totalItems}
              </strong>
            </div>
          </div>


          {/* Loading */}
          {loading && (
            <div style={styles.emptyCard}>
              <div style={styles.loadingCircle}>
                <RefreshCw size={22} />
              </div>

              <h3 style={styles.emptyTitle}>
                Loading complaint cases
              </h3>

              <p style={styles.emptyDescription}>
                Please wait while the workplace cases are loaded.
              </p>
            </div>
          )}


          {/* Empty */}
          {!loading && complaints.length === 0 && (
            <div style={styles.emptyCard}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "18px",
                  background: "#edf7f1",
                  color: "#28734d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 15px",
                }}
              >
                <FileText size={28} />
              </div>

              <h3 style={styles.emptyTitle}>
                No complaint cases found
              </h3>

              <p style={styles.emptyDescription}>
                No workplace complaints match the current search
                or filter criteria.
              </p>
            </div>
          )}


          {/* Complaint Cards */}
          {!loading && complaints.length > 0 && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(420px, 1fr))",
                  gap: "15px",
                }}
              >
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    style={styles.caseCard}
                  >

                    {/* Card Header */}
                    <div
                      style={{
                        padding: "17px 18px",
                        borderBottom: "1px solid #e8efeb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >

                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              color: "#17613d",
                              fontSize: "12px",
                              fontWeight: 850,
                              letterSpacing: "0.04em",
                            }}
                          >
                            {complaint.complaint_code}
                          </span>

                          <span
                            style={{
                              width: "4px",
                              height: "4px",
                              borderRadius: "50%",
                              background: "#b7c5bd",
                            }}
                          />

                          <span
                            style={{
                              color: "#78877f",
                              fontSize: "11px",
                            }}
                          >
                            {formatDate(
                              complaint.created_at
                            )}
                          </span>
                        </div>

                        <h3
                          style={{
                            margin: 0,
                            color: "#1a2c22",
                            fontSize: "16px",
                            fontWeight: 800,
                            lineHeight: 1.4,
                          }}
                        >
                          {complaint.subject}
                        </h3>
                      </div>

                      {getStatusBadge(complaint.status)}
                    </div>


                    {/* Card Body */}
                    <div style={{ padding: "17px 18px" }}>

                      {/* Employee */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                          marginBottom: "15px",
                        }}
                      >
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "11px",
                            background: "#edf7f1",
                            color: "#216a46",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <UserRound size={18} />
                        </div>

                        <div>
                          <div
                            style={{
                              color: "#24382d",
                              fontSize: "13px",
                              fontWeight: 750,
                            }}
                          >
                            {complaint.employee_name ||
                              "Employee"}
                          </div>

                          <div
                            style={{
                              color: "#7b8982",
                              fontSize: "11px",
                              marginTop: "2px",
                            }}
                          >
                            {complaint.employee_code ||
                              "Employee ID not available"}
                          </div>
                        </div>
                      </div>


                      {/* Meta */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(2, minmax(0, 1fr))",
                          gap: "9px",
                          marginBottom: "15px",
                        }}
                      >

                        <div style={styles.metaBox}>
                          <span style={styles.metaLabel}>
                            CATEGORY
                          </span>

                          <span style={styles.metaValue}>
                            {complaint.category_name ||
                              "General"}
                          </span>
                        </div>


                        <div style={styles.metaBox}>
                          <span style={styles.metaLabel}>
                            PRIORITY
                          </span>

                          <div>
                            {getPriorityBadge(
                              complaint.priority
                            )}
                          </div>
                        </div>

                      </div>


                      {/* Description */}
                      <div
                        style={{
                          background: "#f7faf8",
                          border: "1px solid #e5ece8",
                          borderRadius: "11px",
                          padding: "12px",
                          marginBottom: "15px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#7a8981",
                            fontWeight: 800,
                            letterSpacing: "0.07em",
                            marginBottom: "5px",
                          }}
                        >
                          CASE SUMMARY
                        </div>

                        <p
                          style={{
                            margin: 0,
                            color: "#53645b",
                            fontSize: "12px",
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {complaint.description ||
                            "No description provided."}
                        </p>
                      </div>


                      {/* Priority Change */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          marginBottom: "14px",
                        }}
                      >
                        <span
                          style={{
                            color: "#64756c",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          Case Priority
                        </span>

                        <select
                          value={complaint.priority}
                          onChange={(e) =>
                            handlePriorityChange(
                              complaint.id,
                              e.target.value
                            )
                          }
                          style={styles.smallSelect}
                          title="Change priority"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">
                            Urgent
                          </option>
                        </select>
                      </div>


                      {/* Actions */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedComplaint(complaint)
                          }
                          style={styles.outlineAction}
                        >
                          <Eye size={14} />
                          Details
                        </button>


                        <button
                          type="button"
                          onClick={() => {
                            setRespondModalComplaint(
                              complaint
                            );
                            setHrResponseInput(
                              complaint.hr_response || ""
                            );
                          }}
                          style={styles.greenAction}
                        >
                          <MessageSquare size={14} />
                          Respond
                        </button>


                        {complaint.status !== "RESOLVED" &&
                          complaint.status !== "CLOSED" &&
                          complaint.status !== "REJECTED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setResolveModalComplaint(
                                  complaint
                                );
                                setResolutionInput(
                                  complaint.resolution || ""
                                );
                              }}
                              style={styles.resolveAction}
                            >
                              <CheckCircle size={14} />
                              Resolve
                            </button>
                          )}


                        {complaint.status === "RESOLVED" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCloseComplaint(
                                complaint.id
                              )
                            }
                            style={styles.closeAction}
                          >
                            <Ban size={14} />
                            Close
                          </button>
                        )}

                      </div>

                    </div>
                  </div>
                ))}
              </div>


              {/* ==================================================
                  PAGINATION
              ================================================== */}

              {totalPages > 1 && (
                <div
                  style={{
                    marginTop: "20px",
                    background: "#ffffff",
                    border: "1px solid #dce7e0",
                    borderRadius: "14px",
                    padding: "12px 15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      color: "#687870",
                      fontSize: "12px",
                    }}
                  >
                    Page{" "}
                    <strong style={{ color: "#174b33" }}>
                      {page}
                    </strong>{" "}
                    of{" "}
                    <strong style={{ color: "#174b33" }}>
                      {totalPages}
                    </strong>{" "}
                    · {totalItems} total cases
                  </div>


                  <div
                    style={{
                      display: "flex",
                      gap: "7px",
                    }}
                  >
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((p) => Math.max(1, p - 1))
                      }
                      style={{
                        ...styles.paginationButton,
                        opacity: page <= 1 ? 0.45 : 1,
                        cursor:
                          page <= 1
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      <ChevronLeft size={15} />
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((p) =>
                          Math.min(totalPages, p + 1)
                        )
                      }
                      style={{
                        ...styles.paginationButton,
                        opacity:
                          page >= totalPages ? 0.45 : 1,
                        cursor:
                          page >= totalPages
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Next
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </section>


        {/* ======================================================
            COMPLAINT DETAILS MODAL
        ====================================================== */}

        {selectedComplaint && (
          <div
            style={styles.modalOverlay}
            onClick={() => setSelectedComplaint(null)}
          >
            <div
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >

              <div style={styles.modalHeader}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={styles.modalCode}>
                      {selectedComplaint.complaint_code}
                    </span>

                    {getStatusBadge(
                      selectedComplaint.status
                    )}
                  </div>

                  <div style={styles.modalSub}>
                    Submitted{" "}
                    {formatDate(
                      selectedComplaint.created_at,
                      true
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedComplaint(null)
                  }
                  style={styles.modalClose}
                >
                  <X size={19} />
                </button>
              </div>


              <div style={styles.modalBody}>

                {/* Subject */}
                <div style={styles.modalHeroBlock}>
                  <div style={styles.sectionEyebrow}>
                    COMPLAINT SUBJECT
                  </div>

                  <h2 style={styles.modalMainTitle}>
                    {selectedComplaint.subject}
                  </h2>
                </div>


                {/* Information grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: "10px",
                  }}
                >

                  <div style={styles.detailCard}>
                    <UserRound size={16} />
                    <div>
                      <span style={styles.detailCardLabel}>
                        Employee
                      </span>

                      <strong>
                        {selectedComplaint.employee_name ||
                          "Employee"}
                      </strong>

                      <small>
                        {selectedComplaint.employee_code ||
                          "—"}
                      </small>
                    </div>
                  </div>


                  <div style={styles.detailCard}>
                    <Tags size={16} />
                    <div>
                      <span style={styles.detailCardLabel}>
                        Category
                      </span>

                      <strong>
                        {selectedComplaint.category_name ||
                          "General"}
                      </strong>
                    </div>
                  </div>


                  <div style={styles.detailCard}>
                    <CircleAlert size={16} />
                    <div>
                      <span style={styles.detailCardLabel}>
                        Priority
                      </span>

                      <div>
                        {getPriorityBadge(
                          selectedComplaint.priority
                        )}
                      </div>
                    </div>
                  </div>

                </div>


                {/* Status */}
                <div style={styles.detailSection}>
                  <div style={styles.sectionEyebrow}>
                    CASE STATUS
                  </div>

                  <select
                    value={selectedComplaint.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedComplaint.id,
                        e.target.value
                      )
                    }
                    style={styles.modalSelect}
                  >
                    <option value="OPEN">Open</option>
                    <option value="UNDER_REVIEW">
                      Under Review
                    </option>
                    <option value="IN_PROGRESS">
                      In Progress
                    </option>
                    <option value="RESOLVED">
                      Resolved
                    </option>
                    <option value="CLOSED">Closed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>


                {/* Description */}
                <div style={styles.detailSection}>
                  <div style={styles.sectionEyebrow}>
                    EMPLOYEE DESCRIPTION
                  </div>

                  <div style={styles.contentBox}>
                    {selectedComplaint.description ||
                      "No description provided."}
                  </div>
                </div>


                {/* HR response */}
                <div style={styles.detailSection}>
                  <div style={styles.sectionEyebrow}>
                    HR RESPONSE
                  </div>

                  <div
                    style={{
                      ...styles.contentBox,
                      background:
                        selectedComplaint.hr_response
                          ? "#f0fdf4"
                          : "#f8faf9",
                      borderColor:
                        selectedComplaint.hr_response
                          ? "#ccebd8"
                          : "#e2ebe6",
                    }}
                  >
                    {selectedComplaint.hr_response ||
                      "No HR response recorded yet."}
                  </div>
                </div>


                {/* Resolution */}
                {selectedComplaint.resolution && (
                  <div style={styles.detailSection}>
                    <div style={styles.sectionEyebrow}>
                      RESOLUTION
                    </div>

                    <div style={styles.resolutionBox}>
                      <CheckCircle size={18} />

                      <div>
                        <div
                          style={{
                            color: "#28533b",
                            fontSize: "13px",
                            lineHeight: 1.6,
                          }}
                        >
                          {selectedComplaint.resolution}
                        </div>

                        {selectedComplaint.resolved_at && (
                          <div
                            style={{
                              marginTop: "6px",
                              color: "#6d7e74",
                              fontSize: "11px",
                            }}
                          >
                            Resolved{" "}
                            {formatDate(
                              selectedComplaint.resolved_at,
                              true
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}


                {/* Attachment */}
                <div style={styles.detailSection}>
                  <div style={styles.sectionEyebrow}>
                    ATTACHMENT
                  </div>

                  {selectedComplaint.attachment_url ? (
                    <a
                      href={selectedComplaint.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.attachmentButton}
                    >
                      <Paperclip size={16} />

                      <span>
                        Open{" "}
                        {selectedComplaint.attachment_name ||
                          "Attachment"}
                      </span>

                      <ArrowUpRight
                        size={14}
                        style={{ marginLeft: "auto" }}
                      />
                    </a>
                  ) : (
                    <div
                      style={{
                        color: "#7a8981",
                        fontSize: "12px",
                      }}
                    >
                      No attachment provided.
                    </div>
                  )}
                </div>

              </div>


              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedComplaint(null)
                  }
                  style={styles.secondaryButton}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}


        {/* ======================================================
            HR RESPONSE MODAL
        ====================================================== */}

        {respondModalComplaint && (
          <div
            style={styles.modalOverlay}
            onClick={() =>
              setRespondModalComplaint(null)
            }
          >
            <div
              style={styles.modalSmall}
              onClick={(e) => e.stopPropagation()}
            >

              <div style={styles.modalHeader}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div style={styles.modalGreenIcon}>
                      <MessageSquare size={17} />
                    </div>

                    <div>
                      <h3 style={styles.modalTitle}>
                        HR Response
                      </h3>

                      <div style={styles.modalSub}>
                        Case{" "}
                        {respondModalComplaint.complaint_code}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRespondModalComplaint(null)
                  }
                  style={styles.modalClose}
                >
                  <X size={19} />
                </button>
              </div>


              <form onSubmit={handleRespondSubmit}>
                <div style={styles.modalBody}>

                  <div style={styles.contextStrip}>
                    <span>Employee</span>

                    <strong>
                      {respondModalComplaint.employee_name ||
                        "Employee"}
                    </strong>

                    <span style={{ color: "#9aa79f" }}>
                      ·
                    </span>

                    <span>
                      {respondModalComplaint.subject}
                    </span>
                  </div>


                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Official HR Response
                      <span style={{ color: "#b91c1c" }}>
                        *
                      </span>
                    </label>

                    <textarea
                      rows={7}
                      value={hrResponseInput}
                      onChange={(e) =>
                        setHrResponseInput(e.target.value)
                      }
                      placeholder="Enter the official HR response, investigation update, remarks, or requested employee actions..."
                      required
                      style={styles.textarea}
                    />

                    <div style={styles.formHint}>
                      An HR response can communicate investigation
                      updates or official actions to the employee.
                    </div>
                  </div>

                </div>


                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() =>
                      setRespondModalComplaint(null)
                    }
                    style={styles.secondaryButton}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionSubmitting}
                    style={{
                      ...styles.primaryButton,
                      opacity: actionSubmitting ? 0.65 : 1,
                    }}
                  >
                    {actionSubmitting ? (
                      <>
                        <RefreshCw
                          size={15}
                          style={{
                            animation:
                              "hrComplaintSpin 1s linear infinite",
                          }}
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        Save Response
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}


        {/* ======================================================
            RESOLUTION MODAL
        ====================================================== */}

        {resolveModalComplaint && (
          <div
            style={styles.modalOverlay}
            onClick={() =>
              setResolveModalComplaint(null)
            }
          >
            <div
              style={styles.modalSmall}
              onClick={(e) => e.stopPropagation()}
            >

              <div style={styles.modalHeader}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        ...styles.modalGreenIcon,
                        background: "#ecfdf5",
                        color: "#047857",
                      }}
                    >
                      <CheckCircle size={17} />
                    </div>

                    <div>
                      <h3 style={styles.modalTitle}>
                        Resolve Complaint
                      </h3>

                      <div style={styles.modalSub}>
                        Case{" "}
                        {resolveModalComplaint.complaint_code}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setResolveModalComplaint(null)
                  }
                  style={styles.modalClose}
                >
                  <X size={19} />
                </button>
              </div>


              <form onSubmit={handleResolveSubmit}>
                <div style={styles.modalBody}>

                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      background: "#f0fdf4",
                      border: "1px solid #ccebd8",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#5e806c",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        marginBottom: "5px",
                      }}
                    >
                      CASE TO RESOLVE
                    </div>

                    <div
                      style={{
                        color: "#234b34",
                        fontSize: "14px",
                        fontWeight: 750,
                      }}
                    >
                      {resolveModalComplaint.subject}
                    </div>

                    <div
                      style={{
                        color: "#6a7d72",
                        fontSize: "11px",
                        marginTop: "4px",
                      }}
                    >
                      {resolveModalComplaint.employee_name ||
                        "Employee"}
                    </div>
                  </div>


                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Final Resolution Details
                      <span style={{ color: "#b91c1c" }}>
                        *
                      </span>
                    </label>

                    <textarea
                      rows={7}
                      value={resolutionInput}
                      onChange={(e) =>
                        setResolutionInput(e.target.value)
                      }
                      placeholder="Document the official resolution, actions taken, policy decision, outcome, or other relevant closure information..."
                      required
                      style={styles.textarea}
                    />

                    <div style={styles.formHint}>
                      Saving this resolution marks the complaint
                      as resolved.
                    </div>
                  </div>

                </div>


                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() =>
                      setResolveModalComplaint(null)
                    }
                    style={styles.secondaryButton}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionSubmitting}
                    style={{
                      ...styles.primaryButton,
                      opacity: actionSubmitting ? 0.65 : 1,
                      background: "#17613d",
                    }}
                  >
                    {actionSubmitting ? (
                      <>
                        <RefreshCw
                          size={15}
                          style={{
                            animation:
                              "hrComplaintSpin 1s linear infinite",
                          }}
                        />
                        Resolving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} />
                        Mark as Resolved
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>


      {/* Small component-level CSS */}
      <style>
        {`
          @keyframes hrComplaintSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          button,
          input,
          select,
          textarea {
            font-family: inherit;
          }

          button {
            transition:
              transform 0.15s ease,
              box-shadow 0.15s ease,
              background 0.15s ease,
              border-color 0.15s ease;
          }

          button:not(:disabled):hover {
            transform: translateY(-1px);
          }

          input:focus,
          select:focus,
          textarea:focus {
            border-color: #4b956c !important;
            box-shadow: 0 0 0 3px rgba(45, 125, 80, 0.10);
          }

          @media (max-width: 700px) {
            .hr-complaint-responsive {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </AppLayout>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = {
  statCard: {
    background: "#ffffff",
    border: "1px solid #dce7e0",
    borderRadius: "16px",
    padding: "17px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    minHeight: "104px",
    boxShadow: "0 4px 15px rgba(18,59,41,0.04)",
  },

  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#edf7f1",
    color: "#17613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statLabel: {
    color: "#718078",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.07em",
  },

  statNumber: {
    color: "#183327",
    fontSize: "25px",
    lineHeight: 1.2,
    fontWeight: 850,
    marginTop: "3px",
  },

  statDescription: {
    color: "#8a968f",
    fontSize: "10px",
    marginTop: "2px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    height: "45px",
    padding: "0 14px 0 43px",
    borderRadius: "10px",
    border: "1px solid #d7e3dc",
    background: "#fbfdfc",
    color: "#20352a",
    outline: "none",
    fontSize: "13px",
  },

  filterSelect: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    height: "42px",
    padding: "0 11px",
    borderRadius: "9px",
    border: "1px solid #d7e3dc",
    background: "#ffffff",
    color: "#405149",
    outline: "none",
    fontSize: "12px",
  },

  smallSelect: {
    height: "33px",
    padding: "0 9px",
    borderRadius: "8px",
    border: "1px solid #d6e2da",
    background: "#ffffff",
    color: "#405149",
    outline: "none",
    fontSize: "11px",
    fontWeight: 650,
  },

  clearButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid #e5caca",
    background: "#fffafa",
    color: "#a34747",
    padding: "8px 11px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 700,
  },

  caseCard: {
    background: "#ffffff",
    border: "1px solid #dce7e0",
    borderRadius: "17px",
    overflow: "hidden",
    boxShadow: "0 5px 18px rgba(18,59,41,0.045)",
    transition: "box-shadow 0.2s ease",
  },

  metaBox: {
    background: "#f8faf9",
    border: "1px solid #e6eee9",
    borderRadius: "9px",
    padding: "10px",
    minWidth: 0,
  },

  metaLabel: {
    display: "block",
    color: "#84928b",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.07em",
    marginBottom: "5px",
  },

  metaValue: {
    display: "block",
    color: "#34483d",
    fontSize: "11px",
    fontWeight: 700,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  outlineAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px 11px",
    borderRadius: "8px",
    border: "1px solid #d5e1da",
    background: "#ffffff",
    color: "#3d5147",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 750,
  },

  greenAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px 11px",
    borderRadius: "8px",
    border: "1px solid #c8e4d3",
    background: "#f1faf4",
    color: "#17613d",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 750,
  },

  resolveAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px 11px",
    borderRadius: "8px",
    border: "1px solid #bfe2cc",
    background: "#eaf8ef",
    color: "#166534",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 750,
  },

  closeAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px 11px",
    borderRadius: "8px",
    border: "1px solid #d9e0dc",
    background: "#f8faf9",
    color: "#63716a",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 750,
  },

  paginationButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    height: "34px",
    padding: "0 11px",
    borderRadius: "8px",
    border: "1px solid #d7e3dc",
    background: "#ffffff",
    color: "#3c5046",
    fontSize: "11px",
    fontWeight: 700,
  },

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #dce7e0",
    borderRadius: "17px",
    padding: "60px 20px",
    textAlign: "center",
    boxShadow: "0 5px 18px rgba(18,59,41,0.04)",
  },

  loadingCircle: {
    width: "54px",
    height: "54px",
    margin: "0 auto 14px",
    borderRadius: "16px",
    background: "#edf7f1",
    color: "#17613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    margin: 0,
    color: "#26392f",
    fontSize: "16px",
    fontWeight: 800,
  },

  emptyDescription: {
    margin: "6px auto 0",
    maxWidth: "450px",
    color: "#7b8982",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1200,
    background: "rgba(13, 31, 22, 0.54)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
  },

  modal: {
    width: "min(94vw, 760px)",
    maxHeight: "calc(100vh - 36px)",
    background: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 70px rgba(10,35,23,0.22)",
    border: "1px solid #d9e5de",
  },

  modalSmall: {
    width: "min(94vw, 570px)",
    maxHeight: "calc(100vh - 36px)",
    background: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 70px rgba(10,35,23,0.22)",
    border: "1px solid #d9e5de",
  },

  modalHeader: {
    padding: "17px 20px",
    background: "#fbfdfc",
    borderBottom: "1px solid #e3ebe6",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    flexShrink: 0,
  },

  modalCode: {
    color: "#17613d",
    fontSize: "14px",
    fontWeight: 850,
    letterSpacing: "0.04em",
  },

  modalSub: {
    color: "#7a8981",
    fontSize: "10px",
    marginTop: "5px",
  },

  modalClose: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    border: "1px solid #dce5df",
    background: "#ffffff",
    color: "#65756c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  modalBody: {
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "17px",
  },

  modalFooter: {
    padding: "13px 20px",
    background: "#fbfdfc",
    borderTop: "1px solid #e3ebe6",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    flexShrink: 0,
  },

  modalHeroBlock: {
    paddingBottom: "3px",
  },

  sectionEyebrow: {
    color: "#819089",
    fontSize: "9px",
    fontWeight: 850,
    letterSpacing: "0.09em",
    marginBottom: "7px",
  },

  modalMainTitle: {
    margin: 0,
    color: "#1d3026",
    fontSize: "22px",
    lineHeight: 1.35,
    fontWeight: 820,
  },

  detailCard: {
    display: "flex",
    gap: "9px",
    alignItems: "flex-start",
    padding: "12px",
    border: "1px solid #e2ebe6",
    borderRadius: "11px",
    background: "#f9fbfa",
    color: "#32704f",
  },

  detailCardLabel: {
    display: "block",
    color: "#85928b",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    marginBottom: "3px",
  },

  detailSection: {
    display: "flex",
    flexDirection: "column",
  },

  detailCard: {
    display: "flex",
    gap: "9px",
    alignItems: "flex-start",
    padding: "12px",
    border: "1px solid #e2ebe6",
    borderRadius: "11px",
    background: "#f9fbfa",
    color: "#32704f",
  },

  detailCardLabel: {
    display: "block",
    color: "#85928b",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    marginBottom: "3px",
  },

  contentBox: {
    padding: "13px",
    borderRadius: "11px",
    border: "1px solid #e0e9e4",
    background: "#f8faf9",
    color: "#43554c",
    fontSize: "12px",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },

  resolutionBox: {
    display: "flex",
    gap: "10px",
    padding: "13px",
    borderRadius: "11px",
    border: "1px solid #ccebd8",
    background: "#f0fdf4",
    color: "#17613d",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  modalSelect: {
    height: "40px",
    padding: "0 11px",
    borderRadius: "9px",
    border: "1px solid #d5e1da",
    background: "#ffffff",
    color: "#3f5148",
    fontSize: "12px",
    outline: "none",
  },

  attachmentButton: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "11px 13px",
    borderRadius: "10px",
    border: "1px solid #cfe3d7",
    background: "#f3faf5",
    color: "#17613d",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 750,
  },

  secondaryButton: {
    height: "37px",
    padding: "0 14px",
    borderRadius: "8px",
    border: "1px solid #d4dfd9",
    background: "#ffffff",
    color: "#4e6057",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
  },

  primaryButton: {
    height: "37px",
    padding: "0 15px",
    borderRadius: "8px",
    border: "none",
    background: "#17613d",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 750,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
  },

  modalGreenIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#edf7f1",
    color: "#17613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalTitle: {
    margin: 0,
    color: "#1d3026",
    fontSize: "15px",
    fontWeight: 800,
  },

  contextStrip: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    flexWrap: "wrap",
    padding: "11px 12px",
    background: "#f7faf8",
    border: "1px solid #e3ebe6",
    borderRadius: "10px",
    color: "#687870",
    fontSize: "11px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  formLabel: {
    color: "#33483d",
    fontSize: "12px",
    fontWeight: 750,
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: "150px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d5e1da",
    background: "#ffffff",
    color: "#263b30",
    outline: "none",
    fontSize: "12px",
    lineHeight: 1.6,
    fontFamily: "inherit",
  },

  formHint: {
    color: "#819089",
    fontSize: "10px",
    lineHeight: 1.5,
  },
};


export default HRComplaints;