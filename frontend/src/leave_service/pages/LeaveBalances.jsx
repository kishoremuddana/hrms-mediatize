import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  UserRound,
  CalendarDays,
  Pencil,
  X,
  ChevronDown,
  WalletCards,
  RefreshCw,
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock3,
  TrendingUp,
  ShieldCheck,
  Save,
  Calculator,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { showSuccess, showError } from "../../shared/utils/toast";
import {
  getEmployeeBalances,
  updateEmployeeBalance,
} from "../services/leaveApi";
import { getEmployees } from "../../employee_service/services/employeeApi";

function LeaveBalances() {
  const currentYear = new Date().getFullYear();

  /* =========================================================
     EMPLOYEE SEARCH
  ========================================================= */

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* =========================================================
     SELECTED EMPLOYEE / YEAR
  ========================================================= */

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  /* =========================================================
     BALANCES
  ========================================================= */

  const [balances, setBalances] = useState([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  /* =========================================================
     EDIT MODAL
  ========================================================= */

  const [editingBalance, setEditingBalance] = useState(null);
  const [allocatedDays, setAllocatedDays] = useState("");
  const [usedDays, setUsedDays] = useState("");
  const [pendingDays, setPendingDays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const searchRef = useRef(null);

  /* =========================================================
     CLOSE SEARCH DROPDOWN
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     FETCH EMPLOYEES
  ========================================================= */

  const fetchEmployeeOptions = useCallback(
    async (query) => {
      setSearchLoading(true);

      try {
        const params = {
          limit: 12,
        };

        if (query && query.trim()) {
          params.search = query.trim();
        }

        const res = await getEmployees(params);

        setSearchResults(
          res.data?.items || []
        );
      } catch (err) {
        console.error(
          "Failed to search employees:",
          err
        );
      } finally {
        setSearchLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchEmployeeOptions("");
  }, [fetchEmployeeOptions]);

  /* =========================================================
     DEBOUNCED SEARCH
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dropdownOpen) {
        fetchEmployeeOptions(searchTerm);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    dropdownOpen,
    fetchEmployeeOptions,
  ]);

  /* =========================================================
     FETCH BALANCES
  ========================================================= */

  const fetchBalances = useCallback(
    async (employeeId, year) => {
      if (!employeeId) return;

      setBalancesLoading(true);
      setHasSearched(true);

      try {
        const res =
          await getEmployeeBalances(
            employeeId,
            { year }
          );

        setBalances(
          res.data || []
        );
      } catch (err) {
        console.error(
          "Failed to fetch employee balances",
          err
        );

        const errText =
          err.response?.data?.detail ||
          "Failed to load leave balances.";

        showError(errText);
        setBalances([]);
      } finally {
        setBalancesLoading(false);
      }
    },
    []
  );

  /* =========================================================
     SELECT EMPLOYEE
  ========================================================= */

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);

    setSearchTerm(
      `${emp.first_name} ${emp.last_name} (${emp.employee_code})`
    );

    setDropdownOpen(false);

    fetchBalances(
      emp.id,
      selectedYear
    );
  };

  /* =========================================================
     CHANGE YEAR
  ========================================================= */

  const handleYearChange = (e) => {
    const newYear = Number(
      e.target.value
    );

    setSelectedYear(newYear);

    if (selectedEmployee) {
      fetchBalances(
        selectedEmployee.id,
        newYear
      );
    }
  };

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const openEditModal = (balance) => {
    setEditingBalance(balance);

    setAllocatedDays(
      String(balance.allocated_days)
    );

    setUsedDays(
      String(balance.used_days)
    );

    setPendingDays(
      String(balance.pending_days)
    );
  };

  /* =========================================================
     UPDATE BALANCE
  ========================================================= */

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (
      !editingBalance ||
      !selectedEmployee
    ) {
      return;
    }

    setSubmitting(true);

    try {
      await updateEmployeeBalance(
        selectedEmployee.id,
        editingBalance.leave_type_id,
        {
          allocated_days:
            Number(allocatedDays),

          used_days:
            Number(
              editingBalance.used_days
            ),

          pending_days:
            Number(
              editingBalance.pending_days
            ),
        },
        {
          year: selectedYear,
        }
      );

      showSuccess(
        "Leave balance updated successfully."
      );

      setEditingBalance(null);

      fetchBalances(
        selectedEmployee.id,
        selectedYear
      );
    } catch (err) {
      console.error(
        "Failed to update balance",
        err
      );

      const errText =
        err.response?.data?.detail ||
        "Failed to update leave balance.";

      showError(errText);
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     YEAR OPTIONS
  ========================================================= */

  const yearOptions = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
  ];

  /* =========================================================
     EDIT MODAL CALCULATION
  ========================================================= */

  const calcAllocated =
    Number(allocatedDays) || 0;

  const calcUsed =
    Number(
      editingBalance?.used_days
    ) || 0;

  const calcPending =
    Number(
      editingBalance?.pending_days
    ) || 0;

  const calculatedRemaining =
    Number(
      (
        calcAllocated -
        calcUsed -
        calcPending
      ).toFixed(2)
    );

  /* =========================================================
     DERIVED SUMMARY
  ========================================================= */

  const totalAllocated = balances.reduce(
    (sum, item) =>
      sum +
      Number(item.allocated_days || 0),
    0
  );

  const totalUsed = balances.reduce(
    (sum, item) =>
      sum +
      Number(item.used_days || 0),
    0
  );

  const totalPending = balances.reduce(
    (sum, item) =>
      sum +
      Number(item.pending_days || 0),
    0
  );

  const totalRemaining = balances.reduce(
    (sum, item) => {
      const remaining =
        item.remaining_days ??
        (
          Number(item.allocated_days || 0) -
          Number(item.used_days || 0) -
          Number(item.pending_days || 0)
        );

      return sum + Number(remaining);
    },
    0
  );

  return (
    <AppLayout title="Employee Leave Balances">
      <div style={styles.container}>
        {/* =================================================
            BACK NAVIGATION
        ================================================= */}

        <BackToDashboard
          to="/hr/leave-types"
          role="HR"
          icon={ArrowLeft}
        />

        {/* =================================================
            HERO
        ================================================= */}

        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.eyebrow}>
              <span
                style={styles.eyebrowLine}
              />
              HR CONFIGURATION
            </div>

            <h1 style={styles.heroTitle}>
              Employee Leave Balances
            </h1>

            <p style={styles.heroSubtitle}>
              Search employee records, review annual
              leave allocations, and manage available
              balances from a centralized HR workspace.
            </p>

            <div style={styles.heroMeta}>
              <div style={styles.heroMetaItem}>
                <Users size={15} />
                Employee Records
              </div>

              <span
                style={styles.heroDivider}
              />

              <div style={styles.heroMetaItem}>
                <WalletCards size={15} />
                Leave Allocation
              </div>

              <span
                style={styles.heroDivider}
              />

              <div style={styles.heroMetaItem}>
                <ShieldCheck size={15} />
                HR Controlled
              </div>
            </div>
          </div>

          <div style={styles.heroPanel}>
            <div style={styles.heroPanelIcon}>
              <WalletCards size={25} />
            </div>

            <span
              style={styles.heroPanelLabel}
            >
              ALLOCATION YEAR
            </span>

            <strong
              style={styles.heroPanelYear}
            >
              {selectedYear}
            </strong>

            <span
              style={styles.heroPanelText}
            >
              Select an employee below to manage
              their leave allocation.
            </span>
          </div>
        </section>

        {/* =================================================
            EMPLOYEE EXPLORER
        ================================================= */}

        <section style={styles.explorer}>
          <div style={styles.explorerHeader}>
            <div>
              <span
                style={styles.sectionEyebrow}
              >
                EMPLOYEE EXPLORER
              </span>

              <h2
                style={styles.sectionTitle}
              >
                Select Employee
              </h2>

              <p
                style={styles.sectionDescription}
              >
                Find an employee and choose the
                allocation year to view their leave
                balances.
              </p>
            </div>

            <div style={styles.explorerBadge}>
              <Search size={14} />
              Search & Review
            </div>
          </div>

          <div style={styles.explorerControls}>
            {/* Employee Search */}

            <div
              style={styles.searchContainer}
              ref={searchRef}
            >
              <label
                style={styles.controlLabel}
              >
                Employee
              </label>

              <div
                style={styles.searchWrapper}
              >
                <Search
                  size={18}
                  style={styles.searchIcon}
                />

                <input
                  type="text"
                  style={styles.searchInput}
                  placeholder="Search name, employee code, or email..."
                  value={searchTerm}
                  onFocus={() =>
                    setDropdownOpen(true)
                  }
                  onChange={(e) => {
                    setSearchTerm(
                      e.target.value
                    );

                    setDropdownOpen(true);
                  }}
                  aria-label="Search employee"
                />

                <ChevronDown
                  size={17}
                  style={
                    styles.searchChevron
                  }
                />
              </div>

              {/* Dropdown */}

              {dropdownOpen && (
                <div
                  style={styles.dropdown}
                >
                  <div
                    style={
                      styles.dropdownHeader
                    }
                  >
                    <span>
                      Employee Directory
                    </span>

                    <span>
                      {searchResults.length}
                    </span>
                  </div>

                  {searchLoading ? (
                    <div
                      style={
                        styles.dropdownMessage
                      }
                    >
                      <span
                        style={
                          styles.smallSpinner
                        }
                      />

                      Searching employees...
                    </div>
                  ) : searchResults.length ===
                    0 ? (
                    <div
                      style={
                        styles.dropdownMessage
                      }
                    >
                      No matching employees found
                    </div>
                  ) : (
                    searchResults.map(
                      (emp) => (
                        <button
                          type="button"
                          key={emp.id}
                          style={{
                            ...styles.dropdownItem,
                            backgroundColor:
                              selectedEmployee?.id ===
                              emp.id
                                ? "#edf6ef"
                                : "#ffffff",
                          }}
                          onClick={() =>
                            handleSelectEmployee(
                              emp
                            )
                          }
                        >
                          <div
                            style={
                              styles.itemAvatar
                            }
                          >
                            {emp.profile_photo_url ? (
                              <img
                                src={
                                  emp.profile_photo_url
                                }
                                alt={
                                  emp.first_name
                                }
                                style={
                                  styles.avatarImg
                                }
                              />
                            ) : (
                              <UserRound
                                size={17}
                                color="#6f8175"
                              />
                            )}
                          </div>

                          <div
                            style={
                              styles.itemMeta
                            }
                          >
                            <strong
                              style={
                                styles.itemName
                              }
                            >
                              {emp.first_name}{" "}
                              {emp.last_name}
                            </strong>

                            <span
                              style={
                                styles.itemSubText
                              }
                            >
                              {
                                emp.employee_code
                              }{" "}
                              •{" "}
                              {emp.email}
                            </span>
                          </div>

                          <ChevronDown
                            size={15}
                            style={
                              styles.itemArrow
                            }
                          />
                        </button>
                      )
                    )
                  )}
                </div>
              )}
            </div>

            {/* Year */}

            <div
              style={styles.yearContainer}
            >
              <label
                style={styles.controlLabel}
              >
                Allocation Year
              </label>

              <div
                style={styles.yearWrapper}
              >
                <CalendarDays
                  size={17}
                  style={styles.yearIcon}
                />

                <select
                  style={styles.yearSelect}
                  value={selectedYear}
                  onChange={
                    handleYearChange
                  }
                  aria-label="Select year"
                >
                  {yearOptions.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SELECTED EMPLOYEE
        ================================================= */}

        {selectedEmployee && (
          <section
            style={styles.employeeCard}
          >
            <div
              style={styles.employeeIdentity}
            >
              <div
                style={styles.employeeAvatar}
              >
                {selectedEmployee.profile_photo_url ? (
                  <img
                    src={
                      selectedEmployee.profile_photo_url
                    }
                    alt={
                      selectedEmployee.first_name
                    }
                    style={styles.avatarImg}
                  />
                ) : (
                  <span
                    style={
                      styles.employeeInitials
                    }
                  >
                    {selectedEmployee.first_name?.[0]}
                    {selectedEmployee.last_name?.[0]}
                  </span>
                )}
              </div>

              <div>
                <span
                  style={styles.employeeLabel}
                >
                  SELECTED EMPLOYEE
                </span>

                <h2
                  style={
                    styles.employeeName
                  }
                >
                  {selectedEmployee.first_name}{" "}
                  {selectedEmployee.last_name}
                </h2>

                <div
                  style={
                    styles.employeeDetails
                  }
                >
                  <span
                    style={styles.codeBadge}
                  >
                    {
                      selectedEmployee.employee_code
                    }
                  </span>

                  <span
                    style={styles.emailText}
                  >
                    {selectedEmployee.email}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={styles.employeeActions}
            >
              <div
                style={styles.selectedYearBox}
              >
                <span>YEAR</span>
                <strong>
                  {selectedYear}
                </strong>
              </div>

              <button
                type="button"
                style={
                  styles.refreshButton
                }
                onClick={() =>
                  fetchBalances(
                    selectedEmployee.id,
                    selectedYear
                  )
                }
                disabled={balancesLoading}
              >
                <RefreshCw
                  size={15}
                  className={
                    balancesLoading
                      ? "leave-balance-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {balancesLoading ? (
          <div style={styles.loadingArea}>
            <div style={styles.loadingHeader}>
              <div
                style={
                  styles.loadingBarLarge
                }
              />

              <div
                style={
                  styles.loadingBarSmall
                }
              />
            </div>

            <div
              style={styles.loadingGrid}
            >
              <div
                style={styles.loadingCard}
              />
              <div
                style={styles.loadingCard}
              />
              <div
                style={styles.loadingCard}
              />
            </div>

            <div
              style={styles.loadingTable}
            />
          </div>
        ) : !selectedEmployee ? (
          /* =================================================
             INITIAL STATE
          ================================================= */

          <section
            style={styles.initialState}
          >
            <div
              style={styles.initialIcon}
            >
              <Search size={25} />
            </div>

            <span
              style={styles.initialEyebrow}
            >
              GET STARTED
            </span>

            <h3
              style={styles.initialTitle}
            >
              Select an Employee
            </h3>

            <p
              style={styles.initialText}
            >
              Search for an employee above to view
              their annual leave allocation and
              balance details.
            </p>
          </section>
        ) : balances.length === 0 &&
          hasSearched ? (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <section
            style={styles.emptyState}
          >
            <div
              style={styles.emptyIcon}
            >
              <WalletCards size={25} />
            </div>

            <span
              style={styles.emptyEyebrow}
            >
              NO ALLOCATION
            </span>

            <h3
              style={styles.emptyTitle}
            >
              No Leave Balances Found
            </h3>

            <p
              style={styles.emptyText}
            >
              No leave balance has been configured
              for{" "}
              <strong>
                {selectedEmployee.first_name}{" "}
                {selectedEmployee.last_name}
              </strong>{" "}
              for the year{" "}
              <strong>{selectedYear}</strong>.
            </p>
          </section>
        ) : (
          <>
            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section style={styles.summarySection}>
              <div style={styles.sectionHeader}>
                <div>
                  <span
                    style={
                      styles.sectionEyebrow
                    }
                  >
                    BALANCE OVERVIEW
                  </span>

                  <h2
                    style={
                      styles.sectionTitle
                    }
                  >
                    Annual Allocation Summary
                  </h2>
                </div>
              </div>

              <div
                className="leave-balance-summary-grid"
                style={styles.summaryGrid}
              >
                <div
                  style={styles.summaryMetric}
                >
                  <div
                    style={{
                      ...styles.metricIcon,
                      backgroundColor:
                        "#e7f3ea",
                      color: "#28613d",
                    }}
                  >
                    <WalletCards
                      size={19}
                    />
                  </div>

                  <div>
                    <span
                      style={
                        styles.metricLabel
                      }
                    >
                      TOTAL ALLOCATED
                    </span>

                    <strong
                      style={
                        styles.metricValue
                      }
                    >
                      {totalAllocated}
                    </strong>

                    <span
                      style={
                        styles.metricHint
                      }
                    >
                      Days assigned
                    </span>
                  </div>
                </div>

                <div
                  style={styles.summaryMetric}
                >
                  <div
                    style={{
                      ...styles.metricIcon,
                      backgroundColor:
                        "#f1f4f2",
                      color: "#607068",
                    }}
                  >
                    <TrendingUp
                      size={19}
                    />
                  </div>

                  <div>
                    <span
                      style={
                        styles.metricLabel
                      }
                    >
                      USED
                    </span>

                    <strong
                      style={
                        styles.metricValue
                      }
                    >
                      {totalUsed}
                    </strong>

                    <span
                      style={
                        styles.metricHint
                      }
                    >
                      Days consumed
                    </span>
                  </div>
                </div>

                <div
                  style={styles.summaryMetric}
                >
                  <div
                    style={{
                      ...styles.metricIcon,
                      backgroundColor:
                        "#fff6df",
                      color: "#956c13",
                    }}
                  >
                    <Clock3 size={19} />
                  </div>

                  <div>
                    <span
                      style={
                        styles.metricLabel
                      }
                    >
                      PENDING
                    </span>

                    <strong
                      style={
                        styles.metricValue
                      }
                    >
                      {totalPending}
                    </strong>

                    <span
                      style={
                        styles.metricHint
                      }
                    >
                      Awaiting approval
                    </span>
                  </div>
                </div>

                <div
                  style={styles.summaryMetric}
                >
                  <div
                    style={{
                      ...styles.metricIcon,
                      backgroundColor:
                        totalRemaining > 0
                          ? "#e7f3ea"
                          : "#fbeaea",
                      color:
                        totalRemaining > 0
                          ? "#28613d"
                          : "#a33b3b",
                    }}
                  >
                    <CheckCircle2
                      size={19}
                    />
                  </div>

                  <div>
                    <span
                      style={
                        styles.metricLabel
                      }
                    >
                      REMAINING
                    </span>

                    <strong
                      style={{
                        ...styles.metricValue,
                        color:
                          totalRemaining > 0
                            ? "#28613d"
                            : "#a33b3b",
                      }}
                    >
                      {totalRemaining}
                    </strong>

                    <span
                      style={
                        styles.metricHint
                      }
                    >
                      Available days
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <section
              className="employee-desktop-table"
              style={styles.tableCard}
            >
              <div
                style={styles.tableHeader}
              >
                <div>
                  <span
                    style={
                      styles.sectionEyebrow
                    }
                  >
                    LEAVE ALLOCATION
                  </span>

                  <h2
                    style={
                      styles.tableTitle
                    }
                  >
                    Leave Balance Directory
                  </h2>
                </div>

                <div
                  style={
                    styles.tableYearBadge
                  }
                >
                  <CalendarDays
                    size={14}
                  />
                  {selectedYear}
                </div>
              </div>

              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={styles.table}
                >
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Leave Type
                      </th>

                      <th style={styles.th}>
                        Year
                      </th>

                      <th style={styles.th}>
                        Allocated
                      </th>

                      <th style={styles.th}>
                        Used
                      </th>

                      <th style={styles.th}>
                        Pending
                      </th>

                      <th style={styles.th}>
                        Remaining
                      </th>

                      <th
                        style={{
                          ...styles.th,
                          textAlign: "right",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {balances.map(
                      (balance) => {
                        const remaining =
                          balance.remaining_days ??
                          (
                            Number(
                              balance.allocated_days ||
                                0
                            ) -
                            Number(
                              balance.used_days ||
                                0
                            ) -
                            Number(
                              balance.pending_days ||
                                0
                            )
                          );

                        return (
                          <tr
                            key={
                              balance.id ||
                              balance.leave_type_id
                            }
                            style={styles.tr}
                          >
                            <td
                              style={
                                styles.td
                              }
                            >
                              <div
                                style={
                                  styles.leaveTypeCell
                                }
                              >
                                <div
                                  style={
                                    styles.leaveTypeIcon
                                  }
                                >
                                  <WalletCards
                                    size={16}
                                  />
                                </div>

                                <strong
                                  style={
                                    styles.leaveTypeName
                                  }
                                >
                                  {balance.leave_type_name ||
                                    "Leave"}
                                </strong>
                              </div>
                            </td>

                            <td
                              style={
                                styles.tdMuted
                              }
                            >
                              {balance.year}
                            </td>

                            <td
                              style={
                                styles.tdNumber
                              }
                            >
                              {balance.allocated_days}
                            </td>

                            <td
                              style={
                                styles.tdNumber
                              }
                            >
                              {balance.used_days}
                            </td>

                            <td
                              style={
                                styles.tdNumber
                              }
                            >
                              {balance.pending_days}
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              <span
                                style={{
                                  ...styles.remainingBadge,
                                  backgroundColor:
                                    Number(
                                      remaining
                                    ) > 0
                                      ? "#e8f5ec"
                                      : "#fbeaea",
                                  color:
                                    Number(
                                      remaining
                                    ) > 0
                                      ? "#28613d"
                                      : "#a33b3b",
                                }}
                              >
                                {remaining}
                              </span>
                            </td>

                            <td
                              style={{
                                ...styles.td,
                                textAlign:
                                  "right",
                              }}
                            >
                              <button
                                type="button"
                                style={
                                  styles.editButton
                                }
                                onClick={() =>
                                  openEditModal(
                                    balance
                                  )
                                }
                              >
                                <Pencil
                                  size={14}
                                />

                                Edit Balance
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <section
              className="employee-mobile-cards"
              style={styles.mobileSection}
            >
              <div
                style={styles.mobileSectionHeader}
              >
                <div>
                  <span
                    style={
                      styles.sectionEyebrow
                    }
                  >
                    LEAVE ALLOCATION
                  </span>

                  <h2
                    style={
                      styles.tableTitle
                    }
                  >
                    Balance Directory
                  </h2>
                </div>

                <span
                  style={
                    styles.tableYearBadge
                  }
                >
                  {selectedYear}
                </span>
              </div>

              {balances.map(
                (balance) => {
                  const remaining =
                    balance.remaining_days ??
                    (
                      Number(
                        balance.allocated_days ||
                          0
                      ) -
                      Number(
                        balance.used_days ||
                          0
                      ) -
                      Number(
                        balance.pending_days ||
                          0
                      )
                    );

                  return (
                    <article
                      key={
                        balance.id ||
                        balance.leave_type_id
                      }
                      style={
                        styles.mobileCard
                      }
                    >
                      <div
                        style={
                          styles.mobileCardHeader
                        }
                      >
                        <div
                          style={
                            styles.mobileLeaveIdentity
                          }
                        >
                          <div
                            style={
                              styles.leaveTypeIcon
                            }
                          >
                            <WalletCards
                              size={16}
                            />
                          </div>

                          <div>
                            <h3
                              style={
                                styles.mobileCardTitle
                              }
                            >
                              {balance.leave_type_name ||
                                "Leave"}
                            </h3>

                            <span
                              style={
                                styles.mobileCardYear
                              }
                            >
                              Allocation Year{" "}
                              {balance.year}
                            </span>
                          </div>
                        </div>

                        <span
                          style={{
                            ...styles.remainingBadge,
                            backgroundColor:
                              Number(
                                remaining
                              ) > 0
                                ? "#e8f5ec"
                                : "#fbeaea",
                            color:
                              Number(
                                remaining
                              ) > 0
                                ? "#28613d"
                                : "#a33b3b",
                          }}
                        >
                          {remaining} left
                        </span>
                      </div>

                      <div
                        style={
                          styles.mobileMetrics
                        }
                      >
                        <div
                          style={
                            styles.mobileMetric
                          }
                        >
                          <span>
                            Allocated
                          </span>

                          <strong>
                            {
                              balance.allocated_days
                            }
                          </strong>
                        </div>

                        <div
                          style={
                            styles.mobileMetric
                          }
                        >
                          <span>Used</span>

                          <strong>
                            {
                              balance.used_days
                            }
                          </strong>
                        </div>

                        <div
                          style={
                            styles.mobileMetric
                          }
                        >
                          <span>Pending</span>

                          <strong>
                            {
                              balance.pending_days
                            }
                          </strong>
                        </div>

                        <div
                          style={
                            styles.mobileMetric
                          }
                        >
                          <span>
                            Remaining
                          </span>

                          <strong
                            style={{
                              color:
                                Number(
                                  remaining
                                ) > 0
                                  ? "#28613d"
                                  : "#a33b3b",
                            }}
                          >
                            {remaining}
                          </strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        style={
                          styles.mobileEditButton
                        }
                        onClick={() =>
                          openEditModal(
                            balance
                          )
                        }
                      >
                        <Pencil
                          size={14}
                        />

                        Edit Balance
                      </button>
                    </article>
                  );
                }
              )}
            </section>
          </>
        )}

        {/* =================================================
            EDIT BALANCE MODAL
        ================================================= */}

        {editingBalance && (
          <div
            style={styles.modalOverlay}
            onClick={() =>
              !submitting &&
              setEditingBalance(null)
            }
          >
            <div
              className="leave-balance-modal"
              style={styles.modal}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* Modal Header */}

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
                    <Calculator
                      size={20}
                    />
                  </div>

                  <div>
                    <span
                      style={
                        styles.modalEyebrow
                      }
                    >
                      HR BALANCE CONFIGURATION
                    </span>

                    <h2
                      style={
                        styles.modalTitle
                      }
                    >
                      Update Leave Balance
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  style={styles.closeButton}
                  onClick={() =>
                    !submitting &&
                    setEditingBalance(
                      null
                    )
                  }
                  disabled={submitting}
                  aria-label="Close"
                >
                  <X size={19} />
                </button>
              </div>

              {/* Form */}

              <form
                onSubmit={
                  handleUpdateSubmit
                }
                style={
                  styles.formContent
                }
              >
                <div
                  style={styles.modalBody}
                >
                  {/* Employee Context */}

                  <div
                    style={
                      styles.modalContext
                    }
                  >
                    <div
                      style={
                        styles.modalContextIcon
                      }
                    >
                      <UserRound
                        size={17}
                      />
                    </div>

                    <div>
                      <span
                        style={
                          styles.modalContextLabel
                        }
                      >
                        EMPLOYEE
                      </span>

                      <strong
                        style={
                          styles.modalContextName
                        }
                      >
                        {
                          selectedEmployee?.first_name
                        }{" "}
                        {
                          selectedEmployee?.last_name
                        }
                      </strong>

                      <span
                        style={
                          styles.modalContextCode
                        }
                      >
                        {
                          selectedEmployee?.employee_code
                        }{" "}
                        •{" "}
                        {
                          editingBalance.leave_type_name
                        }{" "}
                        • {selectedYear}
                      </span>
                    </div>
                  </div>

                  {/* Allocation */}

                  <div
                    style={
                      styles.formSection
                    }
                  >
                    <div
                      style={
                        styles.formSectionHeader
                      }
                    >
                      <div
                        style={
                          styles.formSectionNumber
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
                          Leave Allocation
                        </strong>

                        <span
                          style={
                            styles.formSectionText
                          }
                        >
                          Adjust the annual allocated
                          leave days.
                        </span>
                      </div>
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={styles.label}
                      >
                        Allocated Days
                        <span
                          style={
                            styles.required
                          }
                        >
                          *
                        </span>
                      </label>

                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        style={
                          styles.modalInput
                        }
                        value={
                          allocatedDays
                        }
                        onChange={(e) =>
                          setAllocatedDays(
                            e.target.value
                          )
                        }
                        required
                      />

                      <span
                        style={
                          styles.helperText
                        }
                      >
                        Use 0.5 increments for half-day
                        allocation where applicable.
                      </span>
                    </div>
                  </div>

                  {/* System Values */}

                  <div
                    style={
                      styles.formSection
                    }
                  >
                    <div
                      style={
                        styles.formSectionHeader
                      }
                    >
                      <div
                        style={
                          styles.formSectionNumber
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
                          Current Usage
                        </strong>

                        <span
                          style={
                            styles.formSectionText
                          }
                        >
                          These values are controlled by
                          the leave system.
                        </span>
                      </div>
                    </div>

                    <div
                      className="leave-balance-system-grid"
                      style={
                        styles.systemGrid
                      }
                    >
                      <div
                        style={
                          styles.readOnlyCard
                        }
                      >
                        <div
                          style={
                            styles.readOnlyTop
                          }
                        >
                          <span
                            style={
                              styles.readOnlyLabel
                            }
                          >
                            USED DAYS
                          </span>

                          <span
                            style={
                              styles.readOnlyBadge
                            }
                          >
                            Read-only
                          </span>
                        </div>

                        <strong
                          style={
                            styles.readOnlyValue
                          }
                        >
                          {
                            editingBalance.used_days
                          }
                        </strong>
                      </div>

                      <div
                        style={
                          styles.readOnlyCard
                        }
                      >
                        <div
                          style={
                            styles.readOnlyTop
                          }
                        >
                          <span
                            style={
                              styles.readOnlyLabel
                            }
                          >
                            PENDING
                          </span>

                          <span
                            style={
                              styles.readOnlyBadge
                            }
                          >
                            Read-only
                          </span>
                        </div>

                        <strong
                          style={
                            styles.readOnlyValue
                          }
                        >
                          {
                            editingBalance.pending_days
                          }
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Calculation */}

                  <div
                    style={
                      styles.calculationCard
                    }
                  >
                    <div
                      style={
                        styles.calculationIcon
                      }
                    >
                      <Calculator
                        size={18}
                      />
                    </div>

                    <div
                      style={
                        styles.calculationContent
                      }
                    >
                      <span
                        style={
                          styles.calculationLabel
                        }
                      >
                        CALCULATED REMAINING
                      </span>

                      <strong
                        style={{
                          ...styles.calculationValue,
                          color:
                            calculatedRemaining >=
                            0
                              ? "#28613d"
                              : "#a33b3b",
                        }}
                      >
                        {calculatedRemaining}{" "}
                        {Math.abs(
                          calculatedRemaining
                        ) === 1
                          ? "day"
                          : "days"}
                      </strong>

                      <span
                        style={
                          styles.calculationFormula
                        }
                      >
                        Allocated − Used − Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}

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
                    <ShieldCheck
                      size={16}
                    />

                    <span>
                      Only the annual allocation is
                      editable.
                    </span>
                  </div>

                  <div
                    className="leave-balance-footer-actions"
                    style={
                      styles.footerActions
                    }
                  >
                    <button
                      type="button"
                      style={
                        styles.secondaryButton
                      }
                      onClick={() =>
                        setEditingBalance(
                          null
                        )
                      }
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      style={
                        styles.primaryButton
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
                          <Save size={15} />
                          Save Changes
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
            .employee-mobile-cards {
              display: none;
            }

            .leave-balance-modal {
              width: min(94vw, 720px);
            }

            .leave-balance-spin {
              animation: leaveBalanceSpin 0.8s linear infinite;
            }

            @keyframes leaveBalanceSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }

            @media (max-width: 1050px) {
              .leave-balance-summary-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
            }

            @media (max-width: 850px) {
              .leave-balance-system-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 768px) {
              .employee-desktop-table {
                display: none !important;
              }

              .employee-mobile-cards {
                display: flex !important;
                flex-direction: column;
                gap: 0.75rem;
              }

              .leave-balance-summary-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 650px) {
              .leave-balance-modal {
                width: calc(100vw - 20px) !important;
                max-height: calc(100vh - 20px) !important;
              }

              .leave-balance-footer-actions {
                width: 100%;
                display: grid !important;
                grid-template-columns: 1fr 1fr;
              }

              .leave-balance-footer-actions button {
                width: 100%;
              }
            }

            @media (max-width: 480px) {
              .leave-balance-footer-actions {
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
    color: "#2f4035",
  },

  /* HERO */

  hero: {
    marginTop: "1rem",
    marginBottom: "1.5rem",
    padding: "2rem",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #173d28 0%, #285d3d 60%, #3b7350 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: "2rem",
    boxShadow:
      "0 15px 38px rgba(29, 70, 45, 0.17)",
  },

  heroLeft: {
    maxWidth: "700px",
  },

  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#c9e1d0",
    fontSize: "0.64rem",
    fontWeight: "800",
    letterSpacing: "0.14em",
    marginBottom: "0.7rem",
  },

  eyebrowLine: {
    width: "25px",
    height: "2px",
    borderRadius: "999px",
    backgroundColor: "#b7d7c0",
  },

  heroTitle: {
    margin: 0,
    fontSize: "2.35rem",
    lineHeight: 1.1,
    fontWeight: "800",
    letterSpacing: "-0.035em",
  },

  heroSubtitle: {
    margin: "0.8rem 0 0",
    maxWidth: "650px",
    color: "#d9e9dd",
    fontSize: "0.9rem",
    lineHeight: 1.7,
  },

  heroMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "1.25rem",
    flexWrap: "wrap",
  },

  heroMetaItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    color: "#d5e7da",
    fontSize: "0.67rem",
    fontWeight: "650",
  },

  heroDivider: {
    width: "1px",
    height: "15px",
    backgroundColor:
      "rgba(255,255,255,0.25)",
  },

  heroPanel: {
    width: "215px",
    flexShrink: 0,
    padding: "1rem",
    borderRadius: "15px",
    backgroundColor:
      "rgba(255,255,255,0.10)",
    border:
      "1px solid rgba(255,255,255,0.14)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  heroPanelIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    backgroundColor:
      "rgba(255,255,255,0.13)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.7rem",
  },

  heroPanelLabel: {
    fontSize: "0.56rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
    color: "#c7dfcd",
  },

  heroPanelYear: {
    fontSize: "1.6rem",
    lineHeight: 1.1,
    marginTop: "0.2rem",
  },

  heroPanelText: {
    marginTop: "0.4rem",
    fontSize: "0.64rem",
    lineHeight: 1.45,
    color: "#d5e7da",
  },

  /* EXPLORER */

  explorer: {
    backgroundColor: "#ffffff",
    border: "1px solid #dce5df",
    borderRadius: "16px",
    padding: "1.25rem",
    marginBottom: "1rem",
    boxShadow:
      "0 5px 20px rgba(31,59,41,0.035)",
  },

  explorerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
  },

  sectionEyebrow: {
    display: "block",
    color: "#7d8b82",
    fontSize: "0.59rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
    marginBottom: "0.25rem",
  },

  sectionTitle: {
    margin: 0,
    color: "#33453a",
    fontSize: "1.08rem",
    fontWeight: "800",
  },

  sectionDescription: {
    margin: "0.3rem 0 0",
    color: "#829087",
    fontSize: "0.7rem",
    lineHeight: 1.5,
  },

  explorerBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.4rem 0.6rem",
    borderRadius: "7px",
    backgroundColor: "#f0f7f2",
    border: "1px solid #d7e7db",
    color: "#386448",
    fontSize: "0.61rem",
    fontWeight: "750",
  },

  explorerControls: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-end",
  },

  searchContainer: {
    flex: "1 1 400px",
    position: "relative",
  },

  yearContainer: {
    width: "175px",
    flexShrink: 0,
  },

  controlLabel: {
    display: "block",
    color: "#596960",
    fontSize: "0.67rem",
    fontWeight: "750",
    marginBottom: "0.35rem",
  },

  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  searchIcon: {
    position: "absolute",
    left: "0.8rem",
    color: "#87948c",
    pointerEvents: "none",
  },

  searchChevron: {
    position: "absolute",
    right: "0.8rem",
    color: "#87948c",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    height: "43px",
    boxSizing: "border-box",
    border: "1px solid #d4ded8",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#35463c",
    padding:
      "0.65rem 2.5rem 0.65rem 2.45rem",
    fontSize: "0.73rem",
    outline: "none",
  },

  yearWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  yearIcon: {
    position: "absolute",
    left: "0.75rem",
    color: "#74847a",
    pointerEvents: "none",
  },

  yearSelect: {
    width: "100%",
    height: "43px",
    boxSizing: "border-box",
    border: "1px solid #d4ded8",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#35463c",
    padding:
      "0.65rem 0.7rem 0.65rem 2.35rem",
    fontSize: "0.73rem",
    outline: "none",
    cursor: "pointer",
  },

  /* DROPDOWN */

  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    border: "1px solid #dce5df",
    borderRadius: "11px",
    boxShadow:
      "0 16px 35px rgba(28,57,39,0.15)",
    zIndex: 100,
    overflow: "hidden",
    maxHeight: "310px",
    overflowY: "auto",
  },

  dropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.65rem 0.8rem",
    backgroundColor: "#f7faf8",
    borderBottom: "1px solid #e4ebe6",
    color: "#75827a",
    fontSize: "0.59rem",
    fontWeight: "800",
    letterSpacing: "0.07em",
  },

  dropdownMessage: {
    padding: "1rem",
    textAlign: "center",
    color: "#829087",
    fontSize: "0.7rem",
  },

  dropdownItem: {
    width: "100%",
    border: "none",
    borderBottom:
      "1px solid #edf1ee",
    padding: "0.7rem 0.8rem",
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  itemAvatar: {
    width: "35px",
    height: "35px",
    borderRadius: "10px",
    backgroundColor: "#eef3ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  itemMeta: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    flex: 1,
  },

  itemName: {
    color: "#35463c",
    fontSize: "0.72rem",
    fontWeight: "750",
  },

  itemSubText: {
    marginTop: "0.15rem",
    color: "#8a958f",
    fontSize: "0.61rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  itemArrow: {
    color: "#9aa59f",
    transform: "rotate(-90deg)",
    flexShrink: 0,
  },

  smallSpinner: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border:
      "2px solid #d6e3d9",
    borderTopColor: "#28613d",
    display: "inline-block",
    verticalAlign: "middle",
    marginRight: "0.4rem",
    animation:
      "leaveBalanceSpin 0.7s linear infinite",
  },

  /* EMPLOYEE CARD */

  employeeCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #dce5df",
    borderRadius: "16px",
    padding: "1rem 1.2rem",
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
    boxShadow:
      "0 5px 20px rgba(31,59,41,0.035)",
  },

  employeeIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    minWidth: 0,
  },

  employeeAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "13px",
    backgroundColor: "#28613d",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },

  employeeInitials: {
    fontSize: "0.95rem",
    fontWeight: "800",
    textTransform: "uppercase",
  },

  employeeLabel: {
    display: "block",
    color: "#89958e",
    fontSize: "0.55rem",
    fontWeight: "800",
    letterSpacing: "0.11em",
  },

  employeeName: {
    margin: "0.12rem 0 0",
    color: "#304238",
    fontSize: "1.02rem",
    fontWeight: "800",
  },

  employeeDetails: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    marginTop: "0.25rem",
    flexWrap: "wrap",
  },

  codeBadge: {
    padding: "0.22rem 0.45rem",
    borderRadius: "6px",
    backgroundColor: "#edf6ef",
    border: "1px solid #d6e8da",
    color: "#28613d",
    fontSize: "0.59rem",
    fontWeight: "800",
  },

  emailText: {
    color: "#7d8a82",
    fontSize: "0.63rem",
  },

  employeeActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
  },

  selectedYearBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "57px",
    padding: "0.4rem 0.55rem",
    borderRadius: "8px",
    backgroundColor: "#f5f8f5",
    border: "1px solid #e1e8e3",
  },

  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    height: "35px",
    padding: "0 0.7rem",
    borderRadius: "8px",
    border: "1px solid #d5e0d8",
    backgroundColor: "#ffffff",
    color: "#496052",
    fontSize: "0.64rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  /* LOADING */

  loadingArea: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },

  loadingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  loadingBarLarge: {
    width: "210px",
    height: "18px",
    borderRadius: "6px",
    backgroundColor: "#e9efeb",
  },

  loadingBarSmall: {
    width: "75px",
    height: "14px",
    borderRadius: "5px",
    backgroundColor: "#edf2ee",
  },

  loadingGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "0.9rem",
  },

  loadingCard: {
    height: "105px",
    borderRadius: "13px",
    backgroundColor: "#edf2ee",
  },

  loadingTable: {
    height: "260px",
    borderRadius: "14px",
    backgroundColor: "#edf2ee",
  },

  /* INITIAL / EMPTY */

  initialState: {
    minHeight: "290px",
    border: "1px dashed #cddbd1",
    borderRadius: "16px",
    backgroundColor: "#fbfcfb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem",
  },

  initialIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "15px",
    backgroundColor: "#eaf4ed",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.8rem",
  },

  initialEyebrow: {
    color: "#819087",
    fontSize: "0.57rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
  },

  initialTitle: {
    margin: "0.3rem 0 0",
    color: "#35463c",
    fontSize: "1rem",
    fontWeight: "800",
  },

  initialText: {
    maxWidth: "410px",
    margin: "0.4rem 0 0",
    color: "#89958e",
    fontSize: "0.7rem",
    lineHeight: 1.55,
  },

  emptyState: {
    minHeight: "280px",
    border: "1px solid #dfe7e2",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
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
    backgroundColor: "#f3f5f3",
    color: "#718078",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.8rem",
  },

  emptyEyebrow: {
    color: "#89958e",
    fontSize: "0.57rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
  },

  emptyTitle: {
    margin: "0.3rem 0 0",
    color: "#35463c",
    fontSize: "1rem",
    fontWeight: "800",
  },

  emptyText: {
    maxWidth: "480px",
    margin: "0.4rem 0 0",
    color: "#89958e",
    fontSize: "0.7rem",
    lineHeight: 1.55,
  },

  /* SUMMARY */

  summarySection: {
    marginBottom: "1.5rem",
  },

  sectionHeader: {
    marginBottom: "0.75rem",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "0.8rem",
  },

  summaryMetric: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "13px",
    padding: "0.9rem",
  },

  metricIcon: {
    width: "39px",
    height: "39px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  metricLabel: {
    display: "block",
    color: "#8a968f",
    fontSize: "0.53rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },

  metricValue: {
    display: "block",
    marginTop: "0.12rem",
    color: "#35463c",
    fontSize: "1.2rem",
    lineHeight: 1,
    fontWeight: "800",
  },

  metricHint: {
    display: "block",
    marginTop: "0.22rem",
    color: "#98a19c",
    fontSize: "0.55rem",
  },

  /* TABLE */

  tableCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 5px 20px rgba(31,59,41,0.035)",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem 1.1rem",
    borderBottom: "1px solid #e4eae6",
    backgroundColor: "#f8faf8",
  },

  tableTitle: {
    margin: 0,
    color: "#34463b",
    fontSize: "0.94rem",
    fontWeight: "800",
  },

  tableYearBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.35rem 0.55rem",
    borderRadius: "7px",
    backgroundColor: "#eaf4ed",
    color: "#28613d",
    fontSize: "0.6rem",
    fontWeight: "800",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "0.72rem",
  },

  th: {
    padding: "0.75rem 0.9rem",
    backgroundColor: "#fbfcfb",
    borderBottom: "1px solid #e2e9e4",
    color: "#7b887f",
    fontSize: "0.56rem",
    fontWeight: "800",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #edf1ee",
  },

  td: {
    padding: "0.85rem 0.9rem",
    color: "#48574e",
    verticalAlign: "middle",
  },

  tdMuted: {
    padding: "0.85rem 0.9rem",
    color: "#859089",
    verticalAlign: "middle",
  },

  tdNumber: {
    padding: "0.85rem 0.9rem",
    color: "#526158",
    fontWeight: "700",
    verticalAlign: "middle",
  },

  leaveTypeCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
  },

  leaveTypeIcon: {
    width: "33px",
    height: "33px",
    borderRadius: "9px",
    backgroundColor: "#eaf4ed",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  leaveTypeName: {
    color: "#35463c",
    fontSize: "0.71rem",
    fontWeight: "750",
  },

  remainingBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "42px",
    padding: "0.32rem 0.48rem",
    borderRadius: "7px",
    fontSize: "0.61rem",
    fontWeight: "800",
  },

  editButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    border: "1px solid #cadbcf",
    backgroundColor: "#f4f9f5",
    color: "#28613d",
    padding: "0.42rem 0.6rem",
    borderRadius: "7px",
    fontSize: "0.61rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  /* MOBILE */

  mobileSection: {
    display: "none",
  },

  mobileSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },

  mobileCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "14px",
    padding: "0.95rem",
  },

  mobileCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.7rem",
  },

  mobileLeaveIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
  },

  mobileCardTitle: {
    margin: 0,
    color: "#35463c",
    fontSize: "0.76rem",
    fontWeight: "800",
  },

  mobileCardYear: {
    display: "block",
    marginTop: "0.15rem",
    color: "#8a958f",
    fontSize: "0.57rem",
  },

  mobileMetrics: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "0.5rem",
    marginTop: "0.8rem",
  },

  mobileMetric: {
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
    backgroundColor: "#f7f9f7",
    border: "1px solid #e4eae6",
    borderRadius: "8px",
    padding: "0.55rem",
  },

  mobileMetric: {
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
    backgroundColor: "#f7f9f7",
    border: "1px solid #e4eae6",
    borderRadius: "8px",
    padding: "0.55rem",
  },

  mobileEditButton: {
    width: "100%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    marginTop: "0.7rem",
    padding: "0.55rem",
    borderRadius: "8px",
    border: "1px solid #cadbcf",
    backgroundColor: "#f4f9f5",
    color: "#28613d",
    fontSize: "0.65rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  /* MODAL */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor:
      "rgba(19, 35, 25, 0.68)",
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
    padding: "1rem 1.2rem",
    backgroundColor: "#f7faf8",
    borderBottom: "1px solid #e1e8e3",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    flexShrink: 0,
  },

  modalHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    minWidth: 0,
  },

  modalIcon: {
    width: "41px",
    height: "41px",
    borderRadius: "11px",
    backgroundColor: "#e7f3ea",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalEyebrow: {
    display: "block",
    color: "#87948c",
    fontSize: "0.54rem",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "0.18rem",
  },

  modalTitle: {
    margin: 0,
    color: "#33453a",
    fontSize: "1rem",
    fontWeight: "800",
  },

  closeButton: {
    width: "33px",
    height: "33px",
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

  formContent: {
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
    padding: "1.1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },

  modalContext: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    padding: "0.75rem",
    borderRadius: "10px",
    backgroundColor: "#f1f7f3",
    border: "1px solid #dbe9de",
  },

  modalContextIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalContextLabel: {
    display: "block",
    color: "#849188",
    fontSize: "0.51rem",
    fontWeight: "800",
    letterSpacing: "0.1em",
  },

  modalContextName: {
    display: "block",
    color: "#35463c",
    fontSize: "0.76rem",
    marginTop: "0.12rem",
  },

  modalContextCode: {
    display: "block",
    color: "#7d8b82",
    fontSize: "0.58rem",
    marginTop: "0.12rem",
  },

  formSection: {
    border: "1px solid #dfe7e2",
    borderRadius: "12px",
    padding: "0.9rem",
  },

  formSectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    marginBottom: "0.8rem",
  },

  formSectionNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    backgroundColor: "#e8f4ec",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.58rem",
    fontWeight: "800",
    flexShrink: 0,
  },

  formSectionTitle: {
    display: "block",
    color: "#35463c",
    fontSize: "0.72rem",
    fontWeight: "800",
  },

  formSectionText: {
    display: "block",
    color: "#8a958f",
    fontSize: "0.6rem",
    marginTop: "0.15rem",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },

  label: {
    color: "#56645c",
    fontSize: "0.66rem",
    fontWeight: "750",
  },

  required: {
    color: "#a33b3b",
    marginLeft: "0.15rem",
  },

  modalInput: {
    width: "100%",
    height: "41px",
    boxSizing: "border-box",
    border: "1px solid #d2ddd6",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#35463c",
    padding: "0.6rem 0.7rem",
    fontSize: "0.72rem",
    outline: "none",
  },

  helperText: {
    color: "#929d96",
    fontSize: "0.58rem",
  },

  systemGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "0.7rem",
  },

  readOnlyCard: {
    backgroundColor: "#f7f9f7",
    border: "1px solid #e1e8e3",
    borderRadius: "9px",
    padding: "0.7rem",
  },

  readOnlyTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.4rem",
  },

  readOnlyLabel: {
    color: "#87938c",
    fontSize: "0.55rem",
    fontWeight: "800",
    letterSpacing: "0.07em",
  },

  readOnlyBadge: {
    color: "#77847c",
    backgroundColor: "#ffffff",
    border: "1px solid #dce4df",
    borderRadius: "5px",
    padding: "0.15rem 0.3rem",
    fontSize: "0.48rem",
    fontWeight: "750",
  },

  readOnlyValue: {
    display: "block",
    marginTop: "0.35rem",
    color: "#526158",
    fontSize: "1.15rem",
    fontWeight: "800",
  },

  calculationCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    padding: "0.8rem",
    borderRadius: "10px",
    backgroundColor: "#edf6ef",
    border: "1px solid #d5e7d9",
  },

  calculationIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#28613d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  calculationContent: {
    display: "flex",
    flexDirection: "column",
  },

  calculationLabel: {
    color: "#6e8074",
    fontSize: "0.53rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },

  calculationValue: {
    marginTop: "0.15rem",
    fontSize: "1.2rem",
    lineHeight: 1,
    fontWeight: "800",
  },

  calculationFormula: {
    marginTop: "0.2rem",
    color: "#849188",
    fontSize: "0.54rem",
  },

  modalFooter: {
    padding: "0.85rem 1.1rem",
    backgroundColor: "#f8faf8",
    borderTop: "1px solid #e1e8e3",
    flexShrink: 0,
  },

  footerNote: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    color: "#7f8d84",
    fontSize: "0.58rem",
  },

  footerActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5rem",
    marginTop: "0.7rem",
  },

  secondaryButton: {
    border: "1px solid #d3ddd7",
    backgroundColor: "#ffffff",
    color: "#617068",
    padding: "0.58rem 0.85rem",
    borderRadius: "8px",
    fontSize: "0.65rem",
    fontWeight: "750",
    cursor: "pointer",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    border: "none",
    backgroundColor: "#28613d",
    color: "#ffffff",
    minWidth: "125px",
    padding: "0.58rem 0.85rem",
    borderRadius: "8px",
    fontSize: "0.65rem",
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
      "leaveBalanceSpin 0.7s linear infinite",
  },
};

export default LeaveBalances;