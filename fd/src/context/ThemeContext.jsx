import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Strictly ensure light theme across the application
    const root = document.documentElement;
    root.classList.remove("dark");
    localStorage.setItem("taskflow_theme", "light");
  }, []);

  const toggleTheme = () => {
    // No-op to maintain light theme integrity as required
  };

  return (
    <ThemeContext.Provider value={{ isDark: false, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
