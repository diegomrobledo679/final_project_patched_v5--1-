var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { logger } from "../utils/logger.js";
import initSqlJs from "sql.js";
let db; // Keep the database instance in memory
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (db)
            return;
        try {
            const SQL = yield initSqlJs();
            db = new SQL.Database();
            // You can pre-populate the database with tables and data here if needed
            db.run("CREATE TABLE users (id INT, name TEXT, email TEXT, age INT);");
            db.run("INSERT INTO users VALUES (1, 'Alice', 'alice@example.com', 30), (2, 'Bob', 'bob@example.com', 24);");
            logger.info("In-memory SQL database initialized.");
        }
        catch (error) {
            logger.error("Failed to initialize SQL.js database:", error);
            throw error;
        }
    });
}
export const sqlTool = {
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
export function executeSqlTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        yield initializeDatabase();
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
            results.forEach((res, i) => {
                output += `Result set ${i + 1}:\n`;
                output += `Columns: ${res.columns.join(", ")}\n`;
                output += "Rows:\n";
                res.values.forEach((row) => {
                    output += `  - ${JSON.stringify(row)}\n`;
                });
            });
            return output;
        }
        catch (error) {
            logger.error(`Error executing SQL query: ${args.query}`, error);
            return `Error executing SQL query: ${error.message}`;
        }
    });
}
