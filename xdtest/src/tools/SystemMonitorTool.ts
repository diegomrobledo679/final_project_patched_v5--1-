
import { Tool } from "../core/types.js";
import * as os from "os";
import { executeShellCommand } from "../utils/command.js";

export const getDiskUsageTool: Tool = {
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

export async function executeGetDiskUsageTool(args: { path?: string }): Promise<string> {
  let command: string;
  if (os.platform() === 'win32') {
    command = `wmic logicaldisk get Caption,FreeSpace,Size /value`;
  } else {
    command = `df -h ${args.path || ''}`;
  }
  return executeShellCommand(command);
}

export const getMemoryUsageTool: Tool = {
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

export async function executeGetMemoryUsageTool(): Promise<string> {
  let command: string;
  if (os.platform() === 'win32') {
    command = `wmic ComputerSystem get TotalPhysicalMemory /value && wmic OS get FreePhysicalMemory /value`;
  } else {
    command = `free -h`;
  }
  return executeShellCommand(command);
}

export const getDetailedCpuUsageTool: Tool = {
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

export async function executeGetDetailedCpuUsageTool(): Promise<string> {
  let command: string;
  if (os.platform() === 'win32') {
    command = `wmic cpu get LoadPercentage /value`;
  } else {
    command = `top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1}'`; // Linux CPU usage
  }
  try {
    const output = await executeShellCommand(command);
    let result = `CPU Load Average: ${os.loadavg().map(l => l.toFixed(2)).join(', ')}\n`;
    result += `Per-CPU Information:\n`;
    os.cpus().forEach((cpu, index) => {
      result += `  CPU ${index}: Model: ${cpu.model}, Speed: ${cpu.speed}MHz\n`;
    });
    result += `Current CPU Usage: ${output.trim()}%`;
    return result;
  } catch (error: any) {
    return `Error getting detailed CPU usage: ${error.message}`;
  }
}
