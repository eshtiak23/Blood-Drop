/**
 * ThemeContext.jsx — Dark/Light Theme Control
 * 
 * Manages the app's visual theme (light, dark, or system preference).
 * The theme is saved in localStorage so it remembers your choice.
 * 
 * How it works:
 * - Adds/removes the CSS class "dark" on the <html> element
 * - CSS variables in index.css change automatically based on this class
 * - For example, --bg becomes #FAFBFF (light) or #0C0A1A (dark)
 * 
 * Usage in any component:
 *   const { theme, setTheme } = useTheme();
 *   setTheme("dark");  // Switch to dark mode
 */

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read saved theme from localStorage, default to "light"
  const [theme, setThemeState] = useState(() => localStorage.getItem("theme") || "light");

  // When theme changes, update the <html> element's class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "system") {
      // "system" mode: check if the user's OS prefers dark mode
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (dark) root.classList.add("dark");
    }
    // "light" mode: no class needed (default CSS is light)
  }, [theme]);

  /** Save theme choice and apply it */
  const setTheme = (t) => { setThemeState(t); localStorage.setItem("theme", t); };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** useTheme — Custom hook to access theme from any component */
export function useTheme() { return useContext(ThemeContext); }
