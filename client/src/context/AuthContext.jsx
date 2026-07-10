/**
 * AuthContext.jsx — User Authentication (Login/Register/Logout)
 * 
 * This file handles everything related to user accounts. It stores user data
 * in the browser's localStorage so it persists even after refreshing the page.
 * 
 * How it works:
 * - All registered users are stored under the key "ld_users" in localStorage
 * - The currently logged-in user is stored under "ld_current_user"
 * - When the page loads, it checks if there's a saved user session
 * 
 * Any page can access user info by calling: const { user } = useAuth();
 * 
 * Available functions:
 * - login(email, password) → Log in an existing user
 * - register(userData) → Create a new account and log in
 * - logout() → Sign out
 * - updateUser(fields) → Update the current user's profile
 * - isAuthenticated → true if someone is logged in
 */

import { createContext, useContext, useState, useEffect } from "react";

// Create a "context" — think of it as a shared state that any component can access
const AuthContext = createContext(null);

// ── Helper functions to read/write the user list in localStorage ──

/** Get all registered users from localStorage (returns empty array if none exist) */
function getUsers() {
  return JSON.parse(localStorage.getItem("ld_users") || "[]");
}

/** Save the full user list back to localStorage */
function saveUsers(users) {
  localStorage.setItem("ld_users", JSON.stringify(users));
}

/**
 * AuthProvider — Wraps the entire app and provides authentication to all pages.
 * 
 * When the app first loads, it checks localStorage for a previously logged-in user
 * and restores their session automatically.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // The currently logged-in user (null = not logged in)
  const [loading, setLoading] = useState(true);      // True while checking if user has a saved session

  // On first load: check if there's a saved user session in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("ld_current_user");
    if (stored) setUser(JSON.parse(stored));         // Restore the user if found
    setLoading(false);                               // Done loading — app can now render
  }, []);

  /**
   * login — Sign in with email and password.
   * Looks through all registered users and finds a match.
   * Throws an error if no match is found.
   */
  const login = async (email, password) => {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid email or password");
    // Strip the password before saving to session (never store passwords in session)
    const { password: _, ...safe } = found;
    localStorage.setItem("ld_current_user", JSON.stringify(safe));
    setUser(safe);
  };

  /**
   * register — Create a new account and automatically log in.
   * Checks if the email is already taken, creates the user with default values,
   * saves to localStorage, and logs them in.
   */
  const register = async (data) => {
    const users = getUsers();
    if (users.find((u) => u.email === data.email)) throw new Error("Email already registered");
    const newUser = {
      _id: "u" + Date.now(),           // Unique ID based on timestamp
      ...data,
      role: "user",                     // Everyone is both donor and seeker
      isAvailable: true,                // Start as available to donate
      totalDonations: 0,                // Start with zero donations
      isVerified: false,                // Needs admin verification
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    // Log in automatically after registration
    const { password: _, ...safe } = newUser;
    localStorage.setItem("ld_current_user", JSON.stringify(safe));
    setUser(safe);
  };

  /** logout — Remove the saved session and set user to null */
  const logout = () => {
    localStorage.removeItem("ld_current_user");
    setUser(null);
  };

  /**
   * updateUser — Update the current user's profile data.
   * Updates both the session (quick access) and the full user list (persistent).
   */
  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("ld_current_user", JSON.stringify(updated));
    // Also update in the master user list
    const users = getUsers();
    const idx = users.findIndex((u) => u._id === user._id);
    if (idx !== -1) { users[idx] = { ...users[idx], ...updates }; saveUsers(users); }
  };

  // Provide all auth values to every component in the app
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

/** useAuth — Custom hook to access auth from any component. Usage: const { user, login } = useAuth(); */
export function useAuth() { return useContext(AuthContext); }
