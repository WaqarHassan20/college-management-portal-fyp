import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const email = "waqarhassan7661@gmail.com";
    console.log(`Cleaning up database records for ${email}...`);

    // 1. Find User by email
    const userRes = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (userRes.rows.length > 0) {
      const userId = userRes.rows[0].id;
      // Find Student
      const studentRes = await pool.query('SELECT id FROM "Student" WHERE "userId" = $1', [userId]);
      if (studentRes.rows.length > 0) {
        const studentId = studentRes.rows[0].id;
        // Delete Fees
        const feeDel = await pool.query('DELETE FROM "Fee" WHERE "studentId" = $1', [studentId]);
        console.log(`Deleted ${feeDel.rowCount} fee records.`);
        // Delete Student
        const studDel = await pool.query('DELETE FROM "Student" WHERE id = $1', [studentId]);
        console.log(`Deleted student profile.`);
      }
    }

    // 2. Delete Admissions
    const admDel = await pool.query('DELETE FROM "Admission" WHERE email = $1', [email]);
    console.log(`Deleted ${admDel.rowCount} admission records.`);

    console.log("Cleanup complete!");
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
