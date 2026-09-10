import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Tags,
  WalletCards,
  ClipboardList,
  Bell,
  UserRound,
  FolderGit2,
  FolderKanban,
  Megaphone,
  FileText,
  AlertCircle,
  Award,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../../authentication_service/hooks/useAuth";

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onItemClick,
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || "EMPLOYEE";

  const userName =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.email ||
    "User";

  const profilePhoto = user?.profile_photo_url || null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems =
    role === "HR"
      ? [
          {
            label: "Dashboard",
            path: "/hr/dashboard",
            icon: LayoutDashboard,
          },
          {
            label: "My Profile",
            path: "/hr/profile",
            icon: UserRound,
          },
          {
            label: "Employees",
            path: "/hr/employees",
            icon: Users,
          },
          {
            label: "Performance",
            path: "/hr/performance",
            icon: TrendingUp,
          },
          {
            label: "Projects",
            path: "/hr/projects",
            icon: FolderGit2,
          },
          {
            label: "Project Roles",
            path: "/hr/project-roles",
            icon: FolderKanban,
          },
          {
            label: "Announcements",
            path: "/hr/announcements",
            icon: Megaphone,
          },
          {
            label: "Work Reports",
            path: "/hr/work-reports",
            icon: FileText,
          },
          {
            label: "Complaints",
            path: "/hr/complaints",
            icon: AlertCircle,
          },
          {
            label: "Attendance",
            path: "/hr/attendance",
            icon: CalendarCheck,
          },
          {
            label: "Leave Requests",
            path: "/hr/leaves",
            icon: CalendarDays,
          },
          {
            label: "Leave Types",
            path: "/hr/leave-types",
            icon: Tags,
          },
          {
            label: "Leave Balances",
            path: "/hr/leave-balances",
            icon: WalletCards,
          },
          {
            label: "Audit Logs",
            path: "/hr/audit-logs",
            icon: ClipboardList,
          },
          {
            label: "Notifications",
            path: "/notifications",
            icon: Bell,
          },
        ]
      : [
          {
            label: "Dashboard",
            path: "/employee/dashboard",
            icon: LayoutDashboard,
          },
          {
            label: "My Profile",
            path: "/employee/profile",
            icon: UserRound,
          },
          {
            label: "My Performance",
            path: "/employee/performance",
            icon: Award,
          },
          {
            label: "My Projects",
            path: "/employee/projects",
            icon: FolderGit2,
          },
          {
            label: "Announcements",
            path: "/employee/announcements",
            icon: Megaphone,
          },
          {
            label: "Work Reports",
            path: "/employee/work-reports",
            icon: FileText,
          },
          {
            label: "Complaints",
            path: "/employee/complaints",
            icon: AlertCircle,
          },
          {
            label: "Attendance",
            path: "/employee/attendance",
            icon: CalendarCheck,
          },
          {
            label: "Apply for Leave",
            path: "/employee/leave",
            icon: CalendarDays,
          },
          {
            label: "Notifications",
            path: "/notifications",
            icon: Bell,
          },
        ];

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <aside
      className={`
        hidden
        lg:flex
        fixed
        left-0
        top-0
        z-40

        h-screen
        max-h-screen

        flex-col

        border-r
        border-white/10

        bg-[#17251F]
        text-white

        transition-[width]
        duration-300
        ease-in-out

        ${
          isCollapsed
            ? "w-[76px]"
            : "w-[260px]"
        }
      `}
    >
      {/* =====================================================
          BRAND
      ====================================================== */}
      <div
        className={`
          flex
          h-[76px]
          min-h-[76px]
          shrink-0
          items-center

          border-b
          border-white/10

          ${
            isCollapsed
              ? "justify-center px-3"
              : "justify-between px-5"
          }
        `}
      >
        {/* Brand */}
        <div
          className={`
            min-w-0

            flex
            items-center

            ${
              isCollapsed
                ? "justify-center"
                : "gap-3"
            }
          `}
        >
          {/* Logo */}
          <div
            className="
              flex
              h-10
              w-10
              shrink-0

              items-center
              justify-center

              rounded-xl

              bg-emerald-700

              text-sm
              font-extrabold
              text-white

              shadow-lg
              shadow-emerald-950/20
            "
            title="Mediatize HRMS"
          >
            M
          </div>

          {/* Brand text */}
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-white">
                Mediatize
              </p>

              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-300">
                HRMS
              </p>
            </div>
          )}
        </div>

        {/* Collapse button */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="
              flex
              h-8
              w-8
              shrink-0

              items-center
              justify-center

              rounded-lg

              text-slate-400

              transition-colors

              hover:bg-white/10
              hover:text-white

              focus:outline-none
              focus:ring-2
              focus:ring-emerald-400/40
            "
          >
            <ChevronLeft size={17} />
          </button>
        )}
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <nav
        className="
          flex-1
          min-h-0

          overflow-x-hidden
          overflow-y-auto

          px-3
          py-5

          overscroll-contain

          scrollbar-thin
        "
      >
        {/* Navigation heading */}
        {!isCollapsed && (
          <div className="mb-3 px-3">
            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]

                text-slate-500
              "
            >
              Navigation
            </span>
          </div>
        )}

        {/* Navigation items */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path;

            const IconComponent = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                title={
                  isCollapsed
                    ? item.label
                    : undefined
                }
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
                className={`
                  group
                  relative

                  flex
                  min-w-0
                  w-full
                  items-center

                  rounded-xl

                  py-2.5

                  text-sm
                  font-medium

                  transition-all
                  duration-200

                  ${
                    isCollapsed
                      ? "justify-center px-2"
                      : "gap-3 px-3"
                  }

                  ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <span
                    className="
                      absolute
                      left-0

                      h-6
                      w-1

                      rounded-r-full

                      bg-emerald-300
                    "
                  />
                )}

                {/* Icon */}
                <IconComponent
                  size={18}
                  strokeWidth={
                    isActive ? 2.2 : 1.9
                  }
                  className={`
                    shrink-0
                    transition-colors

                    ${
                      isActive
                        ? "text-white"
                        : "text-slate-500 group-hover:text-emerald-300"
                    }
                  `}
                />

                {/* Label */}
                {!isCollapsed && (
                  <span className="min-w-0 truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* =====================================================
          USER / ROLE AREA
      ====================================================== */}
      <div
        className="
          shrink-0

          border-t
          border-white/10

          bg-[#17251F]

          p-3
        "
      >
        {/* User information */}
        {!isCollapsed && (
          <div
            className="
              mb-3

              rounded-xl

              border
              border-white/10

              bg-white/[0.04]

              p-3
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              {/* Profile photo */}
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={userName}
                  className="
                    h-9
                    w-9
                    shrink-0

                    rounded-full

                    border
                    border-white/20

                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    bg-emerald-700

                    text-xs
                    font-bold
                    text-white
                  "
                >
                  {initials}
                </div>
              )}

              {/* User details */}
              <div className="min-w-0 flex-1">
                <p
                  className="
                    truncate

                    text-xs
                    font-semibold
                    text-white
                  "
                  title={userName}
                >
                  {userName}
                </p>

                <p
                  className="
                    mt-0.5

                    truncate

                    text-[10px]
                    font-medium

                    uppercase
                    tracking-wide

                    text-emerald-300
                  "
                >
                  {role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            LOGOUT
        ==================================================== */}
        <button
          type="button"
          onClick={handleLogout}
          title={
            isCollapsed
              ? "Logout"
              : undefined
          }
          className={`
            group

            flex
            w-full
            items-center

            rounded-xl

            py-2.5

            text-sm
            font-medium

            text-slate-400

            transition-all
            duration-200

            hover:bg-red-500/10
            hover:text-red-300

            focus:outline-none
            focus:ring-2
            focus:ring-red-400/30

            ${
              isCollapsed
                ? "justify-center px-2"
                : "gap-3 px-3"
            }
          `}
        >
          <LogOut
            size={18}
            strokeWidth={1.9}
            className="
              shrink-0
              transition-colors

              group-hover:text-red-300
            "
          />

          {!isCollapsed && (
            <span>Logout</span>
          )}
        </button>

        {/* ===================================================
            EXPAND BUTTON
        ==================================================== */}
        {isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="
              mt-2

              flex
              w-full

              items-center
              justify-center

              rounded-xl

              py-2.5

              text-slate-400

              transition-colors

              hover:bg-white/10
              hover:text-white

              focus:outline-none
              focus:ring-2
              focus:ring-emerald-400/40
            "
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}