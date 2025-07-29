var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as os from "os";
import { executeShellCommand, commandExists, shellEscape } from "../utils/command.js";
export const createScheduledTaskTool = {
    type: "function",
    function: {
        name: "createScheduledTask",
        description: "Creates a scheduled task or cron job on the system. Platform-dependent.",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "A unique name for the scheduled task.",
                },
                command: {
                    type: "string",
                    description: "The command to execute.",
                },
                schedule: {
                    type: "string",
                    description: "The schedule for the task (e.g., 'daily', 'hourly', '@reboot', or cron string for Linux/macOS, or specific time for Windows).",
                },
            },
            required: ["name", "command", "schedule"],
        },
    },
};
export function executeCreateScheduledTaskTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let cmd;
        if (os.platform() === "linux" || os.platform() === "darwin") {
            if (!(yield commandExists("crontab"))) {
                return "crontab not found. Please install cron.";
            }
            if (/[:;&|]/.test(args.schedule)) {
                return "Invalid characters in schedule string.";
            }
            const safeCmd = shellEscape(args.command);
            const entry = `${args.schedule} ${safeCmd} # ${args.name}`;
            const safeEntry = entry.replace(/"/g, '\"');
            cmd = `(crontab -l 2>/dev/null | grep -v -F '# ${args.name}' ; echo "${safeEntry}") | crontab -`;
        }
        else if (os.platform() === 'win32') {
            if (!(yield commandExists("schtasks"))) {
                return "schtasks not found. This tool requires Windows Task Scheduler.";
            }
            // Parse schedule like "DAILY 09:00" or just "09:00" for daily
            const parts = args.schedule.trim().split(/\s+/);
            let sc = parts[0];
            let st;
            let sd;
            if (/^\d{1,2}:\d{2}$/.test(sc)) {
                st = sc;
                sc = "DAILY";
            }
            else {
                sc = sc.toUpperCase();
                st = parts[1];
                sd = parts[2];
            }
            if (sc.match(/[^A-Z]/))
                return "Invalid schedule type";
            if (st && !/^\d{1,2}:\d{2}$/.test(st))
                return "Invalid start time";
            const safeName = shellEscape(args.name);
            const safeCommand = shellEscape(args.command);
            cmd = `schtasks /create /tn ${safeName} /tr ${safeCommand} /sc ${sc}`;
            if (st)
                cmd += ` /st ${st}`;
            if (sd) {
                if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(sd))
                    return "Invalid start date";
                cmd += ` /sd ${sd}`;
            }
        }
        else {
            return "Error: Scheduled tasks are not supported on this operating system.";
        }
        yield executeShellCommand(cmd);
        return "Scheduled task created.";
    });
}
export const listScheduledTasksTool = {
    type: "function",
    function: {
        name: "listScheduledTasks",
        description: "Lists all scheduled tasks or cron jobs on the system. Platform-dependent.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
};
export function executeListScheduledTasksTool() {
    return __awaiter(this, void 0, void 0, function* () {
        let cmd;
        if (os.platform() === 'linux' || os.platform() === 'darwin') {
            if (!(yield commandExists('crontab'))) {
                return 'crontab not found. Please install cron.';
            }
            cmd = `crontab -l`;
        }
        else if (os.platform() === 'win32') {
            if (!(yield commandExists('schtasks'))) {
                return 'schtasks not found. This tool requires Windows Task Scheduler.';
            }
            cmd = `schtasks /query /fo LIST /v`;
        }
        else {
            return "Error: Listing scheduled tasks is not supported on this operating system.";
        }
        try {
            const output = yield executeShellCommand(cmd);
            return output.trim() || "No scheduled tasks found.";
        }
        catch (error) {
            return `Error listing scheduled tasks: ${error.message}`;
        }
    });
}
export const deleteScheduledTaskTool = {
    type: "function",
    function: {
        name: "deleteScheduledTask",
        description: "Deletes a scheduled task or cron job by its name. Platform-dependent.",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "The name of the scheduled task to delete.",
                },
            },
            required: ["name"],
        },
    },
};
export function executeDeleteScheduledTaskTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let cmd;
        if (os.platform() === 'linux' || os.platform() === 'darwin') {
            if (!(yield commandExists('crontab'))) {
                return 'crontab not found. Please install cron.';
            }
            // Remove lines containing the identifier comment added during creation
            cmd = `crontab -l | grep -v -F '# ${args.name}' | crontab -`;
        }
        else if (os.platform() === 'win32') {
            if (!(yield commandExists('schtasks'))) {
                return 'schtasks not found. This tool requires Windows Task Scheduler.';
            }
            const safeName = shellEscape(args.name);
            cmd = `schtasks /delete /tn ${safeName} /f`; // /f to force delete
        }
        else {
            return "Error: Deleting scheduled tasks is not supported on this operating system.";
        }
        yield executeShellCommand(cmd);
        return "Scheduled task deleted.";
    });
}
