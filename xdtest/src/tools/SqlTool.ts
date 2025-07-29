import { Tool } from "../core/types.js";
import { logger } from "../utils/logger.js";
import initSqlJs from "sql.js";

let db: any; // Keep the database instance in memory

async function initializeDatabase() {
    if (db) return;
    try {
        const SQL = await initSqlJs();
        db = new SQL.Database();
        // You can pre-populate the database with tables and data here if needed
        db.run("CREATE TABLE users (id INT, name TEXT, email TEXT, age INT);");
        db.run("INSERT INTO users VALUES (1, 'Alice', 'alice@example.com', 30), (2, 'Bob', 'bob@example.com', 24);");
        logger.info("In-memory SQL database initialized.");
    } catch (error) {
        logger.error("Failed to initialize SQL.js database:", error);
        throw error;
    }
}

export const sqlTool: Tool = {
  type: "function",
  function: {
    name: "execute_sql",
    description: "Executes a SQL query against an in-memory SQLite database. The database is reset on each run. Supports standard SQL syntax.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The SQL query to execute.",
        },
      },
      required: ["query"],
    },
  },
};

export async function executeSqlTool(args: { query: string }): Promise<string> {
  await initializeDatabase();
  if (!db) {
      return "Error: Database not initialized.";
  }

  try {
    const results = db.exec(args.query);
    if (results.length === 0) {
        return `Query executed successfully: "${args.query}". No results returned.`;
    }
    // Format the output
    let output = `Query results for: "${args.query}"\n`;
    results.forEach((res: any, i: number) => {
        output += `Result set ${i + 1}:\n`;
        output += `Columns: ${res.columns.join(", ")}\n`;
        output += "Rows:\n";
        res.values.forEach((row: any) => {
            output += `  - ${JSON.stringify(row)}\n`;
        });
    });
    return output;
  } catch (error: any) {
    logger.error(`Error executing SQL query: ${args.query}`, error);
    return `Error executing SQL query: ${error.message}`;
  }
}