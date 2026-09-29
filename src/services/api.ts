import { neon } from "@neondatabase/serverless";

// Neon Postgres Connection String
const DATABASE_URL =
  (import.meta.env?.VITE_DATABASE_URL as string) ||
  "postgresql://neondb_owner:npg_E6D5qJclNGyh@ep-sparkling-pond-b56bb0cw-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
}

export interface ScanRecord {
  id?: number;
  userEmail?: string;
  fileName: string;
  fileType: string;
  fileSize?: string;
  verdict: "Real" | "Fake";
  confidence: number;
  audioScore?: number;
  videoScore?: number;
  fusedScore?: number;
  details?: Record<string, unknown>;
  createdAt?: string;
}

export interface SystemStats {
  totalScans: number;
  fakeDetected: number;
  realDetected: number;
  avgConfidence: number;
}

// Client-side Neon SQL Query Runner
const sql = neon(DATABASE_URL);

let tablesInitialized = false;

/**
 * Ensures Neon DB tables are present
 */
export async function ensureTablesExist() {
  if (tablesInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255),
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size VARCHAR(50),
        verdict VARCHAR(20) NOT NULL,
        confidence NUMERIC(6, 2) NOT NULL,
        audio_score NUMERIC(6, 2),
        video_score NUMERIC(6, 2),
        fused_score NUMERIC(6, 2),
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    tablesInitialized = true;
  } catch (err) {
    console.warn("Table auto-creation warning (might already exist):", err);
  }
}

// 1. Health & Neon Connection Check
export async function checkNeonStatus(): Promise<{ connected: boolean; info?: unknown; error?: string }> {
  try {
    await ensureTablesExist();
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    return {
      connected: true,
      info: result[0],
    };
  } catch (err: unknown) {
    console.error("Neon DB Direct Connection Error:", err);
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Unable to connect to Neon DB",
    };
  }
}

// 2. Register User directly in Neon DB
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    await ensureTablesExist();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1;
    `;

    if (existing.length > 0) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Insert user into Neon DB
    const [newUser] = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name.trim()}, ${normalizedEmail}, ${password})
      RETURNING id, name, email, created_at;
    `;

    return {
      success: true,
      user: {
        id: newUser.id as number,
        name: newUser.name as string,
        email: newUser.email as string,
      },
    };
  } catch (err: unknown) {
    console.error("Registration error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Database error during registration",
    };
  }
}

// 3. Login User directly from Neon DB
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    await ensureTablesExist();
    const normalizedEmail = email.toLowerCase().trim();

    const users = await sql`
      SELECT id, name, email, password, created_at
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1;
    `;

    if (users.length === 0) {
      if (normalizedEmail === "demo@deepfakeshield.com" && password === "demo1234") {
        return {
          success: true,
          user: { name: "Demo User", email: "demo@deepfakeshield.com" },
        };
      }
      return { success: false, error: "Invalid email or password" };
    }

    const user = users[0];
    if (user.password !== password) {
      return { success: false, error: "Invalid email or password" };
    }

    return {
      success: true,
      user: {
        id: user.id as number,
        name: user.name as string,
        email: user.email as string,
      },
    };
  } catch (err: unknown) {
    console.error("Login error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Database error during login",
    };
  }
}

// 4. Save Scan Record directly into Neon DB
export async function saveScanToDb(scanData: ScanRecord): Promise<{ success: boolean; scan?: ScanRecord; error?: string }> {
  try {
    await ensureTablesExist();
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
        ${scanData.userEmail || null},
        ${scanData.fileName},
        ${scanData.fileType || "unknown"},
        ${scanData.fileSize || ""},
        ${scanData.verdict},
        ${scanData.confidence},
        ${scanData.audioScore || 0},
        ${scanData.videoScore || 0},
        ${scanData.fusedScore || 0},
        ${JSON.stringify(scanData.details || {})}
      )
      RETURNING *;
    `;

    return { success: true, scan: scan as unknown as ScanRecord };
  } catch (err: unknown) {
    console.error("Error saving scan to Neon DB:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save scan",
    };
  }
}

// 5. Get Scans History from Neon DB
export async function getScanHistory(email?: string, limit = 20): Promise<ScanRecord[]> {
  try {
    await ensureTablesExist();
    let scans;
    if (email) {
      scans = await sql`
        SELECT * FROM scans
        WHERE user_email = ${String(email).toLowerCase().trim()}
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;
    } else {
      scans = await sql`
        SELECT * FROM scans
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;
    }

    return (scans as unknown as ScanRecord[]) || [];
  } catch (err) {
    console.error("Error fetching scans from Neon DB:", err);
    return [];
  }
}

// 6. Get Global Stats from Neon DB
export async function getDbStats(): Promise<SystemStats | null> {
  try {
    await ensureTablesExist();
    const [totalCount] = await sql`SELECT COUNT(*)::int as total FROM scans;`;
    const [fakeCount] = await sql`SELECT COUNT(*)::int as fake FROM scans WHERE verdict = 'Fake';`;
    const [realCount] = await sql`SELECT COUNT(*)::int as real FROM scans WHERE verdict = 'Real';`;
    const [avgConf] = await sql`SELECT COALESCE(AVG(confidence), 0)::numeric(5,2) as avg_confidence FROM scans;`;

    return {
      totalScans: (totalCount?.total as number) || 0,
      fakeDetected: (fakeCount?.fake as number) || 0,
      realDetected: (realCount?.real as number) || 0,
      avgConfidence: Number(avgConf?.avg_confidence) || 0,
    };
  } catch (err) {
    console.error("Error fetching stats from Neon DB:", err);
    return null;
  }
}
