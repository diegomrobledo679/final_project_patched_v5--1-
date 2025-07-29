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
export const getDiskUsageTool = {
    type: "function",
    function: {
        name: "getDiskUsage",
        description: "Retrieves disk usage information for the system or a specific path.",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "Optional: The path to check disk usage for. Defaults to the root filesystem.",
                    nullable: true,
                },
            },
            required: [],
        },
    },
};
export function executeGetDiskUsageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === 'win32') {
            command = `wmic logicaldisk get Caption,FreeSpace,Size /value`;
        }
        else {
            command = `df -h ${args.path || ''}`;
        }
        return executeShellCommand(command);
    });
}
export const getMemoryUsageTool = {
    type: "function",
    function: {
        name: "getMemoryUsage",
        description: "Retrieves detailed memory usage information for the system.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
};
export function executeGetMemoryUsageTool() {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === 'win32') {
            command = `wmic ComputerSystem get TotalPhysicalMemory /value && wmic OS get FreePhysicalMemory /value`;
        }
        else {
            command = `free -h`;
        }
        return executeShellCommand(command);
    });
}
export const getDetailedCpuUsageTool = {
    type: "function",
    function: {
        name: "getDetailedCpuUsage",
        description: "Retrieves detailed CPU usage information, including load averages and per-core usage.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
};
export function executeGetDetailedCpuUsageTool() {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === 'win32') {
            command = `wmic cpu get LoadPercentage /value`;
        }
        else {
            command = `top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1}'`; // Linux CPU usage
        }
        try {
            const output = yield executeShellCommand(command);
            let result = `CPU Load Average: ${os.loadavg().map(l => l.toFixed(2)).join(', ')}\n`;
            result += `Per-CPU Information:\n`;
            os.cpus().forEach((cpu, index) => {
                result += `  CPU ${index}: Model: ${cpu.model}, Speed: ${cpu.speed}MHz\n`;
            });
            result += `Current CPU Usage: ${output.trim()}%`;
            return result;
        }
        catch (error) {
            return `Error getting detailed CPU usage: ${error.message}`;
        }
    });
}
