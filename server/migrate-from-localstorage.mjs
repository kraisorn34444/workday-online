#!/usr/bin/env node
/**
 * Migration script: Import work records from localStorage JSON to MySQL Database
 * Usage: node migrate-from-localstorage.mjs <userId> <json-file-path>
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Parse MySQL connection string
function parseConnectionString(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error("Invalid DATABASE_URL format");
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
}

async function migrateRecords(userId, jsonFilePath) {
  let connection;

  try {
    // Read JSON file
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`❌ File not found: ${jsonFilePath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
    const records = JSON.parse(fileContent);

    if (!Array.isArray(records)) {
      console.error("❌ JSON file must contain an array of records");
      process.exit(1);
    }

    // Connect to database
    const config = parseConnectionString(DATABASE_URL);
    connection = await mysql.createConnection(config);

    console.log(`📊 Starting migration for user ${userId}...`);
    console.log(`📝 Found ${records.length} records to import`);

    let imported = 0;
    let skipped = 0;

    for (const record of records) {
      try {
        // Map localStorage format to database format
        const dbRecord = {
          userId,
          date: record.date,
          month: record.month,
          customerName: record.customer_name || null,
          customerPhone: record.customer_phone || null,
          product: record.product || null,
          os: record.os || null,
          serviceType: record.service_type || null,
          details: record.details?.join("\n") || null,
          notes: record.notes?.join("\n") || null,
          status: record.status || "pending",
        };

        // Insert record
        const [result] = await connection.execute(
          `INSERT INTO workRecords 
           (userId, date, month, customerName, customerPhone, product, os, serviceType, details, notes, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            dbRecord.userId,
            dbRecord.date,
            dbRecord.month,
            dbRecord.customerName,
            dbRecord.customerPhone,
            dbRecord.product,
            dbRecord.os,
            dbRecord.serviceType,
            dbRecord.details,
            dbRecord.notes,
            dbRecord.status,
          ]
        );

        // Import images if present
        if (record.images && Array.isArray(record.images) && result.insertId) {
          for (const image of record.images) {
            try {
              await connection.execute(
                `INSERT INTO workRecordImages (recordId, filename, url, uploadedAt) VALUES (?, ?, ?, ?)`,
                [result.insertId, image.filename, image.url, image.uploadedAt || new Date().toISOString()]
              );
            } catch (imgErr) {
              console.warn(`⚠️  Failed to import image for record ${result.insertId}:`, imgErr.message);
            }
          }
        }

        imported++;
        process.stdout.write(`\r✅ Imported ${imported}/${records.length} records`);
      } catch (err) {
        console.error(`\n❌ Error importing record:`, err.message);
        skipped++;
      }
    }

    console.log(`\n\n📈 Migration complete!`);
    console.log(`✅ Imported: ${imported}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${imported + skipped}`);

    await connection.end();
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node migrate-from-localstorage.mjs <userId> <json-file-path>");
  console.log("\nExample:");
  console.log("  node migrate-from-localstorage.mjs 1 ./records.json");
  process.exit(1);
}

const [userId, jsonFilePath] = args;
migrateRecords(parseInt(userId), jsonFilePath);
