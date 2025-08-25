import React, { createContext, useState, useContext, useEffect } from "react";
import useAlert from "../hooks/useAlert";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const { showAlert } = useAlert();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API}/verify-token`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Token verification error:", error);
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("authToken", data.token);
        setIsAuthenticated(true);
        showAlert("success", "Başarıyla giriş yaptınız.", 3)
        return true;
      } else {
        showAlert("error", "Geçersiz kullanıcı adı veya şifre.", 3)
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      showAlert("error", "Bir hata meydana geldi.", 3)
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    showAlert("success", "Başarıyla çıkış yaptınız.", 3)
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};