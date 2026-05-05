import { Pool } from "@neondatabase/serverless";

// Module-level pool — reused across warm invocations
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export default pool;
