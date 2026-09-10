import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  UserCheck,
  UserX,
  Archive,
  Users,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { ConfirmDialog } from "../../shared/components/Modal";

import {
  getEmployees,
  activateEmployee,
  deactivateEmployee,
  archiveEmployee,
} from "../services/employeeApi";

import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
} from "../../shared/utils/toast";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [archiveEmpTarget, setArchiveEmpTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);

  const navigate = useNavigate();

  // --------------------------------------------------
  // FETCH EMPLOYEES
  // --------------------------------------------------

  const fetchEmployees = async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(statusFilter && {
          employment_status: statusFilter,
        }),
      };

      const res = await getEmployees(params);

      setEmployees(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Failed to load employee list."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, statusFilter]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    setPage(1);
    fetchEmployees();
  };

  // --------------------------------------------------
  // ACTIVATE / DEACTIVATE
  // --------------------------------------------------

  const handleToggleStatus = async (emp) => {
    try {
      if (emp.employment_status === "ACTIVE") {
        await deactivateEmployee(emp.id);

        showInfo(
          `Employee ${emp.employee_code} deactivated.`
        );
      } else {
        await activateEmployee(emp.id);

        showSuccess(
          `Employee ${emp.employee_code} activated.`
        );
      }

      fetchEmployees();
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Action failed."
      );
    }
  };

  // --------------------------------------------------
  // ARCHIVE
  // --------------------------------------------------

  const confirmArchive = async () => {
    if (!archiveEmpTarget) return;

    setArchiving(true);

    try {
      await archiveEmployee(archiveEmpTarget.id);

      showWarning(
        `Employee ${archiveEmpTarget.employee_code} archived.`
      );

      setArchiveEmpTarget(null);

      fetchEmployees();
    } catch (err) {
      showError(
        err.response?.data?.detail ||
          "Archive failed."
      );
    } finally {
      setArchiving(false);
    }
  };

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };

      case "INACTIVE":
        return {
          label: "Inactive",
          className:
            "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
        };

      case "ON_NOTICE":
        return {
          label: "On Notice",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };

      case "TERMINATED":
        return {
          label: "Terminated",
          className:
            "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        };

      default:
        return {
          label: status || "Unknown",
          className:
            "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  // --------------------------------------------------
  // AVATAR
  // --------------------------------------------------

  const getInitials = (emp) => {
    const first = emp.first_name?.[0] || "";
    const last = emp.last_name?.[0] || "";

    return `${first}${last}`.toUpperCase();
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <AppLayout title="Employee Directory">
      <div className="w-full min-w-0 max-w-full overflow-x-hidden pb-10">

        {/* -------------------------------------------
            BACK
        ------------------------------------------- */}

        <BackToDashboard
          to="/hr/dashboard"
          role="HR"
        />

        {/* -------------------------------------------
            PAGE HEADER
        ------------------------------------------- */}

        <section className="mt-5 w-full max-w-full overflow-hidden rounded-3xl bg-[#17251F] px-5 py-7 text-white shadow-sm sm:px-7 lg:px-9 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="min-w-0">

              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <Users size={18} />

                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                  People Management
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Employee Directory
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Manage employee profiles, account status,
                and business records from one place.
              </p>

            </div>

            <Link
              to="/hr/employees/new"
              className="!inline-flex !w-full !items-center !justify-center !gap-2 !rounded-xl !bg-[#dcefe3] !px-5 !py-3 !text-sm !font-semibold !text-[#24543c] !transition hover:!bg-white sm:!w-auto"
            >
              <Plus size={18} />
              Create Employee
            </Link>

          </div>

          {/* RECORD COUNT */}

          <div className="mt-7 flex flex-wrap gap-3">

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs text-slate-400">
                Total Employees
              </p>

              <p className="mt-1 text-xl font-bold">
                {totalItems}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs text-slate-400">
                Current Page
              </p>

              <p className="mt-1 text-xl font-bold">
                {page}
                <span className="mx-1 text-sm font-normal text-slate-500">
                  /
                </span>
                {totalPages}
              </p>
            </div>

          </div>

        </section>

        {/* -------------------------------------------
            SEARCH + FILTER
        ------------------------------------------- */}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal
              size={17}
              className="text-[#2f6b4f]"
            />

            <h2 className="text-sm font-semibold text-slate-800">
              Find Employees
            </h2>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <form
              onSubmit={handleSearchSubmit}
              className="flex min-w-0 flex-1"
            >

              <div className="relative min-w-0 flex-1">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search by employee code, name or email..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="h-11 w-full rounded-l-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f6b4f] focus:bg-white focus:ring-2 focus:ring-[#2f6b4f]/10"
                />

              </div>

              <button
                type="submit"
                className="h-11 shrink-0 rounded-r-xl bg-[#2f6b4f] px-5 text-sm font-semibold text-white transition hover:bg-[#24543c]"
              >
                Search
              </button>

            </form>

            {/* STATUS FILTER */}

            <div className="flex items-center gap-2 lg:w-56">

              <label
                htmlFor="employee-status"
                className="hidden text-xs font-semibold uppercase tracking-wide text-slate-500 sm:block"
              >
                Status
              </label>

              <select
                id="employee-status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#2f6b4f] focus:ring-2 focus:ring-[#2f6b4f]/10"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

                <option value="ON_NOTICE">
                  On Notice
                </option>

                <option value="TERMINATED">
                  Terminated
                </option>
              </select>

            </div>

          </div>

        </section>

        {/* -------------------------------------------
            CONTENT
        ------------------------------------------- */}

        <section className="mt-5">

          {loading ? (

            /* LOADING */

            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#2f6b4f]" />

              <p className="text-sm font-medium text-slate-600">
                Loading employees...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please wait while we fetch the employee directory.
              </p>

            </div>

          ) : employees.length === 0 ? (

            /* EMPTY */

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f2ec] text-[#2f6b4f]">
                <Users size={25} />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-800">
                No employees found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                No employee profiles match your current
                search or status filter.
              </p>

              {(search || statusFilter) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setPage(1);
                  }}
                  className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}

            </div>

          ) : (

            <>
              {/* ---------------------------------------
                  DESKTOP TABLE
              --------------------------------------- */}

              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1000px] border-collapse">

                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Employee
                        </th>

                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Code
                        </th>

                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Contact
                        </th>

                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Joining Date
                        </th>

                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {employees.map((emp) => {

                        const status =
                          getStatusConfig(
                            emp.employment_status
                          );

                        return (
                          <tr
                            key={emp.id}
                            className="border-b border-slate-100 transition last:border-b-0 hover:bg-[#f8fbf9]"
                          >

                            {/* EMPLOYEE */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                {emp.profile_photo_url ? (

                                  <img
                                    src={
                                      emp.profile_photo_url
                                    }
                                    alt={emp.first_name}
                                    className="h-11 w-11 shrink-0 rounded-xl object-cover ring-2 ring-slate-100"
                                  />

                                ) : (

                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dcefe3] text-sm font-bold text-[#2f6b4f]">
                                    {getInitials(emp)}
                                  </div>

                                )}

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {emp.first_name}{" "}
                                    {emp.last_name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    Employee
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* CODE */}

                            <td className="px-4 py-4">

                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
                                {emp.employee_code}
                              </span>

                            </td>

                            {/* CONTACT */}

                            <td className="max-w-[260px] px-4 py-4">

                              <p className="truncate text-sm text-slate-700">
                                {emp.email}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {emp.phone || "No phone number"}
                              </p>

                            </td>

                            {/* DATE */}

                            <td className="px-4 py-4 text-sm text-slate-600">
                              {emp.joining_date || "N/A"}
                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-4">

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                />

                                {status.label}
                              </span>

                            </td>

                            {/* ACTIONS */}

                            <td className="px-5 py-4">

                              <div className="flex justify-end gap-1.5">

                                <button
                                  onClick={() =>
                                    navigate(
                                      `/hr/employees/${emp.id}`
                                    )
                                  }
                                  title="View Details"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#b9d8c5] hover:bg-[#e8f2ec] hover:text-[#2f6b4f]"
                                >
                                  <Eye size={16} />
                                </button>

                                <button
                                  onClick={() =>
                                    navigate(
                                      `/hr/employees/${emp.id}/edit`
                                    )
                                  }
                                  title="Edit Employee"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#b9d8c5] hover:bg-[#e8f2ec] hover:text-[#2f6b4f]"
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  onClick={() =>
                                    handleToggleStatus(emp)
                                  }
                                  title={
                                    emp.employment_status ===
                                    "ACTIVE"
                                      ? "Deactivate Account"
                                      : "Activate Account"
                                  }
                                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                                    emp.employment_status ===
                                    "ACTIVE"
                                      ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                      : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                  }`}
                                >
                                  {emp.employment_status ===
                                  "ACTIVE" ? (
                                    <UserX size={16} />
                                  ) : (
                                    <UserCheck size={16} />
                                  )}
                                </button>

                                <button
                                  onClick={() =>
                                    setArchiveEmpTarget(emp)
                                  }
                                  title="Archive Employee"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50"
                                >
                                  <Archive size={16} />
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* ---------------------------------------
                  MOBILE / TABLET CARDS
              --------------------------------------- */}

              <div className="grid gap-4 lg:hidden">

                {employees.map((emp) => {

                  const status =
                    getStatusConfig(
                      emp.employment_status
                    );

                  return (
                    <article
                      key={emp.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >

                      {/* CARD HEADER */}

                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">

                        <div className="flex min-w-0 items-center gap-3">

                          {emp.profile_photo_url ? (

                            <img
                              src={
                                emp.profile_photo_url
                              }
                              alt={emp.first_name}
                              className="h-11 w-11 shrink-0 rounded-xl object-cover"
                            />

                          ) : (

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dcefe3] text-sm font-bold text-[#2f6b4f]">
                              {getInitials(emp)}
                            </div>

                          )}

                          <div className="min-w-0">

                            <h3 className="truncate text-sm font-bold text-slate-800">
                              {emp.first_name}{" "}
                              {emp.last_name}
                            </h3>

                            <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
                              {emp.employee_code}
                            </span>

                          </div>

                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold ${status.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          />
                          {status.label}
                        </span>

                      </div>

                      {/* DETAILS */}

                      <div className="grid gap-4 p-4 sm:grid-cols-2">

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm font-medium text-slate-700">
                            {emp.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Phone
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {emp.phone || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Joining Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {emp.joining_date || "N/A"}
                          </p>
                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 p-3 sm:grid-cols-4">

                        <button
                          onClick={() =>
                            navigate(
                              `/hr/employees/${emp.id}`
                            )
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/hr/employees/${emp.id}/edit`
                            )
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#cce2d5] bg-[#e8f2ec] px-3 py-2 text-xs font-semibold text-[#2f6b4f] transition hover:bg-[#dcefe3]"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleToggleStatus(emp)
                          }
                          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            emp.employment_status ===
                            "ACTIVE"
                              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {emp.employment_status ===
                          "ACTIVE" ? (
                            <UserX size={14} />
                          ) : (
                            <UserCheck size={14} />
                          )}

                          {emp.employment_status ===
                          "ACTIVE"
                            ? "Disable"
                            : "Activate"}
                        </button>

                        <button
                          onClick={() =>
                            setArchiveEmpTarget(emp)
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Archive size={14} />
                          Archive
                        </button>

                      </div>

                    </article>
                  );
                })}

              </div>
            </>
          )}

        </section>

        {/* -------------------------------------------
            PAGINATION
        ------------------------------------------- */}

        {totalPages > 1 && !loading && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row">

            <p className="text-xs font-medium text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-800">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((p) =>
                    Math.max(p - 1, 1)
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((p) =>
                    Math.min(p + 1, totalPages)
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#cce2d5] bg-[#e8f2ec] px-3 py-2 text-xs font-semibold text-[#2f6b4f] transition hover:bg-[#dcefe3] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>

            </div>

          </div>
        )}

        {/* -------------------------------------------
            ARCHIVE CONFIRMATION
        ------------------------------------------- */}

        <ConfirmDialog
          isOpen={Boolean(archiveEmpTarget)}
          onClose={() =>
            setArchiveEmpTarget(null)
          }
          onConfirm={confirmArchive}
          title="Archive Employee Record"
          message={`Are you sure you want to archive employee ${
            archiveEmpTarget?.first_name || ""
          } ${
            archiveEmpTarget?.last_name || ""
          }?`}
          confirmText="Yes, Archive Employee"
          confirmVariant="danger"
          loading={archiving}
        />

      </div>
    </AppLayout>
  );
}