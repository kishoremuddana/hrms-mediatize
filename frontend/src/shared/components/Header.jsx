import React, { useEffect,useRef, useState } from "react";
import { Menu, UserRound, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authentication_service/hooks/useAuth";
import NotificationBell from "../../notification_service/components/NotificationBell";
import { Avatar } from "./Badge";

export default function Header({ pageTitle, onOpenMobileMenu }) {
  const { user,logout } = useAuth();
  const navigate = useNavigate();

  const [now, setNow] = useState(() => new Date());
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // ============================================================
  // LIVE CLOCK
  // ============================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ============================================================
  // CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
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

  // ============================================================
  // USER INFORMATION
  // ============================================================
  const userName =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.email ||
    "User";

  const userRole = user?.role || "EMPLOYEE";

  const profilePhoto = user?.profile_photo_url || null;
  

  // ============================================================
  // PROFILE NAVIGATION
  // ============================================================
  const profilePath =
    userRole === "HR"
      ? "/hr/profile"
      : "/employee/profile";
  const handleProfileClick = () => {
    setProfileOpen(false);
    navigate(profilePath);
  };
  // ============================================================
  // LOGOUT
  // ============================================================
  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };
  // ============================================================
  // DATE & TIME
  // ============================================================

  const dateFull = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const dateShort = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <header className="hrms-header">

      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <div className="hrms-header-left">

        {/* Mobile Menu Button */}

        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="
            hrms-hamburger-btn

            shrink-0

            items-center
            justify-center

            w-9
            h-9

            rounded-xl

            border
            border-[#dfe4df]

            bg-white

            text-[#34443c]

            hover:bg-[#f0f4f0]

            active:scale-[0.97]

            transition-all

            focus:outline-none
            focus:ring-2
            focus:ring-[#2f6b4f]/30
          "
          aria-label="Open navigation menu"
          title="Open Menu"
        >
          <Menu
            size={20}
            strokeWidth={2}
          />
        </button>

        {/* Page Information */}

        <div className="min-w-0 flex-1 overflow-hidden">

          <h1
            className="
              hrms-page-title

              truncate

              text-[1.05rem]
              font-bold
              text-[#1f2933]

              leading-tight
            "
          >
            {pageTitle || "Mediatize HRMS"}
          </h1>

          {/* Desktop / Tablet subtitle */}

          <div
            className="
              hidden
              md:block

              mt-0.5

              truncate

              text-[11px]
              font-medium

              text-[#8a948e]
            "
          >
            Human Resource Management System
          </div>

        </div>
      </div>


      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div
        className="
          hrms-header-right

          shrink-0

          flex
          items-center

          gap-2
          sm:gap-3
        "
      >

        {/* ===================================================
            NOTIFICATIONS
        ==================================================== */}

        <div
          className="
            shrink-0

            flex
            items-center
            justify-center

            w-9
            h-9

            rounded-xl

            border
            border-[#e1e6e1]

            bg-white

            text-[#34443c]

            hover:bg-[#f0f4f0]

            transition-colors
          "
        >
          <NotificationBell />
        </div>


        {/* ===================================================
            DATE & TIME
        ==================================================== */}

        <div
          className="
            hrms-header-datetime
            hidden
            sm:flex

            shrink-0

            items-center

            px-2
            sm:px-3

            py-1.5

            border-l
            border-r
            border-[#e5e7e2]
          "
        >
          <div
            className="
              flex
              flex-col
              items-end

              leading-tight
            "
          >

            {/* Large screens */}

            <span
              className="
                hidden
                lg:block

                text-[11px]
                font-medium

                text-[#7b857f]

                whitespace-nowrap
              "
            >
              {dateFull}
            </span>


            {/* Tablet */}

            <span
              className="
                block
                lg:hidden

                text-[11px]
                font-medium

                text-[#7b857f]

                whitespace-nowrap
              "
            >
              {dateShort}
            </span>


            {/* Time */}

            <span
              className="
                mt-0.5

                text-xs
                font-bold

                text-[#26352e]

                tabular-nums
                whitespace-nowrap
              "
            >
              {timeStr}
            </span>

          </div>
        </div>


        {/* ===================================================
            USER PROFILE
        ==================================================== */}

        <div
          ref={profileRef}
          className="relative shrink-0"
        >

          {/* =================================================
              PROFILE BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                (previous) => !previous
              )
            }
            className="
              hrms-user-profile

              flex
              items-center

              gap-2

              px-1.5
              sm:px-2

              py-1.5

              rounded-xl

              border
              border-[#e1e6e1]

              bg-[#f5f7f4]

              max-w-[42px]
              sm:max-w-[180px]
              md:max-w-[220px]

              cursor-pointer

              transition-all

              hover:bg-[#edf2ed]

              focus:outline-none
              focus:ring-2
              focus:ring-[#2f6b4f]/20
            "
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >

            {/* Avatar */}

            <div className="shrink-0">

              <Avatar
                src={profilePhoto}
                name={userName}
                size="sm"
              />

            </div>


            {/* User Information */}

            <div
              className="
                hrms-user-info
                hidden
                md:flex

                min-w-0
                flex-col

                leading-tight

                text-left
              "
            >

              <span
                className="
                  max-w-[140px]

                  truncate

                  text-xs
                  font-semibold

                  text-[#26352e]
                "
                title={userName}
              >
                {userName}
              </span>


              <span
                className="
                  mt-0.5

                  text-[9px]
                  font-bold

                  uppercase
                  tracking-[0.08em]

                  text-[#2f6b4f]

                  whitespace-nowrap
                "
              >
                {userRole}
              </span>

            </div>

          </button>


          {/* =================================================
              PROFILE DROPDOWN
          ================================================== */}

          {profileOpen && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+10px)]

                z-50

                w-[290px]

                overflow-hidden

                rounded-2xl

                border
                border-[#e1e6e1]

                bg-white

                shadow-xl
              "
            >

              {/* =============================================
                  USER HEADER
              ============================================== */}

              <div
                className="
                  border-b
                  border-[#edf0ed]

                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  {/* Profile Image */}

                  <div className="shrink-0">

                    <Avatar
                      src={profilePhoto}
                      name={userName}
                      size="md"
                    />

                  </div>


                  {/* User Details */}

                  <div className="min-w-0">

                    <p
                      className="
                        truncate

                        text-sm
                        font-bold

                        text-[#26352e]
                      "
                    >
                      {userName}
                    </p>


                    <p
                      className="
                        mt-0.5

                        truncate

                        text-xs

                        text-[#7b857f]
                      "
                    >
                      {user?.email || ""}
                    </p>


                    {/* Role Badge */}

                    <span
                      className="
                        mt-2

                        inline-flex

                        rounded-full

                        bg-[#e8f4ed]

                        px-2.5
                        py-1

                        text-[10px]

                        font-bold

                        uppercase

                        tracking-wide

                        text-[#2f6b4f]
                      "
                    >
                      {userRole}
                    </span>

                  </div>

                </div>

              </div>


              {/* =============================================
                  ACCOUNT INFORMATION
              ============================================== */}

              <div className="p-3">

                <div
                  className="
                    rounded-xl

                    bg-[#f7f9f7]

                    p-3
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    {/* Icon */}

                    <div
                      className="
                        flex

                        h-9
                        w-9

                        shrink-0

                        items-center
                        justify-center

                        rounded-lg

                        bg-[#e8f4ed]

                        text-[#2f6b4f]
                      "
                    >
                      <UserRound size={17} />
                    </div>


                    {/* Employee Code */}

                    <div className="min-w-0">

                      <p
                        className="
                          text-[10px]

                          font-medium

                          uppercase

                          tracking-wide

                          text-[#8a948e]
                        "
                      >
                        Employee Code
                      </p>

                      <p
                        className="
                          truncate

                          text-sm

                          font-semibold

                          text-[#26352e]
                        "
                      >
                        {user?.employee_id || "—"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* =============================================
                  ACTIONS
              ============================================== */}

              <div
                className="
                  border-t
                  border-[#edf0ed]

                  p-2
                "
              >

                {/* My Profile */}

                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="
                    flex
                    w-full

                    items-center

                    gap-3

                    rounded-xl

                    px-3
                    py-2.5

                    text-left

                    text-sm

                    font-medium

                    text-[#34443c]

                    transition-colors

                    hover:bg-[#f1f5f2]
                  "
                >

                  <UserRound
                    size={17}
                    className="text-[#2f6b4f]"
                  />

                  <span>
                    My Profile
                  </span>

                </button>


                {/* Logout */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex
                    w-full

                    items-center

                    gap-3

                    rounded-xl

                    px-3
                    py-2.5

                    text-left

                    text-sm

                    font-medium

                    text-red-600

                    transition-colors

                    hover:bg-red-50
                  "
                >

                  <LogOut size={17} />

                  <span>
                    Logout
                  </span>

                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}