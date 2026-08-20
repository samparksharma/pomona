import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [
    newsletterSubscribed,
    setNewsletterSubscribed,
  ] = useState(false);

  const [
    newsletterPending,
    setNewsletterPending,
  ] = useState(false);

  const [
    newsletterLoading,
    setNewsletterLoading,
  ] = useState(false);

  // =========================================
  // REFRESH SESSION
  // =========================================

  const refreshSession = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      );

      return true;
    } catch (error) {
      return false;
    }
  };

  // =========================================
  // CHECK NEWSLETTER STATUS
  // =========================================

  const checkNewsletterStatus = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/newsletter/status`,
        {
          withCredentials: true,
        }
      );

      const subscribed =
        response.data.subscribed;

      const pending =
        response.data.pending;

      setNewsletterSubscribed(subscribed);

      if (subscribed) {
        setNewsletterPending(false);
      } else if (pending) {
        setNewsletterPending(true);
      } else {
        setNewsletterPending(false);
      }

      return subscribed;
    } catch (error) {
      /*
       * A 401 here simply means there is no
       * authenticated user/session yet.
       */
      if (error.response?.status !== 401) {
        console.error(
          "Newsletter status error:",
          error
        );
      }

      setNewsletterSubscribed(false);

      return false;
    }
  };

  // =========================================
  // GET CURRENT USER
  // =========================================

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/me`,
        {
          withCredentials: true,
        }
      );

      const currentUser =
        response.data.user;

      setUser(currentUser);

      await checkNewsletterStatus();

      return true;
    } catch (error) {
      return false;
    }
  };

  // =========================================
  // CHECK AUTH
  // =========================================

  const checkAuth = async () => {
    setLoading(true);

    try {
      const authenticated =
        await fetchCurrentUser();

      if (authenticated) {
        return;
      }

      const refreshed =
        await refreshSession();

      if (refreshed) {
        await fetchCurrentUser();
      } else {
        setUser(null);
        setNewsletterSubscribed(false);
        setNewsletterPending(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // INITIAL AUTH CHECK
  // =========================================

  useEffect(() => {
    checkAuth();
  }, []);

  // =========================================
  // LOGOUT
  // =========================================

  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      setUser(null);
      setNewsletterSubscribed(false);
      setNewsletterPending(false);
    }
  };

  // =========================================
  // SUBSCRIBE TO NEWSLETTER
  // =========================================

  const subscribeToNewsletter = async () => {
    if (!user?.email) {
      return {
        success: false,
        message:
          "You must be logged in.",
      };
    }

    if (newsletterLoading) {
      return {
        success: false,
        message:
          "Please wait.",
      };
    }

    if (newsletterSubscribed) {
      return {
        success: false,
        alreadySubscribed: true,
        message:
          "You're already subscribed.",
      };
    }

    if (newsletterPending) {
      return {
        success: false,
        pending: true,
        message:
          "Check your email to confirm your subscription.",
      };
    }

    setNewsletterLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/newsletter/subscribe`,
        {
          email: user.email,
        },
        {
          withCredentials: true,
        }
      );

      setNewsletterSubscribed(false);
      setNewsletterPending(true);

      return {
        success: true,
        pending: true,
        message:
          response.data.message ||
          "Check your email to confirm your subscription.",
      };
    } catch (error) {
      /*
       * Backend can return 409 when Brevo says
       * the email is already subscribed.
       */
      if (
        error.response?.status === 409 &&
        error.response?.data?.subscribed
      ) {
        setNewsletterSubscribed(true);
        setNewsletterPending(false);

        return {
          success: false,
          alreadySubscribed: true,
          message:
            error.response.data.message ||
            "You're already subscribed.",
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Could not subscribe.",
      };
    } finally {
      setNewsletterLoading(false);
    }
  };

  // =========================================
  // UNSUBSCRIBE FROM NEWSLETTER
  // =========================================

  const unsubscribeFromNewsletter =
    async () => {
      if (!user) {
        return {
          success: false,
          message:
            "You must be logged in.",
        };
      }

      if (newsletterLoading) {
        return {
          success: false,
          message:
            "Please wait.",
        };
      }

      setNewsletterLoading(true);

      try {
        const response =
          await axios.post(
            `${API_URL}/api/newsletter/unsubscribe`,
            {},
            {
              withCredentials: true,
            }
          );

        setNewsletterSubscribed(false);
        setNewsletterPending(false);

        return {
          success: true,
          message:
            response.data.message ||
            "You have been unsubscribed.",
        };
      } catch (error) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            "Could not unsubscribe.",
        };
      } finally {
        setNewsletterLoading(false);
      }
    };

  // =========================================
  // DELETE ACCOUNT
  // =========================================

  const deleteAccount = async (
    password
  ) => {
    if (!password?.trim()) {
      return {
        success: false,
        message:
          "Password is required.",
      };
    }

    try {
      const response =
        await axios.delete(
          `${API_URL}/api/auth/account`,
          {
            data: {
              password,
            },
            withCredentials: true,
          }
        );

      setUser(null);
      setNewsletterSubscribed(false);
      setNewsletterPending(false);

      return {
        success: true,
        message:
          response.data.message ||
          "Your account has been deleted.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Could not delete your account.",
      };
    }
  };

  // =========================================
  // PROVIDER
  // =========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,

        newsletterSubscribed,
        newsletterPending,
        newsletterLoading,

        setUser,

        logout,
        deleteAccount,

        checkAuth,
        refreshSession,
        fetchCurrentUser,
        checkNewsletterStatus,

        subscribeToNewsletter,
        unsubscribeFromNewsletter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}