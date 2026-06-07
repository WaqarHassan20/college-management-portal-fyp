import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query('SELECT u.id as user_id, u.email, u."clerkId", s.id as student_id, s."rollNo" FROM "User" u LEFT JOIN "Student" s ON u.id = s."userId" WHERE u.email = \'waqarhassan7661@gmail.com\'');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
