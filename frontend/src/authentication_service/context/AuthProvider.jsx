import {
  useEffect,
  useState,
} from "react";

import AuthContext from "./AuthContext";
import authApi from "../services/authApi";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("hrms_token")
  );

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(() =>
    Boolean(
      localStorage.getItem("hrms_token")
    )
  );

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   *
   * Login performs the complete authentication flow:
   *
   * 1. Authenticate credentials
   * 2. Store JWT
   * 3. Get authenticated user
   * 4. Store user in AuthContext
   * 5. Return user to Login.jsx
   */

  const requestOTP = async (email) => {
  const response = await authApi.post(
    "/send-otp",
    {
      email,
    }
  );
  return response.data;
};


  const login = async (
  email,
  otp
) => {
  const response = await authApi.post(
    "/verify-otp",
    {
      email,
      otp,
    }
  );

  const accessToken =
    response.data.access_token;

  localStorage.setItem(
    "hrms_token",
    accessToken
  );

  setToken(accessToken);

  const meResponse = await authApi.get(
    "/me"
  );

  const authenticatedUser =
    meResponse.data;

  setUser(authenticatedUser);
  setLoading(false);

  return authenticatedUser;
};
  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const logout = () => {
    localStorage.removeItem(
      "hrms_token"
    );

    setToken(null);
    setUser(null);
    setLoading(false);
  };

  /*
   * =========================================================
   * HANDLE UNAUTHORIZED SESSION
   * =========================================================
   *
   * authApi dispatches this event when an authenticated
   * request receives a 401 response.
   */

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(
        "hrms_token"
      );

      setToken(null);
      setUser(null);
      setLoading(false);
    };

    window.addEventListener(
      "hrms:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "hrms:unauthorized",
        handleUnauthorized
      );
    };
  }, []);


  /*
 * =========================================================
 * SYNC AUTHENTICATION SESSION ACROSS TABS
 * =========================================================
 */

  useEffect(() => {
    const handleStorageChange = async (event) => {
      /*
      * We only care about changes to the JWT.
      */
      if (event.key !== "hrms_token") {
        return;
      }

      /*
      * Another tab logged out.
      */
      if (!event.newValue) {
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      /*
      * Another tab logged in.
      * Store the new token and validate it using /me.
      */
      setToken(event.newValue);
      setLoading(true);

      try {
        /*
       * Validate the new JWT with the backend.
       */
        const response = await authApi.get("/me");

        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error(
          "Failed to sync authentication session:",
          error
        );

        localStorage.removeItem("hrms_token");

        setToken(null);
        setUser(null);
        setLoading(false);
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /*
   * =========================================================
   * RESTORE LOGIN SESSION
   * =========================================================
   *
   * This runs once when the application starts.
   *
   * If a JWT already exists, validate it using /me.
   */

  useEffect(() => {
    const storedToken =
      localStorage.getItem("hrms_token");

    /*
     * No token means there is no session to restore.
     *
     * loading is already initialized to false when
     * there is no token, so no state update is needed here.
     */
    if (!storedToken) {
      return;
    }

    let cancelled = false;

    const restoreSession = async () => {
      try {
        /*
         * authApi automatically attaches:
         *
         * Authorization: Bearer <token>
         */
        const response = await authApi.get(
          "/me"
        );

        if (cancelled) {
          return;
        }

        setUser(response.data);
        setLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to restore authentication session:",
          error
        );

        /*
         * Token is invalid or expired.
         */
        localStorage.removeItem(
          "hrms_token"
        );

        setToken(null);
        setUser(null);
        setLoading(false);
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =========================================================
   * AUTH CONTEXT VALUE
   * =========================================================
   */

  const value = {
    token,
    user,
    loading,

    isAuthenticated: Boolean(
      token && user
    ),

    requestOTP,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}