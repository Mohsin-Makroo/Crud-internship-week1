const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

function validEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
}

function validPassword(p) {
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#@$&]).{8,12}$/.test(p);
}

/* =========================
   LOGIN
========================= */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, is_active, profile_image FROM users WHERE email = $1 AND password = $2 AND is_deleted = false",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: "Account is inactive" });
    }

    res.json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      profile_image: user.profile_image
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   UPDATE PROFILE IMAGE
========================= */
app.patch("/users/:id/profile-image", async (req, res) => {
  const { profile_image } = req.body;
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE users SET profile_image = $1 WHERE id = $2",
      [profile_image, id]
    );
    res.json({ message: "Profile image updated", profile_image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile image" });
  }
});

/* =========================
   CREATE USER
========================= */
app.post("/users", async (req, res) => {
  const { first_name, last_name, contact, email, address, password } = req.body;

  if (first_name.length > 50 || last_name.length > 50)
    return res.send("Name too long");

  if (!/^\d{10}$/.test(contact))
    return res.send("Contact number must be exactly 10 digits");

  if (!validEmail(email))
    return res.send("Email must be a valid @gmail.com address");

  if (!validPassword(password))
    return res.send(
      "Password must be 8–12 chars with upper, lower, number & special (# $ & @)"
    );

  try {
    await pool.query(
      "SELECT * FROM add_user($1,$2,$3,$4,$5,$6)",
      [first_name, last_name, contact, email, address, password]
    );
    res.send("User Added");
  } catch {
    res.send("Email already exists");
  }
});

/* =========================
   GET USERS
========================= */
app.get("/users", async (req, res) => {
  const users = await pool.query("SELECT * FROM get_active_users()");
  res.json(users.rows);
});

/* =========================
   UPDATE USER
========================= */
app.put("/users/:id", async (req, res) => {
  const { first_name, last_name, contact, address } = req.body;

  if (first_name.length > 50 || last_name.length > 50)
    return res.send("Name too long");

  if (!/^\d{10}$/.test(contact))
    return res.send("Contact number must be exactly 10 digits");

  await pool.query(
    "SELECT * FROM update_user_details($1,$2,$3,$4,$5)",
    [req.params.id, first_name, last_name, contact, address]
  );

  res.send("User Updated");
});

/* =========================
   SOFT DELETE USER
========================= */
app.delete("/users/:id", async (req, res) => {
  await pool.query("CALL soft_delete_user_proc($1)", [req.params.id]);
  res.send("User Soft Deleted");
});

/* =========================
   TOGGLE STATUS
========================= */
app.patch("/users/status/:id", async (req, res) => {
  await pool.query("SELECT toggle_user_status($1)", [req.params.id]);
  res.send("Status Updated");
});

app.listen(5000, () => console.log("Backend running on 5000"));