import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Plus,
  Pencil,
  Power,
  RefreshCw,
  WalletCards,
  FileCheck2,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Settings2,
  CalendarDays,
  Info,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { showSuccess, showError } from "../../shared/utils/toast";

import {
  getAllLeaveTypes,
  createLeaveType,
  updateLeaveType,
  activateLeaveType,
  deactivateLeaveType,
} from "../services/leaveApi";

function LeaveTypes() {
  /* =========================================================
     DATA
  ========================================================= */

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     MODAL
  ========================================================= */

  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* =========================================================
     FORM
  ========================================================= */

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [annualAllocation, setAnnualAllocation] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [requiresDocument, setRequiresDocument] =
    useState(false);
  const [isActive, setIsActive] = useState(true);

  /* =========================================================
     FETCH LEAVE TYPES
  ========================================================= */

  const fetchTypes = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getAllLeaveTypes();

      setLeaveTypes(res.data || []);
    } catch (err) {
      console.error(
        "Failed to fetch leave types",
        err
      );

      showError(
        "Failed to fetch leave types."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  /* =========================================================
     CREATE MODAL
  ========================================================= */

  const openCreateModal = () => {
    setEditingType(null);
    setName("");
    setDescription("");
    setAnnualAllocation("12");
    setIsPaid(true);
    setRequiresDocument(false);
    setIsActive(true);
    setShowModal(true);
  };

  /* =========================================================
     EDIT MODAL
  ========================================================= */

  const openEditModal = (t) => {
    setEditingType(t);

    setName(t.name);
    setDescription(t.description || "");
    setAnnualAllocation(
      String(t.annual_allocation)
    );
    setIsPaid(t.is_paid);
    setRequiresDocument(
      t.requires_document
    );
    setIsActive(t.is_active);

    setShowModal(true);
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingType(null);
  };

  /* =========================================================
     SUBMIT FORM
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    const payload = {
      name,
      description:
        description || undefined,
      annual_allocation:
        Number(annualAllocation),
      is_paid: isPaid,
      requires_document:
        requiresDocument,
      is_active: isActive,
    };

    try {
      if (editingType) {
        await updateLeaveType(
          editingType.id,
          payload
        );

        showSuccess(
          "Leave type updated successfully!"
        );
      } else {
        await createLeaveType(
          payload
        );

        showSuccess(
          "Leave type created successfully!"
        );
      }

      setShowModal(false);
      setEditingType(null);

      fetchTypes();
    } catch (err) {
      console.error(
        "Failed to save leave type",
        err
      );

      const errText =
        err.response?.data?.detail ||
        "Failed to save leave type.";

      showError(errText);
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     ACTIVATE / DEACTIVATE
  ========================================================= */

  const toggleActive = async (t) => {
    try {
      if (t.is_active) {
        await deactivateLeaveType(
          t.id
        );

        showSuccess(
          `Deactivated ${t.name}`
        );
      } else {
        await activateLeaveType(
          t.id
        );

        showSuccess(
          `Activated ${t.name}`
        );
      }

      fetchTypes();
    } catch (err) {
      console.error(
        "Failed to toggle status",
        err
      );

      showError(
        err.response?.data?.detail ||
          "Failed to toggle status."
      );
    }
  };

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const totalTypes =
    leaveTypes.length;

  const activeTypes =
    leaveTypes.filter(
      (type) => type.is_active
    ).length;

  const inactiveTypes =
    leaveTypes.filter(
      (type) => !type.is_active
    ).length;

  const paidTypes =
    leaveTypes.filter(
      (type) => type.is_paid
    ).length;

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <AppLayout title="Leave Type Configurations">
      <div style={styles.container}>

        {/* =================================================
            BACK
        ================================================= */}

        <BackToDashboard
          to="/hr/leaves"
          role="HR"
        />

        {/* =================================================
            HERO
        ================================================= */}

        <section
          style={styles.hero}
          className="leave-types-hero"
        >
          <div style={styles.heroContent}>
            <div style={styles.eyebrow}>
              <span
                style={styles.eyebrowLine}
              />
              HR CONFIGURATION
            </div>

            <h1 style={styles.heroTitle}>
              Leave Type Management
            </h1>

            <p style={styles.heroSubtitle}>
              Configure the leave policies available
              to employees, including annual allocation,
              payment status, documentation requirements,
              and availability.
            </p>

            <div style={styles.heroMeta}>
              <span style={styles.heroMetaItem}>
                <Settings2 size={14} />
                Policy Configuration
              </span>

              <span
                style={styles.heroSeparator}
              />

              <span style={styles.heroMetaItem}>
                <CalendarDays size={14} />
                Annual Allocation
              </span>

              <span
                style={styles.heroSeparator}
              />

              <span style={styles.heroMetaItem}>
                <ShieldCheck size={14} />
                HR Controlled
              </span>
            </div>
          </div>

          <div
            style={styles.heroActionPanel}
            className="leave-types-hero-action"
          >
            <div style={styles.heroActionIcon}>
              <WalletCards size={24} />
            </div>

            <span
              style={styles.heroActionLabel}
            >
              LEAVE POLICIES
            </span>

            <strong
              style={styles.heroActionValue}
            >
              {totalTypes}
            </strong>

            <span
              style={styles.heroActionText}
            >
              Configured leave types
            </span>

            <button
              type="button"
              style={styles.heroCreateButton}
              onClick={openCreateModal}
            >
              <Plus size={16} />
              Create Leave Type
            </button>
          </div>
        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section
          style={styles.summarySection}
        >
          <div style={styles.summaryHeader}>
            <div>
              <span
                style={styles.sectionEyebrow}
              >
                CONFIGURATION OVERVIEW
              </span>

              <h2
                style={styles.sectionTitle}
              >
                Leave Policy Summary
              </h2>
            </div>

            <button
              type="button"
              style={styles.refreshButton}
              onClick={fetchTypes}
              disabled={loading}
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "leave-types-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>

          <div
            className="leave-types-summary-grid"
            style={styles.summaryGrid}
          >
            {/* Total */}

            <div style={styles.summaryCard}>
              <div
                style={{
                  ...styles.summaryIcon,
                  backgroundColor: "#e8f3eb",
                  color: "#28613d",
                }}
              >
                <WalletCards size={19} />
              </div>

              <div>
                <span
                  style={styles.summaryLabel}
                >
                  TOTAL TYPES
                </span>

                <strong
                  style={styles.summaryValue}
                >
                  {totalTypes}
                </strong>

                <span
                  style={styles.summaryHint}
                >
                  Configured policies
                </span>
              </div>
            </div>

            {/* Active */}

            <div style={styles.summaryCard}>
              <div
                style={{
                  ...styles.summaryIcon,
                  backgroundColor: "#e8f3eb",
                  color: "#28613d",
                }}
              >
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span
                  style={styles.summaryLabel}
                >
                  ACTIVE
                </span>

                <strong
                  style={styles.summaryValue}
                >
                  {activeTypes}
                </strong>

                <span
                  style={styles.summaryHint}
                >
                  Available to employees
                </span>
              </div>
            </div>

            {/* Inactive */}

            <div style={styles.summaryCard}>
              <div
                style={{
                  ...styles.summaryIcon,
                  backgroundColor: "#f1f3f2",
                  color: "#69776f",
                }}
              >
                <XCircle size={19} />
              </div>

              <div>
                <span
                  style={styles.summaryLabel}
                >
                  INACTIVE
                </span>

                <strong
                  style={styles.summaryValue}
                >
                  {inactiveTypes}
                </strong>

                <span
                  style={styles.summaryHint}
                >
                  Currently disabled
                </span>
              </div>
            </div>

            {/* Paid */}

            <div style={styles.summaryCard}>
              <div
                style={{
                  ...styles.summaryIcon,
                  backgroundColor: "#fff5dc",
                  color: "#956c13",
                }}
              >
                <CircleDollarSign
                  size={19}
                />
              </div>

              <div>
                <span
                  style={styles.summaryLabel}
                >
                  PAID LEAVE
                </span>

                <strong
                  style={styles.summaryValue}
                >
                  {paidTypes}
                </strong>

                <span
                  style={styles.summaryHint}
                >
                  Paid policy types
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            DIRECTORY
        ================================================= */}

        <section style={styles.directory}>
          <div
            style={styles.directoryHeader}
          >
            <div>
              <span
                style={styles.sectionEyebrow}
              >
                POLICY DIRECTORY
              </span>

              <h2
                style={styles.directoryTitle}
              >
                Leave Type Configurations
              </h2>

              <p
                style={styles.directoryDescription}
              >
                Review and manage the leave policies
                currently configured in the HRMS.
              </p>
            </div>

            <div
              style={styles.directoryCount}
            >
              {totalTypes}{" "}
              {totalTypes === 1
                ? "Policy"
                : "Policies"}
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div style={styles.loadingState}>
              <div
                style={styles.loadingSpinner}
              />

              <strong
                style={styles.loadingTitle}
              >
                Loading leave policies
              </strong>

              <span
                style={styles.loadingText}
              >
                Retrieving configured leave types...
              </span>
            </div>
          ) : leaveTypes.length === 0 ? (
            /* =================================================
               EMPTY
            ================================================= */

            <div style={styles.emptyState}>
              <div
                style={styles.emptyIcon}
              >
                <WalletCards size={25} />
              </div>

              <span
                style={styles.emptyEyebrow}
              >
                NO CONFIGURATION
              </span>

              <h3
                style={styles.emptyTitle}
              >
                No Leave Types Configured
              </h3>

              <p
                style={styles.emptyText}
              >
                Create the first leave type to start
                defining employee leave policies.
              </p>

              <button
                type="button"
                style={styles.emptyButton}
                onClick={
                  openCreateModal
                }
              >
                <Plus size={15} />
                Create Leave Type
              </button>
            </div>
          ) : (
            /* =================================================
               CARDS
            ================================================= */

            <div
              className="leave-types-grid"
              style={styles.grid}
            >
              {leaveTypes.map((t) => (
                <article
                  key={t.id}
                  style={styles.card}
                >
                  {/* Card Header */}

                  <div
                    style={styles.cardHeader}
                  >
                    <div
                      style={
                        styles.cardIdentity
                      }
                    >
                      <div
                        style={
                          styles.cardIcon
                        }
                      >
                        <WalletCards
                          size={18}
                        />
                      </div>

                      <div>
                        <span
                          style={
                            styles.cardEyebrow
                          }
                        >
                          LEAVE POLICY
                        </span>

                        <h3
                          style={
                            styles.cardTitle
                          }
                        >
                          {t.name}
                        </h3>
                      </div>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          t.is_active
                            ? "#e8f4eb"
                            : "#f0f2f1",
                        color:
                          t.is_active
                            ? "#28613d"
                            : "#78847d",
                        borderColor:
                          t.is_active
                            ? "#d1e5d6"
                            : "#dce2de",
                      }}
                    >
                      <span
                        style={{
                          ...styles.statusDot,
                          backgroundColor:
                            t.is_active
                              ? "#3f8a59"
                              : "#929c96",
                        }}
                      />

                      {t.is_active
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>
                  </div>

                  {/* Description */}

                  <p
                    style={
                      styles.cardDescription
                    }
                  >
                    {t.description ||
                      "No description provided."}
                  </p>

                  {/* Main Allocation */}

                  <div
                    style={
                      styles.allocationBox
                    }
                  >
                    <div
                      style={
                        styles.allocationIcon
                      }
                    >
                      <CalendarDays
                        size={17}
                      />
                    </div>

                    <div
                      style={
                        styles.allocationContent
                      }
                    >
                      <span
                        style={
                          styles.allocationLabel
                        }
                      >
                        ANNUAL ALLOCATION
                      </span>

                      <strong
                        style={
                          styles.allocationValue
                        }
                      >
                        {t.annual_allocation}
                        <small
                          style={
                            styles.allocationUnit
                          }
                        >
                          days / year
                        </small>
                      </strong>
                    </div>
                  </div>

                  {/* Configuration Grid */}

                  <div
                    className="leave-types-info-grid"
                    style={styles.infoGrid}
                  >
                    <div
                      style={styles.infoItem}
                    >
                      <div
                        style={
                          styles.infoIcon
                        }
                      >
                        <CircleDollarSign
                          size={14}
                        />
                      </div>

                      <div>
                        <span
                          style={
                            styles.infoLabel
                          }
                        >
                          PAYMENT
                        </span>

                        <strong
                          style={
                            styles.infoValue
                          }
                        >
                          {t.is_paid
                            ? "Paid"
                            : "Unpaid"}
                        </strong>
                      </div>
                    </div>

                    <div
                      style={styles.infoItem}
                    >
                      <div
                        style={
                          styles.infoIcon
                        }
                      >
                        <FileCheck2
                          size={14}
                        />
                      </div>

                      <div>
                        <span
                          style={
                            styles.infoLabel
                          }
                        >
                          DOCUMENT
                        </span>

                        <strong
                          style={
                            styles.infoValue
                          }
                        >
                          {t.requires_document
                            ? "Required"
                            : "Optional"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}

                  <div
                    style={styles.cardActions}
                  >
                    <button
                      type="button"
                      style={
                        styles.editButton
                      }
                      onClick={() =>
                        openEditModal(t)
                      }
                    >
                      <Pencil size={14} />
                      Edit Policy
                    </button>

                    <button
                      type="button"
                      style={{
                        ...styles.statusButton,
                        color: t.is_active
                          ? "#a13d3d"
                          : "#28613d",
                        borderColor:
                          t.is_active
                            ? "#e5caca"
                            : "#cde0d2",
                        backgroundColor:
                          t.is_active
                            ? "#fff8f8"
                            : "#f4faf5",
                      }}
                      onClick={() =>
                        toggleActive(t)
                      }
                    >
                      <Power size={14} />

                      {t.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* =================================================
              INFORMATION STRIP
          ================================================= */}

          {!loading &&
            leaveTypes.length > 0 && (
              <div
                style={styles.infoStrip}
              >
                <div
                  style={styles.infoStripIcon}
                >
                  <Info size={16} />
                </div>

                <div>
                  <strong
                    style={
                      styles.infoStripTitle
                    }
                  >
                    Leave policy configuration
                  </strong>

                  <p
                    style={
                      styles.infoStripText
                    }
                  >
                    Active leave types can be used as
                    part of employee leave workflows.
                    Changes to allocations and policy
                    rules should be reviewed before
                    saving.
                  </p>
                </div>
              </div>
            )}
        </section>

        {/* =================================================
            CREATE / EDIT MODAL
        ================================================= */}

        {showModal && (
          <div
            style={styles.modalOverlay}
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget &&
                !submitting
              ) {
                closeModal();
              }
            }}
          >
            <div
              className="leave-types-modal"
              style={styles.modal}
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >
              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div
                style={styles.modalHeader}
              >
                <div
                  style={
                    styles.modalHeaderLeft
                  }
                >
                  <div
                    style={styles.modalIcon}
                  >
                    {editingType ? (
                      <Pencil size={19} />
                    ) : (
                      <Plus size={20} />
                    )}
                  </div>

                  <div>
                    <span
                      style={
                        styles.modalEyebrow
                      }
                    >
                      {editingType
                        ? "POLICY CONFIGURATION"
                        : "NEW POLICY"}
                    </span>

                    <h2
                      style={
                        styles.modalTitle
                      }
                    >
                      {editingType
                        ? "Edit Leave Type"
                        : "Create Leave Type"}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  style={styles.closeButton}
                  onClick={closeModal}
                  disabled={submitting}
                  aria-label="Close modal"
                >
                  <X size={19} />
                </button>
              </div>

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                style={styles.form}
              >
                <div
                  style={styles.modalBody}
                >
                  {/* BASIC INFORMATION */}

                  <div
                    style={styles.formSection}
                  >
                    <div
                      style={
                        styles.formSectionHeader
                      }
                    >
                      <div
                        style={
                          styles.sectionNumber
                        }
                      >
                        01
                      </div>

                      <div>
                        <strong
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Basic Information
                        </strong>

                        <span
                          style={
                            styles.formSectionText
                          }
                        >
                          Define the name and description
                          of the leave policy.
                        </span>
                      </div>
                    </div>

                    <div
                      style={
                        styles.formFields
                      }
                    >
                      {/* Name */}

                      <div
                        style={
                          styles.formGroup
                        }
                      >
                        <label
                          style={styles.label}
                        >
                          Leave Type Name
                          <span
                            style={
                              styles.required
                            }
                          >
                            *
                          </span>
                        </label>

                        <input
                          type="text"
                          style={
                            styles.input
                          }
                          value={name}
                          onChange={(e) =>
                            setName(
                              e.target.value
                            )
                          }
                          placeholder="e.g. Casual Leave"
                          required
                        />
                      </div>

                      {/* Description */}

                      <div
                        style={
                          styles.formGroup
                        }
                      >
                        <div
                          style={
                            styles.labelRow
                          }
                        >
                          <label
                            style={
                              styles.label
                            }
                          >
                            Description
                          </label>

                          <span
                            style={
                              styles.charCount
                            }
                          >
                            {description.length}
                          </span>
                        </div>

                        <textarea
                          style={
                            styles.textarea
                          }
                          value={
                            description
                          }
                          onChange={(e) =>
                            setDescription(
                              e.target.value
                            )
                          }
                          placeholder="Briefly describe when this leave type should be used..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ALLOCATION */}

                  <div
                    style={styles.formSection}
                  >
                    <div
                      style={
                        styles.formSectionHeader
                      }
                    >
                      <div
                        style={
                          styles.sectionNumber
                        }
                      >
                        02
                      </div>

                      <div>
                        <strong
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Annual Allocation
                        </strong>

                        <span
                          style={
                            styles.formSectionText
                          }
                        >
                          Set the maximum number of days
                          available each year.
                        </span>
                      </div>
                    </div>

                    <div
                      style={
                        styles.allocationInputWrapper
                      }
                    >
                      <CalendarDays
                        size={17}
                        style={
                          styles.inputLeadingIcon
                        }
                      />

                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        style={{
                          ...styles.input,
                          paddingLeft:
                            "2.4rem",
                          paddingRight:
                            "5.5rem",
                        }}
                        value={
                          annualAllocation
                        }
                        onChange={(e) =>
                          setAnnualAllocation(
                            e.target.value
                          )
                        }
                        required
                      />

                      <span
                        style={
                          styles.inputSuffix
                        }
                      >
                        DAYS / YEAR
                      </span>
                    </div>

                    <span
                      style={
                        styles.helperText
                      }
                    >
                      Half-day increments are supported.
                    </span>
                  </div>

                  {/* POLICY RULES */}

                  <div
                    style={styles.formSection}
                  >
                    <div
                      style={
                        styles.formSectionHeader
                      }
                    >
                      <div
                        style={
                          styles.sectionNumber
                        }
                      >
                        03
                      </div>

                      <div>
                        <strong
                          style={
                            styles.formSectionTitle
                          }
                        >
                          Policy Rules
                        </strong>

                        <span
                          style={
                            styles.formSectionText
                          }
                        >
                          Configure payment and documentation
                          requirements.
                        </span>
                      </div>
                    </div>

                    <div
                      style={
                        styles.optionList
                      }
                    >
                      {/* Paid */}

                      <label
                        style={{
                          ...styles.optionCard,
                          borderColor: isPaid
                            ? "#bcd7c4"
                            : "#dfe6e1",
                          backgroundColor:
                            isPaid
                              ? "#f3faf5"
                              : "#ffffff",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isPaid}
                          onChange={(e) =>
                            setIsPaid(
                              e.target.checked
                            )
                          }
                          style={
                            styles.checkbox
                          }
                        />

                        <div
                          style={
                            styles.optionIcon
                          }
                        >
                          <CircleDollarSign
                            size={16}
                          />
                        </div>

                        <div
                          style={
                            styles.optionContent
                          }
                        >
                          <strong
                            style={
                              styles.optionTitle
                            }
                          >
                            Paid Leave
                          </strong>

                          <span
                            style={
                              styles.optionDescription
                            }
                          >
                            Employee receives paid leave
                            for this policy.
                          </span>
                        </div>

                        <span
                          style={{
                            ...styles.optionState,
                            color: isPaid
                              ? "#28613d"
                              : "#8a958f",
                          }}
                        >
                          {isPaid
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </label>

                      {/* Document */}

                      <label
                        style={{
                          ...styles.optionCard,
                          borderColor:
                            requiresDocument
                              ? "#bcd7c4"
                              : "#dfe6e1",
                          backgroundColor:
                            requiresDocument
                              ? "#f3faf5"
                              : "#ffffff",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            requiresDocument
                          }
                          onChange={(e) =>
                            setRequiresDocument(
                              e.target.checked
                            )
                          }
                          style={
                            styles.checkbox
                          }
                        />

                        <div
                          style={
                            styles.optionIcon
                          }
                        >
                          <FileCheck2
                            size={16}
                          />
                        </div>

                        <div
                          style={
                            styles.optionContent
                          }
                        >
                          <strong
                            style={
                              styles.optionTitle
                            }
                          >
                            Supporting Document
                          </strong>

                          <span
                            style={
                              styles.optionDescription
                            }
                          >
                            Require documentation when
                            employees apply.
                          </span>
                        </div>

                        <span
                          style={{
                            ...styles.optionState,
                            color:
                              requiresDocument
                                ? "#28613d"
                                : "#8a958f",
                          }}
                        >
                          {requiresDocument
                            ? "Required"
                            : "Optional"}
                        </span>
                      </label>

                      {/* Active */}

                      <label
                        style={{
                          ...styles.optionCard,
                          borderColor: isActive
                            ? "#bcd7c4"
                            : "#dfe6e1",
                          backgroundColor:
                            isActive
                              ? "#f3faf5"
                              : "#ffffff",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) =>
                            setIsActive(
                              e.target.checked
                            )
                          }
                          style={
                            styles.checkbox
                          }
                        />

                        <div
                          style={
                            styles.optionIcon
                          }
                        >
                          <ShieldCheck
                            size={16}
                          />
                        </div>

                        <div
                          style={
                            styles.optionContent
                          }
                        >
                          <strong
                            style={
                              styles.optionTitle
                            }
                          >
                            Active Status
                          </strong>

                          <span
                            style={
                              styles.optionDescription
                            }
                          >
                            Make this leave type available
                            for employee use.
                          </span>
                        </div>

                        <span
                          style={{
                            ...styles.optionState,
                            color: isActive
                              ? "#28613d"
                              : "#8a958f",
                          }}
                        >
                          {isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* PREVIEW */}

                  <div
                    style={
                      styles.previewCard
                    }
                  >
                    <div
                      style={
                        styles.previewHeader
                      }
                    >
                      <div
                        style={
                          styles.previewIcon
                        }
                      >
                        <WalletCards
                          size={15}
                        />
                      </div>

                      <div>
                        <span
                          style={
                            styles.previewEyebrow
                          }
                        >
                          POLICY PREVIEW
                        </span>

                        <strong
                          style={
                            styles.previewTitle
                          }
                        >
                          {name ||
                            "Leave Type Name"}
                        </strong>
                      </div>
                    </div>

                    <div
                      style={
                        styles.previewGrid
                      }
                    >
                      <div>
                        <span
                          style={
                            styles.previewLabel
                          }
                        >
                          Allocation
                        </span>

                        <strong
                          style={
                            styles.previewValue
                          }
                        >
                          {annualAllocation ||
                            "0"}{" "}
                          days
                        </strong>
                      </div>

                      <div>
                        <span
                          style={
                            styles.previewLabel
                          }
                        >
                          Payment
                        </span>

                        <strong
                          style={
                            styles.previewValue
                          }
                        >
                          {isPaid
                            ? "Paid"
                            : "Unpaid"}
                        </strong>
                      </div>

                      <div>
                        <span
                          style={
                            styles.previewLabel
                          }
                        >
                          Document
                        </span>

                        <strong
                          style={
                            styles.previewValue
                          }
                        >
                          {requiresDocument
                            ? "Required"
                            : "Optional"}
                        </strong>
                      </div>

                      <div>
                        <span
                          style={
                            styles.previewLabel
                          }
                        >
                          Status
                        </span>

                        <strong
                          style={{
                            ...styles.previewValue,
                            color: isActive
                              ? "#28613d"
                              : "#7b8780",
                          }}
                        >
                          {isActive
                            ? "Active"
                            : "Inactive"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    MODAL FOOTER
                ================================================= */}

                <div
                  style={
                    styles.modalFooter
                  }
                >
                  <div
                    style={
                      styles.footerNote
                    }
                  >
                    <ShieldCheck size={15} />

                    <span>
                      Review policy settings before
                      saving changes.
                    </span>
                  </div>

                  <div
                    className="leave-types-footer-actions"
                    style={
                      styles.modalActions
                    }
                  >
                    <button
                      type="button"
                      style={
                        styles.cancelButton
                      }
                      onClick={closeModal}
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      style={
                        styles.saveButton
                      }
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            style={
                              styles.spinner
                            }
                          />

                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            size={15}
                          />

                          {editingType
                            ? "Save Changes"
                            : "Create Leave Type"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =================================================
            RESPONSIVE CSS
        ================================================= */}

        <style>
          {`
            .leave-types-spin {
              animation: leaveTypesSpin 0.8s linear infinite;
            }

            @keyframes leaveTypesSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }

            .leave-types-summary-grid {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }

            .leave-types-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .leave-types-modal {
              width: min(94vw, 720px);
            }

            .leave-types-hero {
              flex-wrap: wrap;
            }

            .leave-types-hero-action {
              max-width: 100%;
            }

            @media (max-width: 720px) {
              .leave-types-hero {
                flex-direction: column !important;
                align-items: stretch !important;
              }

              .leave-types-hero-action {
                width: 100% !important;
              }
            }

            @media (max-width: 1100px) {
              .leave-types-summary-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }

              .leave-types-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
            }

            @media (max-width: 720px) {
              .leave-types-grid {
                grid-template-columns: 1fr !important;
              }

              .leave-types-summary-grid {
                grid-template-columns: 1fr !important;
              }

              .leave-types-modal {
                width: calc(100vw - 20px) !important;
                max-height: calc(100vh - 20px) !important;
              }

              .leave-types-info-grid {
                grid-template-columns: 1fr !important;
              }

              .leave-types-footer-actions {
                width: 100%;
                display: grid !important;
                grid-template-columns: 1fr 1fr;
              }

              .leave-types-footer-actions button {
                width: 100%;
              }
            }

            @media (max-width: 480px) {
              .leave-types-footer-actions {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </div>
    </AppLayout>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  container: {
    padding: "0 0 3rem",
    color: "#33453a",
  },

  /* =======================================================
     HERO
  ======================================================= */

  hero: {
    marginTop: "1rem",
    marginBottom: "1.4rem",
    padding: "1.8rem",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #173d28 0%, #285d3d 62%, #3b7350 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: "1.5rem",
    boxShadow:
      "0 15px 38px rgba(29,70,45,0.16)",
  },

  heroContent: {
    maxWidth: "700px",
  },

  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    color: "#c9e1d0",
    fontSize: "0.6rem",
    fontWeight: "800",
    letterSpacing: "0.14em",
    marginBottom: "0.65rem",
  },

  eyebrowLine: {
    width: "24px",
    height: "2px",
    backgroundColor: "#b7d7c0",
    borderRadius: "999px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "2.2rem",
    lineHeight: 1.1,
    fontWeight: "800",
    letterSpacing: "-0.035em",
  },

  heroSubtitle: {
    margin: "0.7rem 0 0",
    maxWidth: "650px",
    color: "#d9e9dd",
    fontSize: "0.83rem",
    lineHeight: 1.7,
  },

  heroMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    flexWrap: "wrap",
    marginTop: "1.15rem",
  },

  heroMetaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.32rem",
    color: "#d5e7da",
    fontSize: "0.61rem",
    fontWeight: "650",
  },

  heroSeparator: {
    width: "1px",
    height: "14px",
    backgroundColor:
      "rgba(255,255,255,0.25)",
  },

  heroActionPanel: {
    width: "215px",
    flexShrink: 0,
    padding: "1rem",
    borderRadius: "14px",
    backgroundColor:
      "rgba(255,255,255,0.1)",
    border:
      "1px solid rgba(255,255,255,0.14)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  heroActionIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor:
      "rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.6rem",
  },

  heroActionLabel: {
    color: "#c7dfcd",
    fontSize: "0.53rem",
    fontWeight: "800",
    letterSpacing: "0.1em",
  },

  heroActionValue: {
    marginTop: "0.12rem",
    fontSize: "1.6rem",
    lineHeight: 1,
  },

  heroActionText: {
    color: "#d5e7da",
    fontSize: "0.61rem",
    marginTop: "0.2rem",
    marginBottom: "0.8rem",
  },

  heroCreateButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    width: "100%",
    border: "none",
    borderRadius: "8px",
    padding: "0.55rem 0.7rem",
    backgroundColor: "#ffffff",
    color: "#28613d",
    fontSize: "0.63rem",
    fontWeight: "800",
    cursor: "pointer",
  },

  /* =======================================================
     SUMMARY
  ======================================================= */

  summarySection: {
    marginBottom: "1.4rem",
  },

  summaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.7rem",
    gap: "1rem",
  },

  sectionEyebrow: {
    display: "block",
    color: "#849188",
    fontSize: "0.56rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
    marginBottom: "0.22rem",
  },

  sectionTitle: {
    margin: 0,
    color: "#34463b",
    fontSize: "1rem",
    fontWeight: "800",
  },

  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    border: "1px solid #d5e0d8",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#52635a",
    padding: "0.48rem 0.7rem",
    fontSize: "0.61rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  summaryGrid: {
    display: "grid",
    gap: "0.75rem",
  },

  summaryCard: {
    minWidth: 0,
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "13px",
    padding: "0.85rem",
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
  },

  summaryIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  summaryLabel: {
    display: "block",
    color: "#89958e",
    fontSize: "0.5rem",
    fontWeight: "800",
    letterSpacing: "0.07em",
  },

  summaryValue: {
    display: "block",
    marginTop: "0.1rem",
    color: "#35463c",
    fontSize: "1.18rem",
    lineHeight: 1,
    fontWeight: "800",
  },

  summaryHint: {
    display: "block",
    marginTop: "0.18rem",
    color: "#9aa39e",
    fontSize: "0.53rem",
  },

  /* =======================================================
     DIRECTORY
  ======================================================= */

  directory: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 5px 20px rgba(31,59,41,0.035)",
  },

  directoryHeader: {
    padding: "1rem 1.1rem",
    backgroundColor: "#f8faf8",
    borderBottom: "1px solid #e2e9e4",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
  },

  directoryTitle: {
    margin: 0,
    color: "#34463b",
    fontSize: "0.98rem",
    fontWeight: "800",
  },

  directoryDescription: {
    margin: "0.28rem 0 0",
    color: "#87938c",
    fontSize: "0.64rem",
    lineHeight: 1.5,
  },

  directoryCount: {
    padding: "0.35rem 0.55rem",
    borderRadius: "7px",
    backgroundColor: "#eaf4ed",
    border: "1px solid #d5e7d9",
    color: "#28613d",
    fontSize: "0.57rem",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  grid: {
    display: "grid",
    gap: "0.85rem",
    padding: "1rem",
  },

  /* =======================================================
     CARD
  ======================================================= */

  card: {
    minWidth: 0,
    border: "1px solid #dfe7e2",
    borderRadius: "13px",
    padding: "1rem",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    transition:
      "box-shadow 0.2s ease, border-color 0.2s ease",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.6rem",
  },

  cardIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    minWidth: 0,
  },

  cardIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#eaf4ed",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cardEyebrow: {
    display: "block",
    color: "#89958e",
    fontSize: "0.48rem",
    fontWeight: "800",
    letterSpacing: "0.09em",
  },

  cardTitle: {
    margin: "0.08rem 0 0",
    color: "#34463b",
    fontSize: "0.84rem",
    fontWeight: "800",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.28rem",
    padding: "0.28rem 0.45rem",
    border: "1px solid",
    borderRadius: "999px",
    fontSize: "0.49rem",
    fontWeight: "800",
    letterSpacing: "0.05em",
    flexShrink: 0,
  },

  statusDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
  },

  cardDescription: {
    margin: "0.75rem 0",
    color: "#7d8982",
    fontSize: "0.65rem",
    lineHeight: 1.55,
    minHeight: "31px",
  },

  allocationBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    padding: "0.7rem",
    borderRadius: "9px",
    backgroundColor: "#f3f8f4",
    border: "1px solid #dce9df",
  },

  allocationIcon: {
    width: "33px",
    height: "33px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  allocationContent: {
    display: "flex",
    flexDirection: "column",
  },

  allocationLabel: {
    color: "#7c8c81",
    fontSize: "0.48rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },

  allocationValue: {
    marginTop: "0.1rem",
    color: "#28613d",
    fontSize: "1rem",
    fontWeight: "800",
  },

  allocationUnit: {
    marginLeft: "0.25rem",
    color: "#809087",
    fontSize: "0.54rem",
    fontWeight: "600",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "0.55rem",
    marginTop: "0.65rem",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.55rem",
    borderRadius: "8px",
    backgroundColor: "#fafbfa",
    border: "1px solid #e6ebe7",
  },

  infoIcon: {
    width: "27px",
    height: "27px",
    borderRadius: "7px",
    backgroundColor: "#eef3ef",
    color: "#64756a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  infoLabel: {
    display: "block",
    color: "#98a19c",
    fontSize: "0.44rem",
    fontWeight: "800",
    letterSpacing: "0.06em",
  },

  infoValue: {
    display: "block",
    marginTop: "0.08rem",
    color: "#506057",
    fontSize: "0.62rem",
    fontWeight: "750",
  },

  cardActions: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "0.5rem",
    marginTop: "0.75rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid #e6ebe7",
  },

  editButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.3rem",
    border: "1px solid #cbdcd0",
    borderRadius: "7px",
    backgroundColor: "#f4f9f5",
    color: "#28613d",
    padding: "0.5rem 0.5rem",
    fontSize: "0.59rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  statusButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.3rem",
    border: "1px solid",
    borderRadius: "7px",
    padding: "0.5rem 0.5rem",
    fontSize: "0.59rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  /* =======================================================
     EMPTY / LOADING
  ======================================================= */

  loadingState: {
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem",
  },

  loadingSpinner: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "3px solid #dce8df",
    borderTopColor: "#28613d",
    animation:
      "leaveTypesSpin 0.75s linear infinite",
    marginBottom: "0.75rem",
  },

  loadingTitle: {
    color: "#45564c",
    fontSize: "0.75rem",
    fontWeight: "750",
  },

  loadingText: {
    color: "#929d96",
    fontSize: "0.61rem",
    marginTop: "0.2rem",
  },

  emptyState: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "15px",
    backgroundColor: "#edf3ee",
    color: "#6e7e74",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.75rem",
  },

  emptyEyebrow: {
    color: "#89958e",
    fontSize: "0.54rem",
    fontWeight: "800",
    letterSpacing: "0.11em",
  },

  emptyTitle: {
    margin: "0.25rem 0 0",
    color: "#35463c",
    fontSize: "0.95rem",
    fontWeight: "800",
  },

  emptyText: {
    maxWidth: "390px",
    margin: "0.35rem 0 0.8rem",
    color: "#8b968f",
    fontSize: "0.65rem",
    lineHeight: 1.55,
  },

  emptyButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#28613d",
    color: "#ffffff",
    padding: "0.55rem 0.75rem",
    fontSize: "0.61rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  infoStrip: {
    margin: "0 1rem 1rem",
    padding: "0.75rem",
    borderRadius: "9px",
    backgroundColor: "#f4f8f5",
    border: "1px solid #dce8df",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.55rem",
  },

  infoStripIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "7px",
    backgroundColor: "#e7f2ea",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  infoStripTitle: {
    display: "block",
    color: "#45584b",
    fontSize: "0.62rem",
    fontWeight: "800",
  },

  infoStripText: {
    margin: "0.18rem 0 0",
    color: "#859188",
    fontSize: "0.57rem",
    lineHeight: 1.5,
  },

  /* =======================================================
     MODAL
  ======================================================= */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor:
      "rgba(18,35,24,0.68)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 1200,
  },

  modal: {
    backgroundColor: "#ffffff",
    border: "1px solid #dce5df",
    borderRadius: "18px",
    maxHeight: "calc(100vh - 32px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow:
      "0 28px 75px rgba(20,45,29,0.25)",
  },

  modalHeader: {
    padding: "1rem 1.15rem",
    backgroundColor: "#f7faf8",
    borderBottom: "1px solid #e1e8e3",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    flexShrink: 0,
    minHeight: "70px",
    boxSizing: "border-box",
  },

  modalHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    minWidth: 0,
  },

  modalIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#e7f3ea",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalEyebrow: {
    display: "block",
    color: "#89958e",
    fontSize: "0.5rem",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "0.15rem",
  },

  modalTitle: {
    margin: 0,
    color: "#34463b",
    fontSize: "0.98rem",
    fontWeight: "800",
  },

  closeButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "transparent",
    color: "#75827a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },

  modalBody: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },

  formSection: {
    border: "1px solid #dfe7e2",
    borderRadius: "11px",
    padding: "0.85rem",
  },

  formSectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.55rem",
    marginBottom: "0.75rem",
  },

  sectionNumber: {
    width: "27px",
    height: "27px",
    borderRadius: "8px",
    backgroundColor: "#e9f4ec",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.55rem",
    fontWeight: "800",
    flexShrink: 0,
  },

  formSectionTitle: {
    display: "block",
    color: "#34463b",
    fontSize: "0.7rem",
    fontWeight: "800",
  },

  formSectionText: {
    display: "block",
    color: "#8b968f",
    fontSize: "0.57rem",
    marginTop: "0.12rem",
    lineHeight: 1.4,
  },

  formFields: {
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#58675e",
    fontSize: "0.62rem",
    fontWeight: "750",
  },

  required: {
    color: "#a33b3b",
    marginLeft: "0.15rem",
  },

  charCount: {
    color: "#98a19c",
    fontSize: "0.52rem",
  },

  input: {
    width: "100%",
    height: "40px",
    boxSizing: "border-box",
    border: "1px solid #d2ddd6",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#35463c",
    padding: "0.55rem 0.7rem",
    fontSize: "0.68rem",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d2ddd6",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#35463c",
    padding: "0.6rem 0.7rem",
    fontSize: "0.68rem",
    lineHeight: 1.5,
    outline: "none",
    resize: "vertical",
  },

  allocationInputWrapper: {
    position: "relative",
  },

  inputLeadingIcon: {
    position: "absolute",
    left: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#718078",
    pointerEvents: "none",
  },

  inputSuffix: {
    position: "absolute",
    right: "0.7rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#829087",
    fontSize: "0.5rem",
    fontWeight: "800",
    pointerEvents: "none",
  },

  helperText: {
    color: "#98a19c",
    fontSize: "0.53rem",
    marginTop: "0.25rem",
  },

  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  optionCard: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    padding: "0.65rem",
    border: "1px solid",
    borderRadius: "9px",
    cursor: "pointer",
    transition:
      "background-color 0.15s ease",
  },

  checkbox: {
    width: "15px",
    height: "15px",
    accentColor: "#28613d",
    flexShrink: 0,
    cursor: "pointer",
  },

  optionIcon: {
    width: "29px",
    height: "29px",
    borderRadius: "7px",
    backgroundColor: "#edf3ee",
    color: "#64756a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  optionContent: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    flex: 1,
  },

  optionTitle: {
    color: "#45554c",
    fontSize: "0.62rem",
    fontWeight: "750",
  },

  optionDescription: {
    color: "#8d9891",
    fontSize: "0.53rem",
    marginTop: "0.1rem",
    lineHeight: 1.35,
  },

  optionState: {
    fontSize: "0.51rem",
    fontWeight: "800",
    flexShrink: 0,
  },

  previewCard: {
    borderRadius: "10px",
    backgroundColor: "#f1f7f3",
    border: "1px solid #d9e8dd",
    padding: "0.8rem",
  },

  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.7rem",
  },

  previewIcon: {
    width: "29px",
    height: "29px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  previewEyebrow: {
    display: "block",
    color: "#819087",
    fontSize: "0.47rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },

  previewTitle: {
    display: "block",
    color: "#34463b",
    fontSize: "0.67rem",
    marginTop: "0.08rem",
  },

  previewGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "0.5rem",
  },

  previewLabel: {
    display: "block",
    color: "#89968e",
    fontSize: "0.48rem",
  },

  previewValue: {
    display: "block",
    marginTop: "0.1rem",
    color: "#506057",
    fontSize: "0.58rem",
    fontWeight: "750",
  },

  modalFooter: {
    padding: "0.8rem 1rem",
    backgroundColor: "#f8faf8",
    borderTop: "1px solid #e1e8e3",
    flexShrink: 0,
  },

  footerNote: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    color: "#829087",
    fontSize: "0.54rem",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5rem",
    marginTop: "0.65rem",
  },

  cancelButton: {
    border: "1px solid #d2ddd6",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#647168",
    padding: "0.55rem 0.8rem",
    fontSize: "0.61rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  saveButton: {
    minWidth: "125px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.3rem",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#28613d",
    color: "#ffffff",
    padding: "0.55rem 0.8rem",
    fontSize: "0.61rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  spinner: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border:
      "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#ffffff",
    display: "inline-block",
    animation:
      "leaveTypesSpin 0.7s linear infinite",
  },
};

export default LeaveTypes;