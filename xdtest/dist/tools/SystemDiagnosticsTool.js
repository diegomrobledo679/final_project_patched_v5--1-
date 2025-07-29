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
import { executeShellCommand } from "../utils/command.js";
export const checkSystemHealthTool = {
    type: "function",
    function: {
        name: "checkSystemHealth",
        description: "Runs basic system health checks including disk, memory, CPU and network connectivity.",
        parameters: { type: "object", properties: {}, required: [] },
    },
};
export function executeCheckSystemHealthTool() {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        try {
            const disk = yield executeShellCommand("df -h");
            results.push("Disk Usage:\n" + disk.trim());
        }
        catch (err) {
            results.push(`Disk Usage: Error - ${err.message}`);
        }
        try {
            const memCmd = os.platform() === "win32"
                ? "wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value"
                : "free -h";
            const mem = yield executeShellCommand(memCmd);
            results.push("Memory Usage:\n" + mem.trim());
        }
        catch (err) {
            results.push(`Memory Usage: Error - ${err.message}`);
        }
        try {
            const cpuCmd = os.platform() === "win32" ? "wmic cpu get loadpercentage" : "uptime";
            const cpu = yield executeShellCommand(cpuCmd);
            results.push("CPU Load:\n" + cpu.trim());
        }
        catch (err) {
            results.push(`CPU Load: Error - ${err.message}`);
        }
        try {
            const pingCmd = os.platform() === "win32" ? "ping -n 2 google.com" : "ping -c 2 google.com";
            const ping = yield executeShellCommand(pingCmd);
            results.push("Network Connectivity:\n" + ping.trim());
        }
        catch (err) {
            results.push(`Network Connectivity: Error - ${err.message}`);
        }
        return results.join("\n\n");
    });
}
export const generateSystemReportTool = {
    type: "function",
    function: {
        name: "generateSystemReport",
        description: "Generates a system report of hardware, software or network configuration.",
        parameters: {
            type: "object",
            properties: {
                reportType: {
                    type: "string",
                    enum: ["full", "hardware", "software", "network"],
                    description: "The type of report to generate.",
                },
            },
            required: ["reportType"],
        },
    },
};
export function executeGenerateSystemReportTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const gather = (cmd) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield executeShellCommand(cmd);
            }
            catch (err) {
                return `Error executing '${cmd}': ${err.message}`;
            }
        });
        const sections = [];
        const includeHardware = args.reportType === "full" || args.reportType === "hardware";
        const includeSoftware = args.reportType === "full" || args.reportType === "software";
        const includeNetwork = args.reportType === "full" || args.reportType === "network";
        if (includeHardware) {
            const cpu = yield gather(os.platform() === "win32" ? "wmic cpu get name" : "lscpu");
            const disks = yield gather(os.platform() === "win32" ? "wmic logicaldisk get size,freespace,caption" : "lsblk");
            sections.push("# Hardware\n" + cpu.trim() + "\n" + disks.trim());
        }
        if (includeSoftware) {
            const osInfo = yield gather(os.platform() === "win32" ? "systeminfo" : "uname -a");
            sections.push("# Software\n" + osInfo.trim());
        }
        if (includeNetwork) {
            const ifconfigCmd = os.platform() === "win32" ? "ipconfig /all" : "ifconfig";
            const routesCmd = os.platform() === "win32" ? "route PRINT" : "netstat -rn";
            const netInfo = yield gather(ifconfigCmd);
            const routeInfo = yield gather(routesCmd);
            sections.push("# Network\n" + netInfo.trim() + "\n" + routeInfo.trim());
        }
        return sections.join("\n\n");
    });
}
export const troubleshootIssueTool = {
    type: "function",
    function: {
        name: "troubleshootIssue",
        description: "Provides simple troubleshooting suggestions for common issues.",
        parameters: {
            type: "object",
            properties: {
                issue: {
                    type: "string",
                    description: "A description of the issue to troubleshoot.",
                },
            },
            required: ["issue"],
        },
    },
};
export function executeTroubleshootIssueTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const issue = args.issue.toLowerCase();
        if (issue.includes("network")) {
            return executeCheckSystemHealthTool();
        }
        else if (issue.includes("disk") || issue.includes("space")) {
            try {
                const disk = yield executeShellCommand("df -h");
                return "Disk usage information:\n" + disk.trim();
            }
            catch (err) {
                return `Error gathering disk info: ${err.message}`;
            }
        }
        return `No automated troubleshooting available for issue: '${args.issue}'.`;
    });
}
