import { useEffect, useState } from "react";

function App() {
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

  return (
    <div
      style={{ maxWidth: "500px", margin: "40px auto", fontFamily: "Arial" }}
    >
      <h2 style={{ textAlign: "center", color: "#333" }}>User Management</h2>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          placeholder="First Name"
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <input
          placeholder="Last Name"
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
      </div>

      <input
        placeholder="Contact"
        onChange={(e) => setForm({ ...form, contact: e.target.value })}
      />
      <input
        placeholder="Email"
        value={form.email}
        disabled={editingId !== null}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        style={{
          background: editingId !== null ? "#eee" : "white",
          cursor: editingId !== null ? "not-allowed" : "text",
        }}
      />
      <input
        placeholder="Address"
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type={showPwd ? "text" : "password"}
          placeholder={editingId ? "Password cannot be edited" : "Password"}
          disabled={editingId !== null}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{
            background: editingId ? "#eee" : "white",
            cursor: editingId ? "not-allowed" : "text",
          }}
        />

        <button
          onClick={() => setShowPwd(!showPwd)}
          style={{
            padding: "6px 10px",
            background: "#eee",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          {showPwd ? "Hide" : "Show"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={addOrUpdateUser}
        style={{
          width: "100%",
          marginTop: "10px",
          padding: "10px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {editingId ? "Update User" : "Add User"}
      </button>

      <hr />

      {users.map((u) => (
        <div
          key={u.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px",
            marginBottom: "5px",
            background: "#f9f9f9",
            border: "1px solid #ddd",
          }}
        >
          <span>
            <b>{u.email}</b>
            <br />
            {u.first_name} {u.last_name} — {u.is_active ? "Active" : "Inactive"}
          </span>

          <div>
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
            >
              Edit
            </button>

            <button
              onClick={() => toggleStatus(u.id)}
              style={{ marginLeft: "5px" }}
            >
              Toggle
            </button>

            <button
              onClick={() => deleteUser(u.id)}
              style={{ marginLeft: "5px" }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
