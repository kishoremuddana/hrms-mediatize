import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  UserRound,
  Award,
  AlertCircle,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  Bell,
  CheckCircle2,
  CircleUserRound,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import DashboardDateTime from "../../shared/components/DashboardDateTime";
import { useAuth } from "../hooks/useAuth";
import { getMyLeaveBalance } from "../../leave_service/services/leaveApi";

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await getMyLeaveBalance();
        setBalances(res.data || []);
      } catch (err) {
        console.error("Failed to fetch leave balance summary", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const employeeName =
    user?.email?.split("@")[0] || "Employee";

  /*
   * Calculate summary values from the real leave API data.
   */
  const leaveSummary = useMemo(() => {
    return balances.reduce(
      (summary, balance) => {
        const allocated = Number(balance.allocated_days || 0);
        const used = Number(balance.used_days || 0);
        const pending = Number(balance.pending_days || 0);

        summary.allocated += allocated;
        summary.used += used;
        summary.pending += pending;

        return summary;
      },
      {
        allocated: 0,
        used: 0,
        pending: 0,
      }
    );
  }, [balances]);

  const remaining =
    leaveSummary.allocated -
    leaveSummary.used -
    leaveSummary.pending;

  return (
    <AppLayout title="Employee Portal">
      <div className="min-h-full bg-[#f6f7f4]">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="mb-6 overflow-hidden rounded-3xl bg-[#17251f] text-white shadow-sm">

          <div className="relative p-6 sm:p-8">

            {/* Decorative shapes */}
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#2f6b4f]/30 blur-2xl" />

            <div className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-[#527d64]/20 blur-2xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-[#7fb596]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a8c8b3]">
                    Employee Workspace
                  </span>

                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Hello,{" "}
                  <span className="text-[#8fc09e]">
                    {employeeName}
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#b9c8c0]">
                  Manage your leave, attendance, profile and employee
                  services from one place.
                </p>

              </div>


              <div className="flex flex-wrap items-center gap-3">

                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                  <DashboardDateTime variant="employee"/>
                </div>

                <Link
                  to="/employee/leave"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-[#3b805d]
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#4b916c]
                  "
                >
                  Apply Leave
                  <ArrowUpRight size={16} />
                </Link>

              </div>

            </div>
          </div>
        </section>


        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <section className="mb-7">

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            <SummaryCard
              label="Total Allocated"
              value={leaveSummary.allocated}
              suffix="days"
              icon={<CalendarDays size={19} />}
              iconClass="bg-[#e8f2ec] text-[#2f6b4f]"
            />

            <SummaryCard
              label="Days Used"
              value={leaveSummary.used}
              suffix="days"
              icon={<Clock3 size={19} />}
              iconClass="bg-[#f1f3f1] text-[#52615a]"
            />

            <SummaryCard
              label="Pending"
              value={leaveSummary.pending}
              suffix="days"
              icon={<FileText size={19} />}
              iconClass="bg-[#fff6e5] text-[#b7791f]"
            />

            <SummaryCard
              label="Available"
              value={Math.max(remaining, 0)}
              suffix="days"
              icon={<CheckCircle2 size={19} />}
              iconClass="bg-[#e8f2ec] text-[#2f6b4f]"
            />

          </div>

        </section>


        {/* =====================================================
            MAIN DASHBOARD
        ====================================================== */}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">

          {/* ===================================================
              LEAVE OVERVIEW
          ==================================================== */}

          <div className="rounded-2xl border border-[#e1e6e1] bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-4 sm:px-6">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2f6b4f]">
                  My Workspace
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#1f2933]">
                  Leave Overview
                </h2>
              </div>

              <Link
                to="/employee/leave"
                className="
                  hidden
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-[#2f6b4f]
                  hover:text-[#24543e]
                  sm:flex
                "
              >
                View all
                <ArrowUpRight size={14} />
              </Link>

            </div>


            <div className="p-5 sm:p-6">

              {loading ? (

                <div className="py-12 text-center">

                  <div className="mx-auto mb-3 flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-[#e8f2ec] text-[#2f6b4f]">
                    <CalendarDays size={18} />
                  </div>

                  <p className="text-sm font-semibold text-[#52615a]">
                    Loading leave information...
                  </p>

                </div>

              ) : balances.length === 0 ? (

                <div className="rounded-xl border border-dashed border-[#dce3dd] bg-[#fafbf9] p-8 text-center">

                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff6e5] text-[#b7791f]">
                    <CalendarDays size={20} />
                  </div>

                  <h3 className="text-sm font-bold text-[#1f2933]">
                    No leave balances available
                  </h3>

                  <p className="mt-1 text-xs text-[#7b857f]">
                    Leave allocations haven't been assigned yet.
                  </p>

                </div>

              ) : (

                <div className="space-y-5">

                  {balances.map((balance) => {

                    const allocated =
                      Number(balance.allocated_days || 0);

                    const used =
                      Number(balance.used_days || 0);

                    const pending =
                      Number(balance.pending_days || 0);

                    const available = Math.max(
                      allocated - used - pending,
                      0
                    );

                    const percentage = allocated
                      ? Math.min(
                          100,
                          (used / allocated) * 100
                        )
                      : 0;

                    return (
                      <div key={balance.id || balance.leave_type_id}>

                        <div className="mb-2 flex items-center justify-between">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef6f0] text-[#2f6b4f]">
                              <CalendarDays size={17} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-[#26352e]">
                                {balance.leave_type_name}
                              </p>

                              <p className="text-[10px] text-[#929b96]">
                                {balance.year}
                              </p>
                            </div>

                          </div>

                          <div className="text-right">

                            <p className="text-sm font-bold text-[#2f6b4f]">
                              {available}
                            </p>

                            <p className="text-[10px] text-[#929b96]">
                              available
                            </p>

                          </div>

                        </div>


                        <div className="h-2 overflow-hidden rounded-full bg-[#edf0ed]">

                          <div
                            className="h-full rounded-full bg-[#2f6b4f] transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>


                        <div className="mt-2 flex items-center justify-between text-[10px] text-[#929b96]">

                          <span>
                            Used {used} of {allocated}
                          </span>

                          <span>
                            Pending {pending}
                          </span>

                        </div>

                      </div>
                    );
                  })}

                </div>

              )}

            </div>

          </div>


          {/* ===================================================
              QUICK ACCESS
          ==================================================== */}

          <div className="rounded-2xl border border-[#e1e6e1] bg-white shadow-sm">

            <div className="border-b border-[#edf0ed] px-5 py-4">

              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2f6b4f]">
                Shortcuts
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#1f2933]">
                Quick Access
              </h2>

            </div>


            <div className="p-3">

              <QuickLink
                icon={<CalendarDays size={18} />}
                title="Apply for Leave"
                description="Submit a new leave request"
                to="/employee/leave"
              />

              <QuickLink
                icon={<Clock3 size={18} />}
                title="Attendance"
                description="View your attendance"
                to="/employee/attendance"
              />

              <QuickLink
                icon={<CircleUserRound size={18} />}
                title="My Profile"
                description="View your employee details"
                to="/employee/profile"
              />

              <QuickLink
                icon={<Award size={18} />}
                title="Performance"
                description="Review your performance"
                to="/employee/performance"
              />

              <QuickLink
                icon={<AlertCircle size={18} />}
                title="Complaints"
                description="Manage workplace complaints"
                to="/employee/complaints"
              />

              <QuickLink
                icon={<Bell size={18} />}
                title="Notifications"
                description="View your notifications"
                to="/notifications"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            SERVICES
        ====================================================== */}

        <section className="mt-5 rounded-2xl border border-[#dce9df] bg-[#eef6f0] p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2f6b4f] shadow-sm">
                <BriefcaseBusiness size={19} />
              </div>

              <div>

                <h3 className="text-sm font-bold text-[#26352e]">
                  Employee Self-Service
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#737d77]">
                  Access your HR services whenever you need them.
                </p>

              </div>

            </div>

            <Link
              to="/employee/profile"
              className="
                inline-flex
                items-center
                gap-2
                text-xs
                font-bold
                text-[#2f6b4f]
                hover:text-[#24543e]
              "
            >
              Open workspace
              <ArrowUpRight size={14} />
            </Link>

          </div>

        </section>

      </div>
    </AppLayout>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  suffix,
  icon,
  iconClass,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-[#e1e6e1]
        bg-white
        p-4
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between">

        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            ${iconClass}
          `}
        >
          {icon}
        </div>

      </div>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-[#929b96]">
        {label}
      </p>

      <div className="mt-1 flex items-baseline gap-1">

        <span className="text-2xl font-extrabold tracking-tight text-[#1f2933]">
          {value}
        </span>

        <span className="text-[10px] font-medium text-[#929b96]">
          {suffix}
        </span>

      </div>
    </div>
  );
}


/* =========================================================
   QUICK LINK
========================================================= */

function QuickLink({
  icon,
  title,
  description,
  to,
}) {
  return (
    <Link
      to={to}
      className="
        group
        flex
        items-center
        gap-3
        rounded-xl
        px-3
        py-3
        transition
        hover:bg-[#f3f6f3]
      "
    >

      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[#eef6f0]
          text-[#2f6b4f]
          transition
          group-hover:bg-[#dce9df]
        "
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-xs font-semibold text-[#35433c]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-[#929b96]">
          {description}
        </p>

      </div>

      <ChevronRight
        size={15}
        className="
          shrink-0
          text-[#c5cec8]
          transition
          group-hover:translate-x-0.5
          group-hover:text-[#2f6b4f]
        "
      />

    </Link>
  );
}