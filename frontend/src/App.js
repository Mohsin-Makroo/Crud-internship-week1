import { useEffect, useState } from "react";
import "./App.css";

// Login Component
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      onLogin(data);
    } catch (err) {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue to your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ user, onLogout, onProfileUpdate }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    contact: "",
    email: "",
    address: "",
    password: "",
  });
  const [editingId, setEditingId] = useState(null);

  const loadUsers = async () => {
    const res = await fetch("http://localhost:5000/users");
    setUsers(await res.json());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeMenu === "users") {
      loadUsers();
    }
  }, [activeMenu]);

  const addOrUpdateUser = async () => {
    setError("");

    const url = editingId
      ? `http://localhost:5000/users/${editingId}`
      : "http://localhost:5000/users";

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const msg = await res.text();

    if (msg !== "User Added" && msg !== "User Updated") {
      setError(msg);
      return;
    }

    setForm({
      first_name: "",
      last_name: "",
      contact: "",
      email: "",
      address: "",
      password: "",
    });

    setEditingId(null);
    loadUsers();
  };

  const deleteUser = async (id) => {
    await fetch(`http://localhost:5000/users/${id}`, { method: "DELETE" });
    loadUsers();
  };

  const toggleStatus = async (id) => {
    await fetch(`http://localhost:5000/users/status/${id}`, {
      method: "PATCH",
    });
    loadUsers();
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;

      try {
        const res = await fetch(
          `http://localhost:5000/users/${user.id}/profile-image`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile_image: base64String }),
          }
        );

        const data = await res.json();
        if (res.ok) {
          onProfileUpdate({ ...user, profile_image: data.profile_image });
          setShowProfileModal(false);
        }
      } catch (err) {
        alert("Failed to upload profile image");
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">UM</div>
            <span>UserMgmt</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeMenu === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveMenu("dashboard")}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeMenu === "users" ? "active" : ""}`}
            onClick={() => setActiveMenu("users")}
          >
            <span className="nav-icon">👥</span>
            <span>User Registration</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-title">
            <h2>
              {activeMenu === "dashboard"
                ? "Dashboard"
                : "User Registration"}
            </h2>
          </div>

          <div className="header-actions">
            <button
              className="profile-button"
              onClick={() => setShowProfileModal(true)}
            >
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-avatar">
                  {user.first_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="profile-name">
                {user.first_name} {user.last_name}
              </span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="content">
          {activeMenu === "dashboard" ? (
            <div className="dashboard-content">
              <div className="welcome-section">
                <h1>Welcome back, {user.first_name}!</h1>
                <p>Here's what's happening with your users today.</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {users.filter((u) => u.is_active).length}
                    </div>
                    <div className="stat-label">Active Users</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⏸️</div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {users.filter((u) => !u.is_active).length}
                    </div>
                    <div className="stat-label">Inactive Users</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="user-registration-content">
              <div className="form-container">
                <h3>
                  {editingId ? "Edit User Details" : "Register New User"}
                </h3>

                <div className="form-grid">
                  <input
                    placeholder="First Name"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                  />
                  <input
                    placeholder="Last Name"
                    value={form.last_name}
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                  />
                </div>

                <input
                  placeholder="Contact Number"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                />
                <input
                  placeholder="Email Address"
                  value={form.email}
                  disabled={editingId !== null}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={editingId !== null ? "disabled" : ""}
                />
                <input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />

                <div className="password-field">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder={
                      editingId ? "Password cannot be edited" : "Password"
                    }
                    value={form.password}
                    disabled={editingId !== null}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className={editingId !== null ? "disabled" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="toggle-pwd-btn"
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>

                {error && <div className="form-error">{error}</div>}

                <button onClick={addOrUpdateUser} className="submit-button">
                  {editingId ? "Update User" : "Add User"}
                </button>
              </div>

              <div className="users-list">
                <h3>Registered Users</h3>
                {users.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h4>No Users Yet</h4>
                    <p>Register your first user to get started!</p>
                  </div>
                ) : (
                  users.map((u) => (
                    <div key={u.id} className="user-card">
                      <div className="user-info">
                        <div className="user-avatar">
                          {u.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="user-email">{u.email}</div>
                          <div
                            className={`user-status ${
                              u.is_active ? "active" : "inactive"
                            }`}
                          >
                            {u.is_active ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>

                      <div className="user-actions">
                        <button
                          onClick={() => {
                            setForm({
                              first_name: u.first_name,
                              last_name: u.last_name,
                              contact: u.contact,
                              email: u.email,
                              address: u.address,
                              password: "",
                            });
                            setEditingId(u.id);
                          }}
                          className="action-btn edit-btn"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => toggleStatus(u.id)}
                          className="action-btn toggle-btn"
                        >
                          Toggle
                        </button>

                        <button
                          onClick={() => deleteUser(u.id)}
                          className="action-btn delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Profile Settings</h3>
              <button
                className="close-btn"
                onClick={() => setShowProfileModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="profile-section">
                <div className="current-profile">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="Profile"
                      className="modal-profile-image"
                    />
                  ) : (
                    <div className="modal-profile-avatar">
                      {user.first_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="profile-info">
                  <h4>
                    {user.first_name} {user.last_name}
                  </h4>
                  <p>{user.email}</p>
                </div>

                <div className="upload-section">
                  <label htmlFor="profile-upload" className="upload-button">
                    Upload Profile Picture
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    style={{ display: "none" }}
                  />
                  <p className="upload-hint">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>

                <button onClick={onLogout} className="logout-button">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <div className="app">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}

export default App;