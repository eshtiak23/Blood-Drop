import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

function getUsers() {
  return JSON.parse(localStorage.getItem("ld_users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("ld_users", JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ld_current_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid email or password");
    const { password: _, ...safe } = found;
    localStorage.setItem("ld_current_user", JSON.stringify(safe));
    setUser(safe);
  };

  const register = async (data) => {
    const users = getUsers();
    if (users.find((u) => u.email === data.email)) throw new Error("Email already registered");
    const newUser = {
      _id: "u" + Date.now(),
      ...data,
      isAvailable: true,
      totalDonations: 0,
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const { password: _, ...safe } = newUser;
    localStorage.setItem("ld_current_user", JSON.stringify(safe));
    setUser(safe);
  };

  const logout = () => {
    localStorage.removeItem("ld_current_user");
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("ld_current_user", JSON.stringify(updated));
    const users = getUsers();
    const idx = users.findIndex((u) => u._id === user._id);
    if (idx !== -1) { users[idx] = { ...users[idx], ...updates }; saveUsers(users); }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
