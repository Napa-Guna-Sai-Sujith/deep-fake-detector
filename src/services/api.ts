// API client service communicating with Neon DB backend

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

// 1. Health & Neon Connection Check
export async function checkNeonStatus(): Promise<{ connected: boolean; info?: unknown; error?: string }> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return {
      connected: data.database === "connected",
      info: data.dbInfo,
    };
  } catch (err: unknown) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Unable to reach server",
    };
  }
}

// 2. Register
export async function registerUser(name: string, email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Registration failed" };
    }
    return { success: true, user: data.user };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// 3. Login
export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Login failed" };
    }
    return { success: true, user: data.user };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// 4. Save Scan
export async function saveScanToDb(scanData: ScanRecord): Promise<{ success: boolean; scan?: ScanRecord; error?: string }> {
  try {
    const res = await fetch("/api/scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scanData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to save scan" };
    }
    return { success: true, scan: data.scan };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// 5. Get Scans History
export async function getScanHistory(email?: string, limit = 20): Promise<ScanRecord[]> {
  try {
    const query = email ? `?email=${encodeURIComponent(email)}&limit=${limit}` : `?limit=${limit}`;
    const res = await fetch(`/api/scans${query}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.scans || [];
  } catch {
    return [];
  }
}

// 6. Get Global Stats
export async function getDbStats(): Promise<SystemStats | null> {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
