import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  RefreshCw,
  SlidersHorizontal,
  Timer,
  UserCheck,
  X,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";

import {
  checkIn,
  checkOut,
  getMyAttendanceHistory,
  getTodayAttendance,
} from "../services/attendanceApi";

import {
  showSuccess,
  showError,
} from "../../shared/utils/toast";

export default function Attendance() {
  const [todayStatus, setTodayStatus] = useState({
    has_checked_in: false,
    has_checked_out: false,
    attendance: null,
  });

  const [actionLoading, setActionLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 20;

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  /* ============================================================
     TODAY
  ============================================================ */

  const fetchToday = async () => {
    try {
      const res = await getTodayAttendance();
      setTodayStatus(res.data);
    } catch (err) {
      console.error(
        "Failed to load today's attendance status:",
        err
      );
    }
  };

  /* ============================================================
     HISTORY
  ============================================================ */

  const fetchHistory = async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit,
      };

      if (fromDate) {
        params.from_date = fromDate;
      }

      if (toDate) {
        params.to_date = toDate;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const res = await getMyAttendanceHistory(params);

      setHistory(res.data.items || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.total_pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to load attendance history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [page, fromDate, toDate, statusFilter]);

  /* ============================================================
     CHECK IN
  ============================================================ */

  const handleCheckIn = async () => {
    setActionLoading(true);

    try {
      await checkIn();

      showSuccess("Checked in successfully!");

      await fetchToday();
      await fetchHistory();
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Check-in failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ============================================================
     CHECK OUT
  ============================================================ */

  const handleCheckOut = async () => {
    setActionLoading(true);

    try {
      await checkOut();

      showSuccess("Checked out successfully!");

      await fetchToday();
      await fetchHistory();
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Check-out failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ============================================================
     FORMATTING
  ============================================================ */

  const formatTime = (isoString) => {
    if (!isoString) {
      return "--:--";
    }

    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--:--";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) {
      return "--";
    }

    try {
      const parts = dateStr.split("-");

      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        const dt = new Date(year, month, day);

        return dt.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatWorkingMinutes = (minutes) => {
    if (
      minutes === null ||
      minutes === undefined
    ) {
      return "--";
    }

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hrs === 0) {
      return `${mins}m`;
    }

    if (mins === 0) {
      return `${hrs}h`;
    }

    return `${hrs}h ${mins}m`;
  };

  /* ============================================================
     STATUS
  ============================================================ */

  const getStatusConfig = (status) => {
    switch (status) {
      case "PRESENT":
        return {
          label: "Present",
          className:
            "bg-[#e8f2ec] text-[#2f6b4f] border-[#cfe0d4]",
          dot: "bg-[#2f6b4f]",
        };

      case "LATE":
        return {
          label: "Late",
          className:
            "bg-[#fff6df] text-[#956817] border-[#ead9a8]",
          dot: "bg-[#b8862c]",
        };

      case "HALF_DAY":
        return {
          label: "Half Day",
          className:
            "bg-[#fff1e7] text-[#a85d27] border-[#edd3bd]",
          dot: "bg-[#c56c2b]",
        };

      case "ABSENT":
        return {
          label: "Absent",
          className:
            "bg-[#fff0ed] text-[#a94d3f] border-[#edcbc5]",
          dot: "bg-[#b85545]",
        };

      default:
        return {
          label: status || "Unknown",
          className:
            "bg-[#f1f4f2] text-[#64736a] border-[#dce3de]",
          dot: "bg-[#7b8981]",
        };
    }
  };

  /* ============================================================
     TODAY STATUS
  ============================================================ */

  const todayAttendance =
    todayStatus.attendance;

  const todayStatusConfig = todayAttendance
    ? getStatusConfig(todayAttendance.status)
    : null;

  const todayLabel = useMemo(() => {
    if (todayStatus.has_checked_out) {
      return "Workday completed";
    }

    if (todayStatus.has_checked_in) {
      return "Currently checked in";
    }

    return "Not checked in";
  }, [todayStatus]);

  const hasFilters =
    Boolean(fromDate) ||
    Boolean(toDate) ||
    Boolean(statusFilter);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatusFilter("");
    setPage(1);
  };

  const currentDate = new Date().toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <AppLayout title="My Attendance">

      <div className="min-h-full w-full min-w-0 bg-[#f6f8f6] px-4 pb-10 sm:px-6 lg:px-8">

        <div className="mx-auto w-full max-w-7xl pt-2">

          <BackToDashboard
            to="/employee/dashboard"
            role="EMPLOYEE"
          />

          {/* ==================================================
              HERO
          ================================================== */}

          <section className="relative mt-4 overflow-hidden rounded-[28px] bg-[#17251f] px-6 py-8 text-white shadow-[0_18px_45px_rgba(23,37,31,0.15)] sm:px-8 lg:px-10 lg:py-9">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#2f6b4f]/30 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#7fa78c]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

              <div className="max-w-2xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-[#dcefe3]">
                  <UserCheck size={14} />
                  EMPLOYEE ATTENDANCE
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Attendance
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Keep track of your workday, record your
                  check-in and check-out, and review your
                  attendance history.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
                  <CalendarDays size={16} />
                  {currentDate}
                </div>

              </div>

              {/* Current state */}

              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">

                <div className="flex items-center justify-between">

                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Today's Status
                  </span>

                  {todayStatusConfig && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${todayStatusConfig.className}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${todayStatusConfig.dot}`}
                      />
                      {todayStatusConfig.label}
                    </span>
                  )}

                </div>

                <p className="mt-4 text-xl font-bold text-white">
                  {todayLabel}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {todayStatus.has_checked_out
                    ? "Your attendance for today is complete."
                    : todayStatus.has_checked_in
                    ? "Your workday is currently active."
                    : "Start your workday by checking in."}
                </p>

              </div>

            </div>
          </section>


          {/* ==================================================
              TODAY'S WORKDAY
          ================================================== */}

          <section className="mt-7">

            <div className="mb-4">

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b7c72]">
                Today's Workday
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#17251f]">
                Attendance activity
              </h2>

            </div>


            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1.35fr]">

              {/* Check in */}

              <AttendanceTimeCard
                icon={<LogIn size={19} />}
                label="Check In"
                value={
                  todayAttendance?.check_in
                    ? formatTime(
                        todayAttendance.check_in
                      )
                    : "--:--"
                }
                description={
                  todayAttendance?.check_in
                    ? "Recorded today"
                    : "Not recorded yet"
                }
              />


              {/* Check out */}

              <AttendanceTimeCard
                icon={<LogOut size={19} />}
                label="Check Out"
                value={
                  todayAttendance?.check_out
                    ? formatTime(
                        todayAttendance.check_out
                      )
                    : "--:--"
                }
                description={
                  todayAttendance?.check_out
                    ? "Recorded today"
                    : "Not recorded yet"
                }
              />


              {/* Work hours */}

              <AttendanceTimeCard
                icon={<Timer size={19} />}
                label="Work Hours"
                value={formatWorkingMinutes(
                  todayAttendance?.working_minutes
                )}
                description="Total recorded time"
              />


              {/* Action */}

              <div className="rounded-[22px] border border-[#dce6df] bg-white p-5 shadow-[0_7px_25px_rgba(23,37,31,0.04)]">

                <div className="flex items-center gap-2 text-[#2f6b4f]">
                  <Clock3 size={18} />

                  <span className="text-xs font-bold uppercase tracking-[0.12em]">
                    Workday Control
                  </span>
                </div>

                <p className="mt-3 text-base font-bold text-[#17251f]">
                  {todayStatus.has_checked_out
                    ? "Attendance completed"
                    : todayStatus.has_checked_in
                    ? "You're currently working"
                    : "Ready to start?"}
                </p>

                <div className="mt-4 flex gap-2">

                  <button
                    type="button"
                    onClick={handleCheckIn}
                    disabled={
                      todayStatus.has_checked_in ||
                      actionLoading
                    }
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                      todayStatus.has_checked_in
                        ? "cursor-not-allowed border border-[#dce5df] bg-[#f1f4f2] text-[#8a968f]"
                        : "bg-[#2f6b4f] text-white hover:bg-[#244d38]"
                    }`}
                  >
                    {todayStatus.has_checked_in ? (
                      <>
                        <Check size={14} />
                        Checked In
                      </>
                    ) : (
                      <>
                        <LogIn size={14} />
                        Check In
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckOut}
                    disabled={
                      !todayStatus.has_checked_in ||
                      todayStatus.has_checked_out ||
                      actionLoading
                    }
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                      !todayStatus.has_checked_in ||
                      todayStatus.has_checked_out
                        ? "cursor-not-allowed border border-[#dce5df] bg-[#f1f4f2] text-[#8a968f]"
                        : "bg-[#17251f] text-white hover:bg-[#263c32]"
                    }`}
                  >
                    {todayStatus.has_checked_out ? (
                      <>
                        <Check size={14} />
                        Checked Out
                      </>
                    ) : (
                      <>
                        <LogOut size={14} />
                        Check Out
                      </>
                    )}
                  </button>

                </div>

                {actionLoading && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-[#6b7c72]">
                    <RefreshCw
                      size={12}
                      className="animate-spin"
                    />
                    Updating attendance...
                  </div>
                )}

              </div>

            </div>
          </section>


          {/* ==================================================
              HISTORY HEADER
          ================================================== */}

          <section className="mt-9">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b7c72]">
                  Records
                </p>

                <div className="mt-1 flex items-center gap-3">

                  <h2 className="text-xl font-bold text-[#17251f]">
                    Attendance History
                  </h2>

                  <span className="rounded-full bg-[#e8f2ec] px-2.5 py-1 text-[10px] font-bold text-[#2f6b4f]">
                    {total} records
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Review your previous attendance activity.
                </p>

              </div>

              <button
                type="button"
                onClick={fetchHistory}
                disabled={loading}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#dce5df] bg-white px-3.5 py-2 text-sm font-semibold text-[#365444] shadow-sm transition hover:bg-[#f5f8f6] disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={
                    loading ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>

            </div>


            {/* ==================================================
                FILTER BAR
            ================================================== */}

            <div className="mt-5 overflow-hidden rounded-[22px] border border-[#dce5df] bg-white">

              <div className="flex items-center justify-between border-b border-[#edf1ee] px-5 py-4">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f2ec] text-[#2f6b4f]">
                    <SlidersHorizontal size={15} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#26382f]">
                      Filter records
                    </p>

                    <p className="hidden text-[11px] text-slate-400 sm:block">
                      Narrow your attendance history
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileFiltersOpen(
                      (value) => !value
                    )
                  }
                  className="text-xs font-bold text-[#2f6b4f] sm:hidden"
                >
                  {mobileFiltersOpen
                    ? "Hide"
                    : "Show"}
                </button>

              </div>


              <div
                className={`grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] ${
                  mobileFiltersOpen
                    ? "grid"
                    : "hidden sm:grid"
                }`}
              >

                <FilterField label="From Date">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                    className="attendance-input"
                  />
                </FilterField>

                <FilterField label="To Date">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                    className="attendance-input"
                  />
                </FilterField>

                <FilterField label="Status">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="attendance-input"
                  >
                    <option value="">
                      All statuses
                    </option>

                    <option value="PRESENT">
                      Present
                    </option>

                    <option value="LATE">
                      Late
                    </option>
                  </select>
                </FilterField>

                <div className="flex items-end">

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-[#dce5df] px-4 text-sm font-semibold text-[#52665a] transition hover:bg-[#f5f8f6] lg:w-auto"
                    >
                      <X size={15} />
                      Clear
                    </button>
                  )}

                </div>

              </div>
            </div>


            {/* ==================================================
                HISTORY
            ================================================== */}

            <div className="mt-5">

              {loading ? (
                <AttendanceLoading />
              ) : history.length === 0 ? (
                <EmptyAttendance />
              ) : (
                <>
                  {/* Desktop */}

                  <div className="hidden overflow-hidden rounded-[22px] border border-[#dce5df] bg-white shadow-[0_7px_25px_rgba(23,37,31,0.04)] md:block">

                    <div className="overflow-x-auto">

                      <table className="w-full border-collapse text-left">

                        <thead>
                          <tr className="border-b border-[#e8eee9] bg-[#f7faf8]">

                            <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#718078]">
                              Date
                            </th>

                            <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#718078]">
                              Check In
                            </th>

                            <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#718078]">
                              Check Out
                            </th>

                            <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#718078]">
                              Work Hours
                            </th>

                            <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#718078]">
                              Status
                            </th>

                          </tr>
                        </thead>

                        <tbody>

                          {history.map((item) => (
                            <AttendanceTableRow
                              key={item.id}
                              item={item}
                              formatDate={formatDate}
                              formatTime={formatTime}
                              formatWorkingMinutes={
                                formatWorkingMinutes
                              }
                              getStatusConfig={
                                getStatusConfig
                              }
                            />
                          ))}

                        </tbody>

                      </table>

                    </div>

                  </div>


                  {/* Mobile */}

                  <div className="space-y-3 md:hidden">

                    {history.map((item) => (
                      <AttendanceMobileCard
                        key={item.id}
                        item={item}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        formatWorkingMinutes={
                          formatWorkingMinutes
                        }
                        getStatusConfig={
                          getStatusConfig
                        }
                      />
                    ))}

                  </div>


                  {/* Pagination */}

                  <div className="mt-5 flex flex-col gap-3 rounded-[20px] border border-[#dce5df] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs font-medium text-slate-500">
                      Page{" "}
                      <span className="font-bold text-[#26382f]">
                        {page}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-[#26382f]">
                        {totalPages}
                      </span>
                    </p>

                    <div className="flex gap-2">

                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                          setPage((p) => p - 1)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-[#dce5df] px-3.5 py-2 text-xs font-bold text-[#365444] transition hover:bg-[#f5f8f6] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowLeft size={14} />
                        Previous
                      </button>

                      <button
                        type="button"
                        disabled={
                          page >= totalPages
                        }
                        onClick={() =>
                          setPage((p) => p + 1)
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#2f6b4f] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#244d38] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ArrowRight size={14} />
                      </button>

                    </div>

                  </div>
                </>
              )}

            </div>

          </section>

        </div>
      </div>

      <style>{`
        .attendance-input {
          width: 100%;
          height: 42px;
          box-sizing: border-box;
          border: 1px solid #d8e2db;
          border-radius: 12px;
          background: #ffffff;
          color: #26382f;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .attendance-input:focus {
          border-color: #2f6b4f;
          box-shadow: 0 0 0 4px rgba(47, 107, 79, 0.10);
        }

        .attendance-input::placeholder {
          color: #9aa59e;
        }
      `}</style>

    </AppLayout>
  );
}


/* ================================================================
   TIME CARD
================================================================ */

function AttendanceTimeCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-[22px] border border-[#dce5df] bg-white p-5 shadow-[0_7px_25px_rgba(23,37,31,0.04)]">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
          {icon}
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Today
        </span>

      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-[#718078]">
        {label}
      </p>

      <p className="mt-1 font-mono text-2xl font-extrabold tracking-tight text-[#17251f]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}


/* ================================================================
   FILTER FIELD
================================================================ */

function FilterField({
  label,
  children,
}) {
  return (
    <div className="min-w-0">

      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#718078]">
        {label}
      </label>

      {children}

    </div>
  );
}


/* ================================================================
   TABLE ROW
================================================================ */

function AttendanceTableRow({
  item,
  formatDate,
  formatTime,
  formatWorkingMinutes,
  getStatusConfig,
}) {
  const status = getStatusConfig(item.status);

  return (
    <tr className="border-b border-[#edf1ee] transition last:border-b-0 hover:bg-[#fafcfb]">

      <td className="px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f5f2] text-[#527062]">
            <CalendarDays size={15} />
          </div>

          <span className="text-sm font-bold text-[#26382f]">
            {formatDate(item.attendance_date)}
          </span>

        </div>

      </td>

      <td className="px-5 py-4 font-mono text-sm font-semibold text-[#4b5f53]">
        {formatTime(item.check_in)}
      </td>

      <td className="px-5 py-4 font-mono text-sm font-semibold text-[#4b5f53]">
        {formatTime(item.check_out)}
      </td>

      <td className="px-5 py-4">

        <div className="flex items-center gap-2">

          <Clock3
            size={14}
            className="text-[#6d8175]"
          />

          <span className="text-sm font-bold text-[#2f6b4f]">
            {formatWorkingMinutes(
              item.working_minutes
            )}
          </span>

        </div>

      </td>

      <td className="px-5 py-4">

        <StatusBadge
          status={item.status}
          getStatusConfig={getStatusConfig}
        />

      </td>

    </tr>
  );
}


/* ================================================================
   MOBILE CARD
================================================================ */

function AttendanceMobileCard({
  item,
  formatDate,
  formatTime,
  formatWorkingMinutes,
  getStatusConfig,
}) {
  return (
    <div className="rounded-[20px] border border-[#dce5df] bg-white p-4 shadow-[0_6px_20px_rgba(23,37,31,0.04)]">

      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
            <CalendarDays size={17} />
          </div>

          <div>

            <p className="text-sm font-bold text-[#26382f]">
              {formatDate(item.attendance_date)}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Attendance record
            </p>

          </div>

        </div>

        <StatusBadge
          status={item.status}
          getStatusConfig={getStatusConfig}
        />

      </div>


      <div className="mt-4 grid grid-cols-3 gap-2">

        <MobileValue
          label="Check In"
          value={formatTime(item.check_in)}
        />

        <MobileValue
          label="Check Out"
          value={formatTime(item.check_out)}
        />

        <MobileValue
          label="Work"
          value={formatWorkingMinutes(
            item.working_minutes
          )}
        />

      </div>

    </div>
  );
}


/* ================================================================
   MOBILE VALUE
================================================================ */

function MobileValue({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-[#f7faf8] p-3">

      <p className="text-[9px] font-bold uppercase tracking-wider text-[#849189]">
        {label}
      </p>

      <p className="mt-1 truncate font-mono text-xs font-bold text-[#34483c]">
        {value}
      </p>

    </div>
  );
}


/* ================================================================
   STATUS BADGE
================================================================ */

function StatusBadge({
  status,
  getStatusConfig,
}) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />

      {config.label}
    </span>
  );
}


/* ================================================================
   LOADING
================================================================ */

function AttendanceLoading() {
  return (
    <div className="grid gap-3 md:grid-cols-1">

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[20px] border border-[#e0e8e2] bg-white p-5"
        >
          <div className="flex items-center gap-4">

            <div className="h-10 w-10 rounded-xl bg-[#edf2ee]" />

            <div className="flex-1">

              <div className="h-4 w-32 rounded bg-[#edf2ee]" />

              <div className="mt-2 h-3 w-20 rounded bg-[#f1f4f2]" />

            </div>

          </div>

          <div className="mt-5 h-12 rounded-xl bg-[#f3f6f4]" />

        </div>
      ))}

    </div>
  );
}


/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyAttendance() {
  return (
    <div className="rounded-[24px] border border-dashed border-[#cbd9cf] bg-white px-6 py-14 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f2ec] text-[#2f6b4f]">
        <CalendarDays size={24} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#17251f]">
        No attendance records
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        There are no attendance records matching
        your selected filters.
      </p>

    </div>
  );
}