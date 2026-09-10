import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  ShieldCheck,
  BriefcaseBusiness,
} from "lucide-react";

import { getEmployeeById } from "../services/employeeApi";
import BackToDashboard from "../../shared/components/BackToDashboard";
import AppLayout from "../../shared/components/AppLayout";
import { showError } from "../../shared/utils/toast";

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // LOAD EMPLOYEE
  // --------------------------------------------------

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await getEmployeeById(id);
        setEmployee(res.data);
      } catch (err) {
        showError(
          err.response?.data?.detail ||
            "Failed to load employee details."
        );

        navigate("/hr/employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <AppLayout title="Employee Profile">
        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#2f6b4f]" />

            <p className="text-sm font-semibold text-slate-700">
              Loading employee profile...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while we retrieve the employee details.
            </p>

          </div>

        </div>
      </AppLayout>
    );
  }

  if (!employee) {
    return null;
  }

  // --------------------------------------------------
  // STATUS CONFIG
  // --------------------------------------------------

  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          badge:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          dot: "bg-emerald-500",
        };

      case "INACTIVE":
        return {
          label: "Inactive",
          badge:
            "border-slate-200 bg-slate-100 text-slate-600",
          dot: "bg-slate-400",
        };

      case "ON_NOTICE":
        return {
          label: "On Notice",
          badge:
            "border-amber-200 bg-amber-50 text-amber-700",
          dot: "bg-amber-500",
        };

      case "TERMINATED":
        return {
          label: "Terminated",
          badge:
            "border-red-200 bg-red-50 text-red-700",
          dot: "bg-red-500",
        };

      default:
        return {
          label: status || "Unknown",
          badge:
            "border-slate-200 bg-slate-100 text-slate-600",
          dot: "bg-slate-400",
        };
    }
  };

  const status = getStatusConfig(
    employee.employment_status
  );

  const initials =
    `${employee.first_name?.[0] || ""}${
      employee.last_name?.[0] || ""
    }`.toUpperCase();

  return (
    <AppLayout title="Employee Profile">

      <div className="w-full min-w-0 pb-10">

        {/* =====================================================
            BACK
        ====================================================== */}

        <div className="mb-5">
          <BackToDashboard
            to="/hr/employees"
            role="HR"
          />
        </div>

        {/* =====================================================
            PROFILE HERO
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl bg-[#17251F] text-white shadow-sm">

          <div className="px-5 py-7 sm:px-7 lg:px-9 lg:py-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              {/* PROFILE */}

              <div className="flex min-w-0 items-center gap-4 sm:gap-5">

                {/* AVATAR */}

                {employee.profile_photo_url ? (

                  <img
                    src={employee.profile_photo_url}
                    alt={employee.first_name}
                    className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-white/10 sm:h-24 sm:w-24"
                  />

                ) : (

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#2f6b4f] text-2xl font-bold text-white sm:h-24 sm:w-24">
                    {initials}
                  </div>

                )}

                <div className="min-w-0">

                  <div className="mb-2 flex flex-wrap items-center gap-2">

                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                      Employee Profile
                    </span>

                  </div>

                  <h1 className="truncate text-2xl font-bold sm:text-3xl">
                    {employee.first_name}{" "}
                    {employee.last_name}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-2">

                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs font-semibold text-slate-300">
                      {employee.employee_code}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badge}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                      />

                      {status.label}
                    </span>

                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col gap-2 sm:flex-row">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/hr/employees")
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  <ArrowLeft size={17} />
                  Directory
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/hr/employees/${id}/edit`
                    )
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#dcefe3] px-5 text-sm font-semibold text-[#24543c] transition hover:bg-white"
                >
                  <Pencil size={17} />
                  Edit Employee
                </button>

              </div>

            </div>

          </div>

          {/* PROFILE SUMMARY */}

          <div className="grid border-t border-white/10 sm:grid-cols-3">

            <SummaryItem
              label="Employee Code"
              value={employee.employee_code || "N/A"}
            />

            <SummaryItem
              label="Employment Status"
              value={employee.employment_status || "N/A"}
            />

            <SummaryItem
              label="Account"
              value={
                employee.user_is_active
                  ? "System User Active"
                  : "System User Disabled"
              }
            />

          </div>

        </section>

        {/* =====================================================
            INFORMATION
        ====================================================== */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* SECTION HEADER */}

          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
                <UserRound size={19} />
              </div>

              <div>

                <h2 className="text-base font-bold text-slate-800">
                  Employee Information
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Personal and employment information
                </p>

              </div>

            </div>

          </div>

          {/* INFORMATION GRID */}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              icon={<Mail size={17} />}
              label="Email Address"
              value={employee.email}
            />

            <InfoItem
              icon={<Phone size={17} />}
              label="Phone Number"
              value={
                employee.phone || "Not Provided"
              }
            />

            <InfoItem
              icon={<CalendarDays size={17} />}
              label="Date of Birth"
              value={
                employee.date_of_birth ||
                "Not Provided"
              }
            />

            <InfoItem
              icon={<BriefcaseBusiness size={17} />}
              label="Joining Date"
              value={
                employee.joining_date ||
                "Not Provided"
              }
            />

            <InfoItem
              icon={<ShieldCheck size={17} />}
              label="Account Status"
              value={
                employee.user_is_active
                  ? "Active System User"
                  : "Deactivated / Disabled"
              }
              valueClass={
                employee.user_is_active
                  ? "text-emerald-700"
                  : "text-red-600"
              }
            />

            <InfoItem
              icon={<UserRound size={17} />}
              label="Employment Status"
              value={
                employee.employment_status ||
                "Not Provided"
              }
            />

            {/* ADDRESS */}

            <div className="border-b border-slate-100 p-5 sm:col-span-2 lg:col-span-3 sm:p-6">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <MapPin size={17} />
                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Address
                  </p>

                  <p className="mt-1 break-words text-sm font-medium leading-6 text-slate-700">
                    {employee.address ||
                      "Not Provided"}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            ACCOUNT STATUS CARD
        ====================================================== */}

        <section className="mt-5 rounded-2xl border border-[#cce2d5] bg-[#f2f8f4] p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dcefe3] text-[#2f6b4f]">
                <ShieldCheck size={19} />
              </div>

              <div>

                <p className="text-sm font-bold text-[#24543c]">
                  System Account
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">

                  {employee.user_is_active
                    ? "This employee currently has an active system account."
                    : "This employee's system account is currently disabled."}

                </p>

              </div>

            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                employee.user_is_active
                  ? "border-emerald-200 bg-white text-emerald-700"
                  : "border-red-200 bg-white text-red-600"
              }`}
            >

              <span
                className={`h-2 w-2 rounded-full ${
                  employee.user_is_active
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

              {employee.user_is_active
                ? "Account Active"
                : "Account Disabled"}

            </span>

          </div>

        </section>

      </div>

    </AppLayout>
  );
}

/* =============================================================
   SUMMARY ITEM
============================================================= */

function SummaryItem({ label, value }) {
  return (
    <div className="border-b border-white/10 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-6">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {value}
      </p>

    </div>
  );
}

/* =============================================================
   INFORMATION ITEM
============================================================= */

function InfoItem({
  icon,
  label,
  value,
  valueClass = "text-slate-700",
}) {
  return (
    <div className="border-b border-slate-100 p-5 sm:p-6">

      <div className="flex gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p
            className={`mt-1 break-words text-sm font-semibold ${valueClass}`}
          >
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}