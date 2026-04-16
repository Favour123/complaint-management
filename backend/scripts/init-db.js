/**
 * Applies db/schema.sql using DATABASE_URL from .env
 * Run: npm run db:init
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const sqlPath = path.join(__dirname, "..", "db", "schema.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool
  .query(sql)
  .then(() => {
    console.log("Schema applied successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
