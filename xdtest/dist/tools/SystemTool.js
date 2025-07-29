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
import { exec } from "child_process";
import { executeShellCommand } from "../utils/command.js";
export const systemInfoTool = {
    type: "function",
    function: {
        name: "getSystemInfo",
        description: "Retrieves various system information.",
        parameters: {
            type: "object",
            properties: {
                infoType: {
                    type: "string",
                    enum: [
                        "platform",
                        "arch",
                        "hostname",
                        "uptime",
                        "totalmem",
                        "freemem",
                        "cpus",
                        "networkInterfaces",
                    ],
                    description: "The type of system information to retrieve.",
                },
            },
            required: ["infoType"],
        },
    },
};
export function executeSystemInfoTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            switch (args.infoType) {
                case "platform":
                    return os.platform();
                case "arch":
                    return os.arch();
                case "hostname":
                    return os.hostname();
                case "uptime":
                    const uptimeSeconds = os.uptime();
                    const hours = Math.floor(uptimeSeconds / 3600);
                    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
                    const seconds = Math.floor(uptimeSeconds % 60);
                    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
                case "totalmem":
                    return `${(os.totalmem() / 1024 ** 3).toFixed(2)} GB`;
                case "freemem":
                    return `${(os.freemem() / 1024 ** 3).toFixed(2)} GB`;
                case "cpus": {
                    const cpus = os.cpus();
                    return `CPU Model: ${cpus[0].model}, Cores: ${cpus.length}`;
                }
                case "networkInterfaces": {
                    const nets = os.networkInterfaces();
                    let networkInfo = "";
                    for (const name of Object.keys(nets)) {
                        for (const net of nets[name]) {
                            if (net.family === "IPv4" && !net.internal) {
                                networkInfo += `Interface: ${name}, Address: ${net.address}, MAC: ${net.mac}\n`;
                            }
                        }
                    }
                    return networkInfo.trim();
                }
                default:
                    return `Error: Unknown info type ${args.infoType}`;
            }
        }
        catch (error) {
            return `Error retrieving ${args.infoType} information: ${error.message}`;
        }
    });
}
export const processListTool = {
    type: "function",
    function: {
        name: "listProcesses",
        description: "Lists running processes on the system.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
};
export function executeProcessListTool() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let command;
            if (os.platform() === "win32") {
                command = "tasklist";
            }
            else {
                command = "ps aux";
            }
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error listing processes: ${stderr}`);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    });
}
export const executeShellCommandTool = {
    type: "function",
    function: {
        name: "executeShellCommand",
        description: "Executes an arbitrary shell command and returns its output.",
        parameters: {
            type: "object",
            properties: {
                command: {
                    type: "string",
                    description: "The shell command to execute.",
                },
            },
            required: ["command"],
        },
    },
};
export function executeExecuteShellCommandTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            exec(args.command, (error, stdout, stderr) => {
                if (error) {
                    reject(`Command execution failed: ${stderr || error.message}`);
                }
                else {
                    resolve(stdout || "Command executed successfully with no output.");
                }
            });
        });
    });
}
export const getHardwareInfoTool = {
    type: "function",
    function: {
        name: "getHardwareInfo",
        description: "Retrieves hardware information using built-in Node.js calls and common system utilities.",
        parameters: {
            type: "object",
            properties: {
                infoType: {
                    type: "string",
                    enum: ["cpu", "memory", "storage", "network", "gpu", "all"],
                    description: "The type of hardware information to retrieve.",
                },
            },
            required: ["infoType"],
        },
    },
};
export function executeGetHardwareInfoTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const collect = (type) => __awaiter(this, void 0, void 0, function* () {
            switch (type) {
                case "cpu":
                    return JSON.stringify(os.cpus(), null, 2);
                case "memory":
                    return `Total: ${os.totalmem()}\nFree: ${os.freemem()}`;
                case "storage": {
                    const cmd = os.platform() === "win32"
                        ? "wmic logicaldisk get size,freespace,caption"
                        : "df -h";
                    try {
                        return yield executeShellCommand(cmd);
                    }
                    catch (_a) {
                        return "Storage information not available.";
                    }
                }
                case "network":
                    return JSON.stringify(os.networkInterfaces(), null, 2);
                case "gpu": {
                    const cmd = os.platform() === "win32"
                        ? "wmic path win32_VideoController get name"
                        : "lspci | grep -i -E 'vga|3d|2d'";
                    try {
                        return yield executeShellCommand(cmd);
                    }
                    catch (_b) {
                        return "GPU information not available.";
                    }
                }
                default:
                    return "Unknown info type.";
            }
        });
        if (args.infoType === "all") {
            const parts = yield Promise.all([
                collect("cpu"),
                collect("memory"),
                collect("storage"),
                collect("network"),
                collect("gpu"),
            ]);
            return parts.join("\n\n");
        }
        return collect(args.infoType);
    });
}
export const manageHardwareDeviceTool = {
    type: "function",
    function: {
        name: "manageHardwareDevice",
        description: "Enables, disables, or restarts a network interface using common system commands.",
        parameters: {
            type: "object",
            properties: {
                deviceId: {
                    type: "string",
                    description: "The identifier of the hardware device.",
                },
                operation: {
                    type: "string",
                    enum: ["enable", "disable", "restart"],
                    description: "The operation to perform on the device.",
                },
            },
            required: ["deviceId", "operation"],
        },
    },
};
export function executeManageHardwareDeviceTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmds = [];
        if (os.platform() === "win32") {
            const base = `netsh interface set interface name="${args.deviceId}" admin=`;
            if (args.operation === "enable")
                cmds.push(base + "enabled");
            if (args.operation === "disable")
                cmds.push(base + "disabled");
            if (args.operation === "restart")
                cmds.push(base + "disabled", base + "enabled");
        }
        else {
            const base = `ip link set ${args.deviceId}`;
            if (args.operation === "enable")
                cmds.push(`${base} up`);
            if (args.operation === "disable")
                cmds.push(`${base} down`);
            if (args.operation === "restart")
                cmds.push(`${base} down`, `${base} up`);
        }
        try {
            for (const c of cmds) {
                yield executeShellCommand(c);
            }
            return `Device ${args.deviceId} ${args.operation}d.`;
        }
        catch (error) {
            return `Failed to ${args.operation} ${args.deviceId}: ${error.message}`;
        }
    });
}
export const getInstalledSoftwareTool = {
    type: "function",
    function: {
        name: "getInstalledSoftware",
        description: "Lists installed software packages on the system. This is a conceptual tool as the method varies greatly by operating system.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
};
export function executeGetInstalledSoftwareTool() {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = "wmic product get name,version";
        }
        else if (os.platform() === "linux") {
            command = "dpkg -l | grep ^ii || rpm -qa"; // Debian/Ubuntu or RedHat/CentOS
        }
        else if (os.platform() === "darwin") {
            command = "brew list || system_profiler SPApplicationsDataType";
        }
        else {
            return "Error: Listing installed software is not supported on this operating system.";
        }
        try {
            const output = yield executeShellCommand(command);
            return `Installed Software:\n${output}`;
        }
        catch (error) {
            return `Error listing installed software: ${error.message}`;
        }
    });
}
export const getSystemLogsTool = {
    type: "function",
    function: {
        name: "getSystemLogs",
        description: "Retrieves system logs. This is a conceptual tool as log locations and commands vary by OS.",
        parameters: {
            type: "object",
            properties: {
                logType: {
                    type: "string",
                    description: "The type of logs to retrieve (e.g., 'syslog', 'auth.log', 'eventlog').",
                },
                lines: {
                    type: "number",
                    description: "Optional: Number of recent lines to retrieve. Defaults to 100.",
                    nullable: true,
                },
            },
            required: ["logType"],
        },
    },
};
export function executeGetSystemLogsTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const numLines = args.lines || 100;
        let command;
        if (os.platform() === "win32") {
            command = `wevtutil qe ${args.logType} /c:${numLines} /f:text`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `tail -n ${numLines} /var/log/${args.logType}`;
        }
        else {
            return "Error: Retrieving system logs is not supported on this operating system.";
        }
        try {
            const output = yield executeShellCommand(command);
            return `System Logs (${args.logType}):\n${output}`;
        }
        catch (error) {
            return `Error retrieving system logs: ${error.message}`;
        }
    });
}
