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
import { executeShellCommand, commandExists, shellEscape } from "../utils/command.js";
export const createScriptFileTool = {
    type: "function",
    function: {
        name: "createScriptFile",
        description: "Creates a new script file with the specified content and makes it executable.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path where the script file will be created.",
                },
                content: { type: "string", description: "The content of the script." },
                language: {
                    type: "string",
                    description: "Optional: The language of the script (e.g., 'bash', 'python'). Used for shebang. Defaults to 'bash'.",
                    default: "bash",
                    nullable: true,
                },
            },
            required: ["filePath", "content"],
        },
    },
};
export function executeCreateScriptFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let shebang = "";
            if (args.language === "python") {
                shebang = "#!/usr/bin/env python\n";
            }
            else if (args.language === "bash") {
                shebang = "#!/bin/bash\n";
            }
            fs.writeFileSync(args.filePath, shebang + args.content, "utf-8");
            fs.chmodSync(args.filePath, "755");
            return `Script file ${args.filePath} created and made executable.`;
        }
        catch (error) {
            return `Error creating script file: ${error.message}`;
        }
    });
}
export const executeScriptFileTool = {
    type: "function",
    function: {
        name: "executeScriptFile",
        description: "Executes a script file with a specified interpreter or directly if executable.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the script file to execute.",
                },
                interpreter: {
                    type: "string",
                    description: "Optional: The interpreter to use (e.g., 'python', 'node', 'bash'). If omitted, attempts to execute directly.",
                    nullable: true,
                },
                args: {
                    type: "array",
                    items: { type: "string" },
                    description: "Optional: An array of string arguments for the script.",
                    nullable: true,
                },
            },
            required: ["filePath"],
        },
    },
};
export function executeExecuteScriptFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = shellEscape(args.filePath);
        let command;
        if (args.interpreter) {
            command = `${shellEscape(args.interpreter)} ${file}`;
        }
        else {
            command = file;
        }
        if (args.args && args.args.length > 0) {
            const escaped = args.args.map((a) => shellEscape(a)).join(" ");
            command += ` ${escaped}`;
        }
        try {
            const output = yield executeShellCommand(command);
            return `Script executed successfully:\n${output}`;
        }
        catch (error) {
            return `Error executing script: ${error.message}`;
        }
    });
}
export const scheduleScriptTool = {
    type: "function",
    function: {
        name: "scheduleScript",
        description: "Schedules a script to run at a specific time or interval using the system's scheduler (e.g., cron on Linux/macOS, Task Scheduler on Windows).",
        parameters: {
            type: "object",
            properties: {
                scriptPath: {
                    type: "string",
                    description: "The path to the script file to schedule.",
                },
                schedule: {
                    type: "string",
                    description: "The schedule string (e.g., cron string '0 0 * * *' for daily, or Windows Task Scheduler compatible string).",
                },
                name: {
                    type: "string",
                    description: "A unique name for the scheduled task.",
                },
            },
            required: ["scriptPath", "schedule", "name"],
        },
    },
};
export function executeScheduleScriptTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = shellEscape(args.scriptPath);
        const name = shellEscape(args.name);
        let command;
        if (os.platform() === "win32") {
            if (!(yield commandExists("schtasks"))) {
                return "schtasks not found. This tool requires Windows Task Scheduler.";
            }
            command = `schtasks /create /tn ${name} /tr ${file} /sc ONCE /st ${args.schedule}`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            if (!(yield commandExists("crontab"))) {
                return "crontab not found. Please install cron.";
            }
            const entry = `${args.schedule} ${args.scriptPath} # ${args.name}`;
            const safeEntry = entry.replace(/"/g, '\"');
            command = `(crontab -l 2>/dev/null | grep -v -F '# ${args.name}' ; echo "${safeEntry}") | crontab -`;
        }
        else {
            return "Error: Scheduling scripts is not supported on this operating system.";
        }
        try {
            const output = yield executeShellCommand(command);
            return `Script '${args.scriptPath}' scheduled successfully as '${args.name}':\n${output}`;
        }
        catch (error) {
            return `Error scheduling script: ${error.message}`;
        }
    });
}
