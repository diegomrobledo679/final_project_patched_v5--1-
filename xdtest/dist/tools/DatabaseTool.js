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
import fs from "fs";
import initSqlJs from "sql.js";
let currentDb = null;
let currentDbPath = "";
export const connectDatabaseTool = {
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
export function executeConnectDatabaseTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (args.dbType !== "sqlite") {
            return `Unsupported database type: ${args.dbType}. Only 'sqlite' is currently supported.`;
        }
        try {
            const SQL = yield initSqlJs();
            if (fs.existsSync(args.connectionString)) {
                const data = fs.readFileSync(args.connectionString);
                currentDb = new SQL.Database(new Uint8Array(data));
            }
            else {
                currentDb = new SQL.Database();
            }
            currentDbPath = args.connectionString;
            logger.info(`Connected to SQLite database at ${args.connectionString}`);
            return `Connected to SQLite database at ${args.connectionString}`;
        }
        catch (err) {
            currentDb = null;
            return `Error connecting to SQLite database: ${err.message}`;
        }
    });
}
export const databaseQueryTool = {
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
export function executeDatabaseQueryTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentDb) {
            return "Error: No database connection established. Please use connectDatabase first.";
        }
        try {
            const results = currentDb.exec(args.query);
            return JSON.stringify(results, null, 2);
        }
        catch (err) {
            return `Error executing query: ${err.message}`;
        }
    });
}
export const listDatabaseTablesTool = {
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
export function executeListDatabaseTablesTool() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!currentDb) {
            return "Error: No database connection established. Please use connectDatabase first.";
        }
        try {
            const res = currentDb.exec("SELECT name FROM sqlite_master WHERE type='table'");
            const tables = ((_a = res[0]) === null || _a === void 0 ? void 0 : _a.values.map((v) => v[0])) || [];
            return JSON.stringify(tables);
        }
        catch (err) {
            return `Error listing tables: ${err.message}`;
        }
    });
}
export const getTableSchemaTool = {
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
export function executeGetTableSchemaTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!currentDb) {
            return "Error: No database connection established. Please use connectDatabase first.";
        }
        try {
            const res = currentDb.exec(`PRAGMA table_info(${args.tableName});`);
            return JSON.stringify(((_a = res[0]) === null || _a === void 0 ? void 0 : _a.values) || [], null, 2);
        }
        catch (err) {
            return `Error retrieving schema for ${args.tableName}: ${err.message}`;
        }
    });
}
