import { Tool } from "../core/types.js";
import { logger } from "../utils/logger.js";
import fs from "fs";
import initSqlJs, { Database } from "sql.js";

let currentDb: Database | null = null;
let currentDbPath = "";

export const connectDatabaseTool: Tool = {
  type: "function",
  function: {
    name: "connectDatabase",
    description: "Connects to a SQLite database file. Other database types are currently unsupported.",
    parameters: {
      type: "object",
      properties: {
        dbType: {
          type: "string",
          enum: ["mysql", "postgresql", "sqlite", "mongodb"], // Add more as needed
          description: "The type of database to connect to.",
        },
        connectionString: {
          type: "string",
          description: "The connection string or relevant connection details (e.g., host, port, user, password, dbname).",
        },
      },
      required: ["dbType", "connectionString"],
    },
  },
};

export async function executeConnectDatabaseTool(args: { dbType: string; connectionString: string }): Promise<string> {
  if (args.dbType !== "sqlite") {
    return `Unsupported database type: ${args.dbType}. Only 'sqlite' is currently supported.`;
  }
  try {
    const SQL = await initSqlJs();
    if (fs.existsSync(args.connectionString)) {
      const data = fs.readFileSync(args.connectionString);
      currentDb = new SQL.Database(new Uint8Array(data));
    } else {
      currentDb = new SQL.Database();
    }
    currentDbPath = args.connectionString;
    logger.info(`Connected to SQLite database at ${args.connectionString}`);
    return `Connected to SQLite database at ${args.connectionString}`;
  } catch (err: any) {
    currentDb = null;
    return `Error connecting to SQLite database: ${err.message}`;
  }
}

export const databaseQueryTool: Tool = {
  type: "function",
  function: {
    name: "executeDatabaseQuery",
    description: "Executes a SQL query against the currently connected database. Requires a prior conceptual connection.",
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

export async function executeDatabaseQueryTool(args: { query: string }): Promise<string> {
  if (!currentDb) {
    return "Error: No database connection established. Please use connectDatabase first.";
  }
  try {
    const results = currentDb.exec(args.query);
    return JSON.stringify(results, null, 2);
  } catch (err: any) {
    return `Error executing query: ${err.message}`;
  }
}

export const listDatabaseTablesTool: Tool = {
  type: "function",
  function: {
    name: "listDatabaseTables",
    description: "Lists all tables in the currently connected SQLite database.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

export async function executeListDatabaseTablesTool(): Promise<string> {
  if (!currentDb) {
    return "Error: No database connection established. Please use connectDatabase first.";
  }
  try {
    const res = currentDb.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tables = res[0]?.values.map((v) => v[0]) || [];
    return JSON.stringify(tables);
  } catch (err: any) {
    return `Error listing tables: ${err.message}`;
  }
}

export const getTableSchemaTool: Tool = {
  type: "function",
  function: {
    name: "getTableSchema",
    description: "Retrieves the column schema for a table in the connected SQLite database.",
    parameters: {
      type: "object",
      properties: {
        tableName: {
          type: "string",
          description: "The name of the table to retrieve schema for.",
        },
      },
      required: ["tableName"],
    },
  },
};

export async function executeGetTableSchemaTool(args: { tableName: string }): Promise<string> {
  if (!currentDb) {
    return "Error: No database connection established. Please use connectDatabase first.";
  }
  try {
    const res = currentDb.exec(`PRAGMA table_info(${args.tableName});`);
    return JSON.stringify(res[0]?.values || [], null, 2);
  } catch (err: any) {
    return `Error retrieving schema for ${args.tableName}: ${err.message}`;
  }
}
