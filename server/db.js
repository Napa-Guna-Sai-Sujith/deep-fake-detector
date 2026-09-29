import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("⚠️ DATABASE_URL is not set in environment variables.");
}

export const sql = neon(connectionString);

export async function checkDbConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    return { success: true, info: result[0] };
  } catch (error) {
    console.error("Neon DB connection error:", error);
    return { success: false, error: error.message };
  }
}
