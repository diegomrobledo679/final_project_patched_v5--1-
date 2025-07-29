var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from "fs";
import * as os from "os";
export const readLogFileTool = {
    type: "function",
    function: {
        name: "readLogFile",
        description: "Reads the content of a specified log file.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the log file to read.",
                },
                lines: {
                    type: "number",
                    description: "Optional: Number of lines to read from the end of the file. Defaults to entire file.",
                    nullable: true,
                },
            },
            required: ["filePath"],
        },
    },
};
export function executeReadLogFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!fs.existsSync(args.filePath)) {
                return `Error: Log file not found at ${args.filePath}`;
            }
            let content = fs.readFileSync(args.filePath, "utf-8");
            if (args.lines) {
                const allLines = content.split(/\r\n|\r|\n/);
                content = allLines.slice(Math.max(0, allLines.length - args.lines)).join(os.EOL);
            }
            return `Content of ${args.filePath}:\n${content}`;
        }
        catch (error) {
            return `Error reading log file: ${error.message}`;
        }
    });
}
export const filterLogFileTool = {
    type: "function",
    function: {
        name: "filterLogFile",
        description: "Filters a log file for entries matching a specific pattern.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the log file to filter.",
                },
                pattern: {
                    type: "string",
                    description: "The regex pattern to search for within log entries.",
                },
            },
            required: ["filePath", "pattern"],
        },
    },
};
export function executeFilterLogFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!fs.existsSync(args.filePath)) {
                return `Error: Log file not found at ${args.filePath}`;
            }
            const content = fs.readFileSync(args.filePath, "utf-8");
            const lines = content.split(/\r\n|\r|\n/);
            const regex = new RegExp(args.pattern, 'gim');
            const matches = lines.filter(line => regex.test(line));
            if (matches.length > 0) {
                return `Found ${matches.length} matching entries in ${args.filePath}:\n${matches.join('\n')}`;
            }
            else {
                return `No matches found for pattern "${args.pattern}" in ${args.filePath}.`;
            }
        }
        catch (error) {
            return `Error filtering log file: ${error.message}`;
        }
    });
}
export const clearLogFileTool = {
    type: "function",
    function: {
        name: "clearLogFile",
        description: "Clears the content of a specified log file. Use with extreme caution.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the log file to clear.",
                },
            },
            required: ["filePath"],
        },
    },
};
export function executeClearLogFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!fs.existsSync(args.filePath)) {
                return `Error: Log file not found at ${args.filePath}`;
            }
            fs.writeFileSync(args.filePath, '', "utf-8");
            return `Log file ${args.filePath} cleared successfully.`;
        }
        catch (error) {
            return `Error clearing log file: ${error.message}`;
        }
    });
}
