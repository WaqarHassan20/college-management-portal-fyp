import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query('SELECT * FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 100');
    console.log("=== Audit Logs ===");
    for (const log of res.rows) {
      if (log.entity === "Fee" || log.description.includes("waqar") || log.description.includes("fee")) {
        console.log(`[${log.createdAt.toISOString()}] ${log.action} ${log.entity} (ID: ${log.entityId}) by ${log.adminName}: ${log.description}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
