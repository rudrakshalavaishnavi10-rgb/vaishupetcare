require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pet_care_db",
  waitForConnections: true,
  connectionLimit: 10
});

const resources = {
  owners: {
    table: "owners", id: "owner_id",
    fields: ["name", "email", "phone", "address"],
    required: ["name"]
  },
  pets: {
    table: "pets", id: "pet_id",
    fields: ["owner_id", "pet_name", "species", "breed", "age"],
    required: ["owner_id", "pet_name"]
  },
  appointments: {
    table: "appointments", id: "appointment_id",
    fields: ["pet_id", "doctor_name", "appointment_date", "reason", "status"],
    required: ["pet_id", "doctor_name", "appointment_date"]
  },
  records: {
    table: "medical_records", id: "record_id",
    fields: ["pet_id", "visit_date", "diagnosis", "treatment", "notes"],
    required: ["pet_id", "visit_date"]
  }
};

function validResource(req, res, next) {
  const config = resources[req.params.resource];
  if (!config) return res.status(404).json({ message: "Unknown resource" });
  req.config = config;
  next();
}

app.get("/api/:resource", validResource, async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${req.config.table} ORDER BY ${req.config.id} DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/api/:resource", validResource, async (req, res) => {
  try {
    const { fields, required, table } = req.config;
    for (const field of required) {
      if (req.body[field] === undefined || req.body[field] === "") {
        return res.status(400).json({ message: `${field} is required` });
      }
    }
    const selected = fields.filter(f => req.body[f] !== undefined);
    const values = selected.map(f => req.body[f] === "" ? null : req.body[f]);
    if (!selected.length) return res.status(400).json({ message: "No data provided" });
    const placeholders = selected.map(() => "?").join(", ");
    const [result] = await pool.query(
      `INSERT INTO ${table} (${selected.join(", ")}) VALUES (${placeholders})`, values
    );
    res.status(201).json({ message: "Record created", id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put("/api/:resource/:id", validResource, async (req, res) => {
  try {
    const { fields, table, id } = req.config;
    const selected = fields.filter(f => req.body[f] !== undefined);
    if (!selected.length) return res.status(400).json({ message: "No fields to update" });
    const values = selected.map(f => req.body[f] === "" ? null : req.body[f]);
    const [result] = await pool.query(
      `UPDATE ${table} SET ${selected.map(f => `${f} = ?`).join(", ")} WHERE ${id} = ?`,
      [...values, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete("/api/:resource/:id", validResource, async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM ${req.config.table} WHERE ${req.config.id} = ?`, [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/api/summary", async (req, res) => {
  try {
    const [[owners]] = await pool.query("SELECT COUNT(*) AS total FROM owners");
    const [[pets]] = await pool.query("SELECT COUNT(*) AS total FROM pets");
    const [[appointments]] = await pool.query("SELECT COUNT(*) AS total FROM appointments");
    const [[records]] = await pool.query("SELECT COUNT(*) AS total FROM medical_records");
    res.json({ owners: owners.total, pets: pets.total, appointments: appointments.total, records: records.total });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Pet Care system running at http://localhost:${port}`));