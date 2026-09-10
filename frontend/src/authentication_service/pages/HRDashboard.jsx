import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Clock3,
  CalendarDays,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  AlertCircle,
  Award,
  FileText,
  Tags,
  WalletCards,
  FolderKanban,
  ClipboardList,
  Megaphone,
  BriefcaseBusiness,
  ChevronRight,
  UserRound,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import DashboardDateTime from "../../shared/components/DashboardDateTime";
import { useAuth } from "../hooks/useAuth";

export default function HRDashboard() {
  const { user } = useAuth();

  const hrName =
    user?.email?.split("@")[0] || "HR Admin";

  return (
    <AppLayout title="HR Administration Portal">

      <div className="min-h-full bg-[#f6f7f4] px-3 py-4 sm:px-5 sm:py-6 lg:px-7">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section
          className="
            relative
            mb-7
            overflow-hidden
            rounded-3xl
            bg-[#17251f]
            text-white
            shadow-sm
          "
        >

          {/* Decorative background */}
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-[#2f6b4f]/30
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              right-1/3
              h-56
              w-56
              rounded-full
              bg-[#6b9b78]/10
              blur-3xl
            "
          />

          <div className="relative p-6 sm:p-8">

            <div
              className="
                flex
                flex-col
                gap-7
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >

              {/* Hero text */}
              <div>

                <div className="mb-3 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-[#83b596]" />

                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-[#a8c8b3]
                    "
                  >
                    HR Administration
                  </span>

                </div>

                <h1
                  className="
                    text-3xl
                    font-bold
                    tracking-tight
                    sm:text-4xl
                  "
                >
                  Hello,{" "}
                  <span className="text-[#8fc09e]">
                    {hrName}
                  </span>
                </h1>

                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-6
                    text-[#b9c8c0]
                  "
                >
                  Manage your workforce, employee operations and
                  HR services from one centralized workspace.
                </p>

              </div>


              {/* Hero actions */}
              <div className="flex flex-wrap items-center gap-3">

                <div
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.06]
                    px-4
                    py-3
                  "
                >
                  <DashboardDateTime />
                </div>

                <Link
                  to="/hr/employees/new"
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
                  <Plus size={16} />
                  Add Employee
                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            WORKFORCE OVERVIEW
        ====================================================== */}

        <section className="mb-8">

          <SectionHeading
            eyebrow="Overview"
            title="Workforce Operations"
            description="Quick access to the areas that need your attention."
          />


          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >

            <OverviewCard
              icon={<Users size={20} />}
              iconClass="bg-[#e8f2ec] text-[#2f6b4f]"
              title="Employees"
              status="Manage"
              description="View and manage employee profiles."
              to="/hr/employees"
            />

            <OverviewCard
              icon={<Clock3 size={20} />}
              iconClass="bg-[#edf5ef] text-[#356b4e]"
              title="Attendance"
              status="Monitor"
              description="Review employee attendance records."
              to="/hr/attendance"
            />

            <OverviewCard
              icon={<CalendarDays size={20} />}
              iconClass="bg-[#fff6e5] text-[#b7791f]"
              title="Leave Requests"
              status="Review"
              description="Approve or reject employee leave."
              to="/hr/leaves"
            />

            <OverviewCard
              icon={<ShieldCheck size={20} />}
              iconClass="bg-[#f1f3f1] text-[#52615a]"
              title="Security"
              status="Protected"
              description="Review system security activity."
              to="/hr/audit-logs"
            />

          </div>

        </section>


        {/* =====================================================
            MAIN MANAGEMENT AREA
        ====================================================== */}

        <section
          className="
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-[1fr_360px]
          "
        >

          {/* LEFT */}
          <div
            className="
              rounded-2xl
              border
              border-[#e1e6e1]
              bg-white
              shadow-sm
            "
          >

            <div
              className="
                border-b
                border-[#edf0ed]
                px-5
                py-5
                sm:px-6
              "
            >

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#2f6b4f]
                "
              >
                Management
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#1f2933]">
                Employee Operations
              </h2>

              <p className="mt-1 text-sm text-[#737d77]">
                Manage the core HR operations of your organization.
              </p>

            </div>


            <div className="divide-y divide-[#edf0ed]">

              <ManagementRow
                icon={<Users size={18} />}
                title="Employee Directory"
                description="Search, create and manage employee profiles."
                to="/hr/employees"
              />

              <ManagementRow
                icon={<Clock3 size={18} />}
                title="Attendance Management"
                description="Monitor employee attendance and records."
                to="/hr/attendance"
              />

              <ManagementRow
                icon={<FileText size={18} />}
                title="Work Reports"
                description="Review employee work submissions and progress."
                to="/hr/work-reports"
              />

              <ManagementRow
                icon={<Award size={18} />}
                title="Performance & Analytics"
                description="Manage evaluations, ratings and performance."
                to="/hr/performance"
              />

              <ManagementRow
                icon={<BriefcaseBusiness size={18} />}
                title="Projects"
                description="Manage employee projects and assignments."
                to="/hr/projects"
              />

              <ManagementRow
                icon={<FolderKanban size={18} />}
                title="Project Roles"
                description="Configure project roles and responsibilities."
                to="/hr/project-roles"
              />

            </div>

          </div>


          {/* RIGHT */}
          <div
            className="
              rounded-2xl
              border
              border-[#e1e6e1]
              bg-white
              shadow-sm
            "
          >

            <div
              className="
                border-b
                border-[#edf0ed]
                px-5
                py-5
              "
            >

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#2f6b4f]
                "
              >
                Actions
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#1f2933]">
                HR Actions
              </h2>

              <p className="mt-1 text-sm text-[#737d77]">
                Frequently used HR operations.
              </p>

            </div>


            <div className="p-3">

              <ActionLink
                icon={<Plus size={17} />}
                title="Add Employee"
                description="Create a new employee profile"
                to="/hr/employees/new"
              />

              <ActionLink
                icon={<CalendarDays size={17} />}
                title="Leave Requests"
                description="Review pending applications"
                to="/hr/leaves"
              />

              <ActionLink
                icon={<AlertCircle size={17} />}
                title="Complaints"
                description="Manage workplace complaints"
                to="/hr/complaints"
              />

              <ActionLink
                icon={<ClipboardList size={17} />}
                title="Audit Logs"
                description="Review system activity"
                to="/hr/audit-logs"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            CONFIGURATION
        ====================================================== */}

        <section className="mt-7">

          <SectionHeading
            eyebrow="Administration"
            title="Configuration & Services"
            description="Manage supporting HRMS configuration and services."
          />


          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >

            <ServiceCard
              icon={<Tags size={19} />}
              title="Leave Types"
              description="Configure available leave categories."
              to="/hr/leave-types"
            />

            <ServiceCard
              icon={<WalletCards size={19} />}
              title="Leave Balances"
              description="Manage employee leave allocations."
              to="/hr/leave-balances"
            />

            <ServiceCard
              icon={<Megaphone size={19} />}
              title="Announcements"
              description="Publish organization announcements."
              to="/hr/announcements"
            />

            <ServiceCard
              icon={<AlertCircle size={19} />}
              title="Complaint Categories"
              description="Configure complaint classifications."
              to="/hr/complaint-categories"
            />

          </div>

        </section>


        {/* =====================================================
            ADMIN ACCOUNT
        ====================================================== */}

        <section
          className="
            mt-7
            rounded-2xl
            border
            border-[#dce9df]
            bg-[#eef6f0]
            p-5
            sm:p-6
          "
        >

          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-[#2f6b4f]
                  shadow-sm
                "
              >
                <UserRound size={19} />
              </div>

              <div>

                <p className="text-sm font-bold text-[#26352e]">
                  Administrator Account
                </p>

                <p className="mt-1 text-xs text-[#737d77]">
                  {user?.email || "HR Admin"} ·{" "}
                  {user?.role || "HR"}
                </p>

              </div>

            </div>


            <Link
              to="/hr/audit-logs"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-[#2f6b4f]
                hover:text-[#24543e]
              "
            >
              View security logs
              <ArrowUpRight size={15} />
            </Link>

          </div>

        </section>

      </div>

    </AppLayout>
  );
}


/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-4">

      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-[#2f6b4f]
        "
      >
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-bold text-[#1f2933]">
        {title}
      </h2>

      <p className="mt-1 text-sm text-[#737d77]">
        {description}
      </p>

    </div>
  );
}


/* =========================================================
   OVERVIEW CARD
========================================================= */

function OverviewCard({
  icon,
  iconClass,
  title,
  status,
  description,
  to,
}) {
  return (
    <Link
      to={to}
      className="
        group
        rounded-2xl
        border
        border-[#e1e6e1]
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#c8ddce]
        hover:shadow-md
      "
    >

      <div className="flex items-start justify-between">

        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            ${iconClass}
          `}
        >
          {icon}
        </div>

        <ArrowUpRight
          size={16}
          className="
            text-[#ccd4ce]
            transition
            group-hover:text-[#2f6b4f]
          "
        />

      </div>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-wide text-[#929b96]">
        {title}
      </p>

      <h3 className="mt-1 text-xl font-bold text-[#1f2933]">
        {status}
      </h3>

      <p className="mt-1 text-xs leading-5 text-[#737d77]">
        {description}
      </p>

    </Link>
  );
}


/* =========================================================
   MANAGEMENT ROW
========================================================= */

function ManagementRow({
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
        gap-4
        px-5
        py-4
        transition
        hover:bg-[#f7f9f7]
        sm:px-6
      "
    >

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#eaf3ed]
          text-[#2f6b4f]
        "
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <h3 className="text-sm font-bold text-[#26352e]">
          {title}
        </h3>

        <p className="mt-1 truncate text-xs text-[#929b96]">
          {description}
        </p>

      </div>

      <ChevronRight
        size={17}
        className="
          shrink-0
          text-[#c5cec8]
          transition
          group-hover:translate-x-1
          group-hover:text-[#2f6b4f]
        "
      />

    </Link>
  );
}


/* =========================================================
   ACTION LINK
========================================================= */

function ActionLink({
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
        "
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-xs font-semibold text-[#35433c]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-[#929b96]">
          {description}
        </p>

      </div>

      <ChevronRight
        size={14}
        className="
          text-[#c5cec8]
          transition
          group-hover:translate-x-1
          group-hover:text-[#2f6b4f]
        "
      />

    </Link>
  );
}


/* =========================================================
   SERVICE CARD
========================================================= */

function ServiceCard({
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
        rounded-2xl
        border
        border-[#e1e6e1]
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#c8ddce]
        hover:shadow-md
      "
    >

      <div className="flex items-start justify-between">

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-[#eef6f0]
            text-[#2f6b4f]
          "
        >
          {icon}
        </div>

        <ArrowUpRight
          size={15}
          className="
            text-[#ccd4ce]
            transition
            group-hover:text-[#2f6b4f]
          "
        />

      </div>

      <h3 className="mt-5 text-sm font-bold text-[#26352e]">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-[#737d77]">
        {description}
      </p>

    </Link>
  );
}