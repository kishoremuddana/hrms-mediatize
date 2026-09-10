import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Login.css";

import { showSuccess, showError } from "../../shared/utils/toast";

function Login() {
  const navigate = useNavigate();
  const { login, requestOTP } = useAuth();
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);

  // OTP countdown
  useEffect(() => {
    if (!otpSent || otpTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setOtpTimer((previousTime) => previousTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, otpTimer]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   *
   * AuthProvider.login() handles:
   *
   * 1. POST /auth/login
   * 2. Store JWT
   * 3. GET /auth/me
   * 4. Store authenticated user
   * 5. Return user information
   *
   * Login.jsx only handles navigation.
   */

  const handleResendOTP = async () => {
    setLoading(true);

    try {
      await requestOTP(formData.email.trim());
      setOtpTimer(300);

      showSuccess("A new OTP has been sent to your email.");
    } catch (error) {
      console.error("OTP resend error:", error);

      if (error.response) {
        showError(
          error.response.data?.detail ||
            "Unable to resend OTP. Please try again."
        );
      } else {
        showError("Unable to connect to the authentication server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      if (!otpSent) {
        await requestOTP(formData.email.trim());

        setOtpSent(true);
        setOtpTimer(300);

        showSuccess(
          "OTP sent to your registered email."
        );

        return;
      }

      const user = await login(
        formData.email.trim(),
        formData.otp.trim()
      );

      console.log("Authenticated user:", user);

      showSuccess("Login successful!");

      if (user.role === "HR") {
        navigate("/hr/dashboard", {
          replace: true,
        });

        return;
      }

      if (user.role === "EMPLOYEE") {
        navigate("/employee/dashboard", {
          replace: true,
        });

        return;
      }

      showError(
        "Your account has an invalid role. Please contact HR."
      );
      } catch (error) {
        console.error("Authentication error:", error);

        if (error.response) {
          showError(
            error.response.data?.detail ||
              "Unable to authenticate. Please try again."
          );
        } else {
          showError(
            "Unable to connect to the authentication server."
          );
        }
      } finally {
        setLoading(false);
    }
  };
  return (
    <main className="login-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="login-background"
        aria-hidden="true"
      >
        <div className="login-grid" />

        <div className="login-glow login-glow-one" />
        <div className="login-glow login-glow-two" />
        <div className="login-glow login-glow-three" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="login-header">

        <button
          type="button"
          className="login-brand"
          onClick={() => navigate("/")}
        >
          <div className="login-brand-icon">

            <svg
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="18"
                r="9"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                d="M15 48C15 38.6 22.6 31 32 31C41.4 31 49 38.6 49 48"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />

              <path
                d="M11 28C7 29 4.5 32.5 4.5 37"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              <path
                d="M53 28C57 29 59.5 32.5 59.5 37"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>

          </div>

          <div className="login-brand-text">
            <h1>HRMS</h1>
            <p>Mediatize Tech Pvt Ltd</p>
          </div>
        </button>

      </header>

      {/* =====================================================
          LOGIN CONTENT
      ===================================================== */}

      <section className="login-content">

        <div className="login-layout">

          {/* =================================================
              LEFT INFORMATION
          ================================================= */}

          <section className="login-info">

            <div className="login-badge">
              <span className="login-badge-dot" />
              SECURE WORKPLACE ACCESS
            </div>

            <h2>
              Welcome to your
              <span>HRMS Mediatize workspace.</span>
            </h2>

            <p className="login-description">
              Access employee information, attendance,
              projects and workplace resources through
              your secure HRMS account.
            </p>

            <div className="login-features">

              <div className="login-feature">

                <div className="login-feature-number">
                  01
                </div>

                <div>
                  <strong>Secure authentication</strong>
                  <span>
                    Your account is protected through
                    authenticated access.
                  </span>
                </div>

              </div>

              <div className="login-feature-line" />

              <div className="login-feature">

                <div className="login-feature-number">
                  02
                </div>

                <div>
                  <strong>Role-based workspace</strong>
                  <span>
                    HR and Employee accounts have
                    appropriate access levels.
                  </span>
                </div>

              </div>

              <div className="login-feature-line" />

              <div className="login-feature">

                <div className="login-feature-number">
                  03
                </div>

                <div>
                  <strong>Centralized HR management</strong>
                  <span>
                    Manage your workplace information
                    from one secure system.
                  </span>
                </div>

              </div>

            </div>

            <div className="login-security-status">

              <div className="login-status-icon">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3L20 6V11C20 16.2 16.7 20.4 12 22C7.3 20.4 4 16.2 4 11V6L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M9 12L11 14L15 10"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>

              <div>
                <strong>Protected HRMS environment</strong>

                <span>
                  Sign in using your registered company
                  credentials.
                </span>
              </div>

            </div>

          </section>

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <section className="login-card">

            <div className="login-card-accent" />

            {/* Card Header */}

            <div className="login-card-header">

              <div className="login-card-icon">

                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="32"
                    cy="18"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                  />

                  <path
                    d="M15 48C15 38.6 22.6 31 32 31C41.4 31 49 38.6 49 48"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <path
                    d="M11 28C7 29 4.5 32.5 4.5 37"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <path
                    d="M53 28C57 29 59.5 32.5 59.5 37"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>

              </div>

              <div>

                <span className="login-card-label">
                  ACCOUNT LOGIN
                </span>

                <h3>Welcome Back</h3>

                <p>
                  Sign in to access your HRMS workspace.
                </p>

              </div>

            </div>

            {/* Form */}

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              {/* Email */}

              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="input-wrapper">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="input-icon"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="3"
                    />

                    <path d="M3 7L12 13L21 7" />
                  </svg>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />

                </div>

              </div>

              {/* OTP */}

              {otpSent && (
                <div className="form-group">
                  <label htmlFor="otp">
                    One-Time Password
                  </label>

                  <div className="input-wrapper">
                    <input
                      id="otp"
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="otp-actions">
                    <span className="otp-timer">
                      {otpTimer > 0
                        ? `OTP expires in ${String(
                            Math.floor(otpTimer / 60)
                          ).padStart(2, "0")}:${String(
                            otpTimer % 60
                          ).padStart(2, "0")}`
                        : "OTP expired"}
                    </span>

                    <button
                      type="button"
                      className="resend-otp-button"
                      onClick={handleResendOTP}
                      disabled={loading || otpTimer > 0}
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="login-submit"
              >

                {loading ? (
                  <>
                    <span className="login-spinner" />

                    <span>
                      Signing in...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {otpSent ? "Verify & Login" : "Get OTP"}
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M5 12H19" />

                      <path d="M13 6L19 12L13 18" />
                    </svg>
                  </>
                )}

              </button>

            </form>

            {/* Security */}

            <div className="login-security">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path d="M12 3L20 6V11C20 16.2 16.7 20.4 12 22C7.3 20.4 4 16.2 4 11V6L12 3Z" />

                <path d="M9 12L11 14L15 10" />
              </svg>

              <span>
                Protected by enterprise-grade
                security
              </span>

            </div>

          </section>

        </div>

        {/* Back */}

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M19 12H5" />

            <path d="M11 18L5 12L11 6" />
          </svg>

          Back to Welcome
        </button>

        {/* Footer */}

        <p className="login-footer">
          © {new Date().getFullYear()} Mediatize Tech Pvt Ltd.
          All rights reserved.
        </p>

      </section>

    </main>
  );
}

export default Login;