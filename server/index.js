import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sql, checkDbConnection } from "./db.js";
import { initializeDatabase } from "./init-db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 1. Health & Database connection check
app.get("/api/health", async (req, res) => {
  const dbStatus = await checkDbConnection();
  res.json({
    status: "ok",
    database: dbStatus.success ? "connected" : "disconnected",
    dbInfo: dbStatus.info || null,
    error: dbStatus.error || null,
  });
});

// 2. Auth: Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1;
    `;

    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    // Insert user
    const [newUser] = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name.trim()}, ${normalizedEmail}, ${password})
      RETURNING id, name, email, created_at;
    `;

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error during registration" });
  }
});

// 3. Auth: Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const users = await sql`
      SELECT id, name, email, password, created_at
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1;
    `;

    if (users.length === 0) {
      // Demo fallback support
      if (normalizedEmail === "demo@deepfakeshield.com" && password === "demo1234") {
        return res.json({
          user: { name: "Demo User", email: "demo@deepfakeshield.com" },
        });
      }
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error during login" });
  }
});

// 4. Save Deepfake Scan Result
app.post("/api/scans", async (req, res) => {
  const {
    userEmail,
    fileName,
    fileType,
    fileSize,
    verdict,
    confidence,
    audioScore,
    videoScore,
    fusedScore,
    details,
  } = req.body;

  if (!fileName || !verdict || confidence === undefined) {
    return res.status(400).json({ error: "fileName, verdict, and confidence are required" });
  }

  try {
    const [scan] = await sql`
      INSERT INTO scans (
        user_email,
        file_name,
        file_type,
        file_size,
        verdict,
        confidence,
        audio_score,
        video_score,
        fused_score,
        details
      ) VALUES (
        ${userEmail || null},
        ${fileName},
        ${fileType || "unknown"},
        ${fileSize || ""},
        ${verdict},
        ${confidence},
        ${audioScore || 0},
        ${videoScore || 0},
        ${fusedScore || 0},
        ${JSON.stringify(details || {})}
      )
      RETURNING *;
    `;

    return res.status(201).json({
      message: "Scan saved successfully",
      scan,
    });
  } catch (error) {
    console.error("Error saving scan:", error);
    return res.status(500).json({ error: "Failed to save scan result" });
  }
});

// 5. Get Scan History
app.get("/api/scans", async (req, res) => {
  const { email, limit = 20 } = req.query;

  try {
    let scans;
    if (email) {
      scans = await sql`
        SELECT * FROM scans
        WHERE user_email = ${String(email).toLowerCase().trim()}
        ORDER BY created_at DESC
        LIMIT ${Number(limit)};
      `;
    } else {
      scans = await sql`
        SELECT * FROM scans
        ORDER BY created_at DESC
        LIMIT ${Number(limit)};
      `;
    }

    return res.json({ scans });
  } catch (error) {
    console.error("Error fetching scans:", error);
    return res.status(500).json({ error: "Failed to retrieve scans" });
  }
});

// 6. Aggregate Statistics from Neon DB
app.get("/api/stats", async (req, res) => {
  try {
    const [totalCount] = await sql`SELECT COUNT(*)::int as total FROM scans;`;
    const [fakeCount] = await sql`SELECT COUNT(*)::int as fake FROM scans WHERE verdict = 'Fake';`;
    const [realCount] = await sql`SELECT COUNT(*)::int as real FROM scans WHERE verdict = 'Real';`;
    const [avgConf] = await sql`SELECT COALESCE(AVG(confidence), 0)::numeric(5,2) as avg_confidence FROM scans;`;

    return res.json({
      totalScans: totalCount.total || 0,
      fakeDetected: fakeCount.fake || 0,
      realDetected: realCount.real || 0,
      avgConfidence: Number(avgConf.avg_confidence) || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Neon DB API Server running at http://localhost:${PORT}`);
  });
});
