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
  LogOut,
  X,
} from "lucide-react";

import { useAuth } from "../../authentication_service/hooks/useAuth";

export default function MobileMenu({ isOpen, onClose }) {
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
    onClose();
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
    <>
      {/* =====================================================
          BACKDROP
      ====================================================== */}
      <div
        className={`
          fixed
          inset-0
          bg-black/40
          backdrop-blur-[2px]
          z-[90]
          transition-opacity
          duration-300
          lg:hidden
          ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}
      <aside
        className={`
          fixed
          top-0
          left-0
          bottom-0
          z-[100]

          w-[min(84vw,320px)]
          sm:w-[300px]

          bg-[#17251f]
          text-white

          flex
          flex-col

          shadow-2xl

          transition-transform
          duration-300
          ease-in-out

          lg:hidden

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        {/* ===================================================
            HEADER
        ==================================================== */}
        <div
          className="
            shrink-0
            flex
            items-center
            justify-between
            gap-3

            px-4
            py-4

            border-b
            border-white/10
          "
        >
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="
                w-10
                h-10
                shrink-0

                rounded-xl

                bg-[#2f6b4f]
                text-white

                flex
                items-center
                justify-center

                font-bold
                text-sm

                shadow-sm
              "
            >
              M
            </div>

            <div className="min-w-0">
              <div
                className="
                  text-sm
                  font-bold
                  text-white
                  truncate
                "
              >
                Mediatize HRMS
              </div>

              <div
                className="
                  mt-0.5
                  text-[10px]
                  font-medium
                  text-emerald-200
                  truncate
                "
              >
                {role === "HR"
                  ? "HR Administration"
                  : "Employee Portal"}
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="
              w-9
              h-9
              shrink-0

              flex
              items-center
              justify-center

              rounded-xl

              border
              border-white/10

              bg-white/5

              text-slate-300

              hover:bg-white/10
              hover:text-white

              transition-colors

              focus:outline-none
              focus:ring-2
              focus:ring-emerald-400/50
            "
            aria-label="Close navigation menu"
          >
            <X size={19} strokeWidth={2} />
          </button>
        </div>

        {/* ===================================================
            NAVIGATION
        ==================================================== */}
        <nav
          className="
            flex-1
            min-h-0

            overflow-y-auto
            overflow-x-hidden

            px-3
            py-4

            overscroll-contain

            scrollbar-thin
          "
          aria-label="Mobile navigation links"
        >
          {/* Heading */}
          <div
            className="
              px-3
              pb-2

              text-[10px]
              font-bold
              uppercase
              tracking-[0.12em]

              text-emerald-300
            "
          >
            Navigation
          </div>

          {/* Navigation items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;

              const isActive =
                location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  className={`
                    group

                    w-full
                    min-w-0

                    flex
                    items-center
                    gap-3

                    px-3
                    py-2.5

                    rounded-xl

                    text-sm
                    font-medium

                    transition-all
                    duration-200

                    ${
                      isActive
                        ? "!bg-[#e8f2ec] !text-[#064e3b] font-semibold shadow-sm"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  {/* Icon */}
                  <span
                    className={`
                      w-9
                      h-9
                      shrink-0

                      rounded-lg

                      flex
                      items-center
                      justify-center

                      transition-colors

                      ${
                        isActive
                          ? "!bg-[#d7e9dc] !text-[#087f47]"
                          : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-emerald-300"
                      }
                    `}
                  >
                    <IconComponent
                      size={18}
                      strokeWidth={2}
                    />
                  </span>

                  {/* Label */}
                  <span className="min-w-0 truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ===================================================
            USER + LOGOUT
        ==================================================== */}
        <div
          className="
            shrink-0

            p-3

            border-t
            border-white/10

            bg-[#14221d]
          "
        >
          {/* User */}
          <div
            className="
              mb-2

              flex
              items-center
              gap-3

              min-w-0

              px-3
              py-2.5

              rounded-xl

              bg-white/5

              border
              border-white/10
            "
          >
            {/* Profile photo */}
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={userName}
                className="
                  w-9
                  h-9
                  shrink-0

                  rounded-full

                  object-cover

                  border
                  border-white/10
                "
              />
            ) : (
              <div
                className="
                  w-9
                  h-9
                  shrink-0

                  rounded-full

                  bg-[#2f6b4f]

                  text-white

                  flex
                  items-center
                  justify-center

                  text-[11px]
                  font-bold
                "
              >
                {initials}
              </div>
            )}

            {/* User details */}
            <div className="min-w-0 flex-1">
              <div
                className="
                  text-xs
                  font-semibold
                  text-white

                  truncate
                "
              >
                {userName}
              </div>

              <div
                className="
                  mt-0.5

                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.08em]

                  text-emerald-300
                "
              >
                {role}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full

              flex
              items-center
              gap-3

              px-3
              py-2.5

              rounded-xl

              border
              border-red-300/20

              bg-white

              text-[#a24b40]

              text-sm
              font-semibold

              hover:bg-red-50

              transition-colors

              focus:outline-none
              focus:ring-2
              focus:ring-red-300/40
            "
          >
            <LogOut
              size={18}
              strokeWidth={2}
            />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}