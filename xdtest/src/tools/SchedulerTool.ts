

import { Tool } from "../core/types.js";
import * as os from "os";
import { executeShellCommand, commandExists, shellEscape } from "../utils/command.js";

export const createScheduledTaskTool: Tool = {
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

export async function executeCreateScheduledTaskTool(args: { name: string; command: string; schedule: string }): Promise<string> {
  let cmd: string;
  if (os.platform() === "linux" || os.platform() === "darwin") {
    if (!(await commandExists("crontab"))) {
      return "crontab not found. Please install cron.";
    }
    if (/[:;&|]/.test(args.schedule)) {
      return "Invalid characters in schedule string.";
    }
    const safeCmd = shellEscape(args.command);
    const entry = `${args.schedule} ${safeCmd} # ${args.name}`;
    const safeEntry = entry.replace(/"/g, '\"');
    cmd = `(crontab -l 2>/dev/null | grep -v -F '# ${args.name}' ; echo "${safeEntry}") | crontab -`;
  } else if (os.platform() === 'win32') {
    if (!(await commandExists("schtasks"))) {
      return "schtasks not found. This tool requires Windows Task Scheduler.";
    }
    // Parse schedule like "DAILY 09:00" or just "09:00" for daily
    const parts = args.schedule.trim().split(/\s+/);
    let sc = parts[0];
    let st: string | undefined;
    let sd: string | undefined;
    if (/^\d{1,2}:\d{2}$/.test(sc)) {
      st = sc;
      sc = "DAILY";
    } else {
      sc = sc.toUpperCase();
      st = parts[1];
      sd = parts[2];
    }
    if (sc.match(/[^A-Z]/)) return "Invalid schedule type";
    if (st && !/^\d{1,2}:\d{2}$/.test(st)) return "Invalid start time";
    const safeName = shellEscape(args.name);
    const safeCommand = shellEscape(args.command);
    cmd = `schtasks /create /tn ${safeName} /tr ${safeCommand} /sc ${sc}`;
    if (st) cmd += ` /st ${st}`;
    if (sd) {
      if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(sd)) return "Invalid start date";
      cmd += ` /sd ${sd}`;
    }
  } else {
    return "Error: Scheduled tasks are not supported on this operating system.";
  }
  await executeShellCommand(cmd);
  return "Scheduled task created.";
}

export const listScheduledTasksTool: Tool = {
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

export async function executeListScheduledTasksTool(): Promise<string> {
  let cmd: string;
  if (os.platform() === 'linux' || os.platform() === 'darwin') {
    if (!(await commandExists('crontab'))) {
      return 'crontab not found. Please install cron.';
    }
    cmd = `crontab -l`;
  } else if (os.platform() === 'win32') {
    if (!(await commandExists('schtasks'))) {
      return 'schtasks not found. This tool requires Windows Task Scheduler.';
    }
    cmd = `schtasks /query /fo LIST /v`;
  } else {
    return "Error: Listing scheduled tasks is not supported on this operating system.";
  }
  try {
    const output = await executeShellCommand(cmd);
    return output.trim() || "No scheduled tasks found.";
  } catch (error: any) {
    return `Error listing scheduled tasks: ${error.message}`;
  }
}

export const deleteScheduledTaskTool: Tool = {
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

export async function executeDeleteScheduledTaskTool(args: { name: string }): Promise<string> {
  let cmd: string;
  if (os.platform() === 'linux' || os.platform() === 'darwin') {
    if (!(await commandExists('crontab'))) {
      return 'crontab not found. Please install cron.';
    }
    // Remove lines containing the identifier comment added during creation
    cmd = `crontab -l | grep -v -F '# ${args.name}' | crontab -`;
  } else if (os.platform() === 'win32') {
    if (!(await commandExists('schtasks'))) {
      return 'schtasks not found. This tool requires Windows Task Scheduler.';
    }
    const safeName = shellEscape(args.name);
    cmd = `schtasks /delete /tn ${safeName} /f`; // /f to force delete
  }
  else {
    return "Error: Deleting scheduled tasks is not supported on this operating system.";
  }
  await executeShellCommand(cmd);
  return "Scheduled task deleted.";
}

