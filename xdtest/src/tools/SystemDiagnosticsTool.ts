import { Tool } from "../core/types.js";
import * as os from "os";
import { executeShellCommand } from "../utils/command.js";
export const checkSystemHealthTool: Tool = {
  type: "function",
  function: {
    name: "checkSystemHealth",
    description:
      "Runs basic system health checks including disk, memory, CPU and network connectivity.",
    parameters: { type: "object", properties: {}, required: [] },
  },
};
export async function executeCheckSystemHealthTool(): Promise<string> {
  const results: string[] = [];
  try {
    const disk = await executeShellCommand("df -h");
    results.push("Disk Usage:\n" + disk.trim());
  } catch (err: any) {
    results.push(`Disk Usage: Error - ${err.message}`);
  }
  try {
    const memCmd =
      os.platform() === "win32"
        ? "wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value"
        : "free -h";
    const mem = await executeShellCommand(memCmd);
    results.push("Memory Usage:\n" + mem.trim());
  } catch (err: any) {
    results.push(`Memory Usage: Error - ${err.message}`);
  }
  try {
    const cpuCmd = os.platform() === "win32" ? "wmic cpu get loadpercentage" : "uptime";
    const cpu = await executeShellCommand(cpuCmd);
    results.push("CPU Load:\n" + cpu.trim());
  } catch (err: any) {
    results.push(`CPU Load: Error - ${err.message}`);
  }
  try {
    const pingCmd =
      os.platform() === "win32" ? "ping -n 2 google.com" : "ping -c 2 google.com";
    const ping = await executeShellCommand(pingCmd);
    results.push("Network Connectivity:\n" + ping.trim());
  } catch (err: any) {
    results.push(`Network Connectivity: Error - ${err.message}`);
  }
  return results.join("\n\n");
}
export const generateSystemReportTool: Tool = {
  type: "function",
  function: {
    name: "generateSystemReport",
    description:
      "Generates a system report of hardware, software or network configuration.",
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
export async function executeGenerateSystemReportTool(args: {
  reportType: "full" | "hardware" | "software" | "network";
}): Promise<string> {
  const gather = async (cmd: string) => {
    try {
      return await executeShellCommand(cmd);
    } catch (err: any) {
      return `Error executing '${cmd}': ${err.message}`;
    }
  };
  const sections: string[] = [];
  const includeHardware = args.reportType === "full" || args.reportType === "hardware";
  const includeSoftware = args.reportType === "full" || args.reportType === "software";
  const includeNetwork = args.reportType === "full" || args.reportType === "network";
  if (includeHardware) {
    const cpu = await gather(os.platform() === "win32" ? "wmic cpu get name" : "lscpu");
    const disks = await gather(os.platform() === "win32" ? "wmic logicaldisk get size,freespace,caption" : "lsblk");
    sections.push("# Hardware\n" + cpu.trim() + "\n" + disks.trim());
  }
  if (includeSoftware) {
    const osInfo = await gather(os.platform() === "win32" ? "systeminfo" : "uname -a");
    sections.push("# Software\n" + osInfo.trim());
  }
  if (includeNetwork) {
    const ifconfigCmd = os.platform() === "win32" ? "ipconfig /all" : "ifconfig";
    const routesCmd = os.platform() === "win32" ? "route PRINT" : "netstat -rn";
    const netInfo = await gather(ifconfigCmd);
    const routeInfo = await gather(routesCmd);
    sections.push("# Network\n" + netInfo.trim() + "\n" + routeInfo.trim());
  }
  return sections.join("\n\n");
}
export const troubleshootIssueTool: Tool = {
  type: "function",
  function: {
    name: "troubleshootIssue",
    description:
      "Provides simple troubleshooting suggestions for common issues.",
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
export async function executeTroubleshootIssueTool(args: {
  issue: string;
}): Promise<string> {
  const issue = args.issue.toLowerCase();
  if (issue.includes("network")) {
    return executeCheckSystemHealthTool();
  } else if (issue.includes("disk") || issue.includes("space")) {
    try {
      const disk = await executeShellCommand("df -h");
      return "Disk usage information:\n" + disk.trim();
    } catch (err: any) {
      return `Error gathering disk info: ${err.message}`;
    }
  }
  return `No automated troubleshooting available for issue: '${args.issue}'.`;
}
