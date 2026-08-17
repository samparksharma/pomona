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

  const [newsletterSubscribed, setNewsletterSubscribed] =
    useState(false);

  const [newsletterLoading, setNewsletterLoading] =
    useState(false);

  // =========================================
  // CHECK AUTH
  // =========================================

  const checkAuth = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/me`,
        {
          withCredentials: true,
        }
      );

      const currentUser = response.data.user;

      setUser(currentUser);

      await checkNewsletterStatus(
        currentUser.email
      );
    } catch (error) {
      setUser(null);
      setNewsletterSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // CHECK NEWSLETTER STATUS
  // =========================================

  const checkNewsletterStatus = async (
    email
  ) => {
    if (!email) {
      setNewsletterSubscribed(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/newsletter/status`,
        {
          params: {
            email,
          },
        }
      );

      setNewsletterSubscribed(
        response.data.subscribed
      );
    } catch (error) {
      console.error(
        "Newsletter status error:",
        error
      );

      setNewsletterSubscribed(false);
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
    }
  };

  // =========================================
  // SUBSCRIBE
  // =========================================

  const subscribeToNewsletter = async () => {
    if (!user?.email) return;

    setNewsletterLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/newsletter/subscribe`,
        {
          email: user.email,
        }
      );

      setNewsletterSubscribed(true);

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        "Newsletter subscribe error:",
        error
      );

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
  // UNSUBSCRIBE
  // =========================================

  const unsubscribeFromNewsletter =
    async () => {
      if (!user?.email) return;

      setNewsletterLoading(true);

      try {
        await axios.post(
          `${API_URL}/api/newsletter/unsubscribe`,
          {
            email: user.email,
          }
        );

        setNewsletterSubscribed(false);

        return {
          success: true,
        };
      } catch (error) {
        console.error(
          "Newsletter unsubscribe error:",
          error
        );

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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,

        newsletterSubscribed,
        newsletterLoading,

        setUser,

        logout,

        checkAuth,
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