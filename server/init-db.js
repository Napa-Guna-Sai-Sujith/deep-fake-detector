import { sql } from "./db.js";

export async function initializeDatabase() {
  console.log("🔄 Initializing Neon database schema...");
  try {
    // 1. Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✅ 'users' table is ready.");

    // 2. Detection scans history table
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
    console.log("✅ 'scans' table is ready.");

    // Create index on email and created_at
    await sql`CREATE INDEX IF NOT EXISTS idx_scans_user_email ON scans(user_email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);`;

    console.log("🎉 Neon database schema initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing Neon database:", error);
    throw error;
  }
}

// Run directly if called via node
if (process.argv[1]?.includes("init-db.js")) {
  initializeDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
