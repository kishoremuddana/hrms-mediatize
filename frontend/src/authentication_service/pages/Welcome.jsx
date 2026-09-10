import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CalendarCheck2,
  CheckCircle2,
  FolderKanban,
  LockKeyhole,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";

function Welcome() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description:
        "Manage employee information, profiles, access and workforce records from one centralized platform.",
    },
    {
      icon: CalendarCheck2,
      title: "Attendance & Leave",
      description:
        "Track attendance and manage leave-related activities through a simple and organized workflow.",
    },
    {
      icon: FolderKanban,
      title: "Project Management",
      description:
        "Organize projects, team members and workforce assignments in one connected workspace.",
    },
    {
      icon: Megaphone,
      title: "Announcements",
      description:
        "Keep employees informed through company and project-level announcements.",
    },
    {
      icon: BarChart3,
      title: "Insights & Analytics",
      description:
        "Use workforce information and operational data to support better HR decisions.",
    },
    {
      icon: BellRing,
      title: "Notifications",
      description:
        "Keep employees and HR teams aware of important updates and workplace activities.",
    },
  ];

  const workflow = [
    {
      number: "01",
      title: "HR manages the workforce",
      description:
        "HR can manage employees, projects, announcements, attendance and other organizational activities.",
    },
    {
      number: "02",
      title: "Employees access their workspace",
      description:
        "Employees sign in securely and view the information and features available to their own account.",
    },
    {
      number: "03",
      title: "Everything stays organized",
      description:
        "Centralized information and role-based access help keep HR operations structured and controlled.",
    },
  ];

  const securityPoints = [
    "Role-based access",
    "Secure authentication",
    "Protected employee information",
    "Controlled HR operations",
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#14231b]">

      {/* =========================================================
          NAVIGATION
      ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-[#e5ebe7] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3"
            aria-label="Go to top"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f5132] text-white shadow-[0_8px_24px_rgba(15,81,50,0.18)] transition-transform duration-300 group-hover:-translate-y-0.5">
              <Users size={22} strokeWidth={2} />
            </div>

            <div className="text-left">
              <h1 className="text-lg font-extrabold tracking-tight text-[#123c28]">
                HRMS
              </h1>
              <p className="hidden text-[9px] font-semibold uppercase tracking-[0.12em] text-[#748078] sm:block">
                Human Resource Management
              </p>
            </div>
          </button>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-[#526159] transition-colors hover:text-[#0f5132]"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm font-medium text-[#526159] transition-colors hover:text-[#0f5132]"
            >
              How It Works
            </a>

            <a
              href="#security"
              className="text-sm font-medium text-[#526159] transition-colors hover:text-[#0f5132]"
            >
              Security
            </a>
          </nav>

          {/* Sign In */}
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-2 rounded-lg bg-[#0f5132] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,81,50,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0b4229] hover:shadow-[0_12px_26px_rgba(15,81,50,0.22)]"
          >
            Sign In
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-[#e7eee9] bg-[#f7faf8]">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#dcefe4] blur-3xl opacity-70" />
        <div className="pointer-events-none absolute -bottom-48 -left-40 h-[500px] w-[500px] rounded-full bg-[#edf6f0] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">

          {/* Hero Content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe3d6] bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#0f5132] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#198754]" />
              Smart Workforce Platform
            </div>

            <h2 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-[#10271b] sm:text-5xl lg:text-6xl">
              Human Resource
              <br />
              <span className="text-[#0f5132]">
                Management, Simplified.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#5b6961] sm:text-lg">
              A centralized HR management platform designed to help
              organizations manage people, attendance, projects,
              communication and workplace operations efficiently.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleGetStarted}
                className="group flex items-center justify-center gap-3 rounded-xl bg-[#0f5132] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,81,50,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0b4229] hover:shadow-[0_18px_36px_rgba(15,81,50,0.25)]"
              >
                Get Started
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <a
                href="#features"
                className="flex items-center justify-center rounded-xl border border-[#d4dfd8] bg-white px-6 py-3.5 text-sm font-bold text-[#294438] transition-all duration-300 hover:border-[#0f5132] hover:text-[#0f5132]"
              >
                Explore Platform
              </a>
            </div>

            {/* Trust line */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-[#718078]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#198754]" />
                Centralized HR Operations
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#198754]" />
                Role-Based Access
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#198754]" />
                Secure Workspace
              </div>
            </div>
          </div>

          {/* =====================================================
              HRMS DASHBOARD PREVIEW
          ===================================================== */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[30px] bg-[#dcefe4] blur-2xl opacity-60" />

            <div className="relative overflow-hidden rounded-2xl border border-[#dbe7df] bg-white shadow-[0_25px_70px_rgba(21,55,37,0.12)]">

              {/* Preview Header */}
              <div className="flex items-center justify-between border-b border-[#e7eee9] px-5 py-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#849088]">
                    HRMS Workspace
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-[#173a28]">
                    Workforce Overview
                  </h3>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f4ed] text-[#0f5132]">
                  <BarChart3 size={18} />
                </div>
              </div>

              {/* Preview Content */}
              <div className="space-y-4 bg-[#f8faf9] p-5">

                {/* Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#e1eae4] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#7b8880]">
                        Employees
                      </span>

                      <Users
                        size={16}
                        className="text-[#0f5132]"
                      />
                    </div>

                    <div className="mt-5 h-2 w-24 rounded-full bg-[#dcebe2]" />
                    <div className="mt-2 h-2 w-16 rounded-full bg-[#edf3ef]" />
                  </div>

                  <div className="rounded-xl border border-[#e1eae4] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#7b8880]">
                        Attendance
                      </span>

                      <CalendarCheck2
                        size={16}
                        className="text-[#0f5132]"
                      />
                    </div>

                    <div className="mt-5 h-2 w-20 rounded-full bg-[#dcebe2]" />
                    <div className="mt-2 h-2 w-28 rounded-full bg-[#edf3ef]" />
                  </div>
                </div>

                {/* Workspace list */}
                <div className="rounded-xl border border-[#e1eae4] bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#244333]">
                        HR Operations
                      </p>
                      <p className="mt-1 text-[10px] text-[#87938c]">
                        Centralized workplace activities
                      </p>
                    </div>

                    <span className="rounded-full bg-[#e8f4ed] px-2.5 py-1 text-[9px] font-bold text-[#0f5132]">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        icon: Users,
                        label: "Employee Management",
                      },
                      {
                        icon: FolderKanban,
                        label: "Project Management",
                      },
                      {
                        icon: Megaphone,
                        label: "Announcements",
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-lg border border-[#edf1ee] bg-[#fbfcfb] px-3 py-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f4ed] text-[#0f5132]">
                            <Icon size={15} />
                          </div>

                          <span className="text-[11px] font-semibold text-[#45564c]">
                            {item.label}
                          </span>

                          <ArrowRight
                            size={13}
                            className="ml-auto text-[#9aa69f]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="flex items-center gap-2 border-t border-[#e7eee9] px-5 py-3.5">
                <ShieldCheck
                  size={15}
                  className="text-[#198754]"
                />

                <span className="text-[10px] font-semibold text-[#6f7d75]">
                  Secure role-based workplace access
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES
      ========================================================= */}
      <section
        id="features"
        className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">

          {/* Heading */}
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f5132]">
              Platform Capabilities
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-[#142b1e] sm:text-4xl">
              Everything your HR team needs,
              <br className="hidden sm:block" />
              in one workspace.
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#66746c] sm:text-base">
              HRMS brings essential workforce operations together so HR
              teams and employees can work with greater clarity and
              organization.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-[#e3ebe6] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#bcd5c6] hover:shadow-[0_18px_40px_rgba(19,58,38,0.08)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f4ed] text-[#0f5132] transition-all duration-300 group-hover:bg-[#0f5132] group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-[#1d3829]">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#6b7971]">
                    {feature.description}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-xs font-bold text-[#0f5132]">
                    Built into HRMS
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          WORKFLOW
      ========================================================= */}
      <section
        id="workflow"
        className="border-y border-[#e5ece7] bg-[#f7faf8] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">

          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f5132]">
              Simple Workflow
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-[#142b1e] sm:text-4xl">
              How HRMS works
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#69776f] sm:text-base">
              A clear separation between HR administration and employee
              access keeps everyday HR operations organized.
            </p>
          </div>

          <div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">

            {/* Connector */}
            <div className="pointer-events-none absolute left-[17%] right-[17%] top-7 hidden h-px bg-[#cbdcd1] md:block" />

            {workflow.map((step) => (
              <article
                key={step.number}
                className="relative rounded-2xl border border-[#dfe9e3] bg-white p-7 text-center shadow-sm"
              >
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#f7faf8] bg-[#0f5132] text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(15,81,50,0.18)]">
                  {step.number}
                </div>

                <h3 className="mt-6 text-base font-bold text-[#203b2c]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#6b7971]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECURITY
      ========================================================= */}
      <section
        id="security"
        className="bg-[#0f5132] px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_0.8fr]">

          {/* Content */}
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <LockKeyhole size={22} />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#b8d9c5]">
              Security & Access
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
              Keep workforce information protected and organized.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#d3e5d9] sm:text-base">
              HRMS is designed around controlled access so HR teams and
              employees can work with the information appropriate to their
              role.
            </p>
          </div>

          {/* Security Points */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              <ShieldCheck size={21} />
              <div>
                <h3 className="text-sm font-bold">
                  Workplace Security
                </h3>
                <p className="mt-1 text-[10px] text-[#b9d2c1]">
                  Built around controlled access
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {securityPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                    <CheckCircle2 size={15} />
                  </div>

                  <span className="text-sm font-medium text-[#e3eee7]">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#dce8e0] bg-[#f4f9f6] px-6 py-12 text-center shadow-[0_20px_60px_rgba(20,60,39,0.06)] sm:px-10">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f5132] text-white shadow-[0_12px_25px_rgba(15,81,50,0.18)]">
            <Users size={25} />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.03em] text-[#173525] sm:text-4xl">
            Ready to manage your workforce better?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#68766e] sm:text-base">
            Access your HRMS workspace and start managing your workplace
            operations from one centralized platform.
          </p>

          <button
            onClick={handleGetStarted}
            className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-[#0f5132] px-7 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,81,50,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0b4229] hover:shadow-[0_18px_36px_rgba(15,81,50,0.25)]"
          >
            Access HRMS
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-[#e5ebe7] bg-[#f8faf9] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f5132] text-white">
              <Users size={17} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#173525]">
                HRMS
              </p>

              <p className="text-[10px] text-[#7b8880]">
                Human Resource Management System
              </p>
            </div>
          </div>

          <p className="text-[10px] text-[#7b8880] sm:text-right">
            © 2026 Mediatize Tech Pvt Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default Welcome;