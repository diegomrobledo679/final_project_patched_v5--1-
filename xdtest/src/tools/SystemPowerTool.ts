import { Tool } from "../core/types.js";
import * as os from "os";
import { executeShellCommand } from "../utils/command.js";

export const rebootSystemTool: Tool = {
  type: "function",
  function: {
    name: "rebootSystem",
    description: "Reboots the system. Requires appropriate permissions. Use with extreme caution.",
    parameters: {
      type: "object",
      properties: {
        force: {
          type: "boolean",
          description: "Optional: Force reboot without warning. Defaults to false.",
          nullable: true,
        },
      },
      required: [],
    },
  },
};

export async function executeRebootSystemTool(args: { force?: boolean }): Promise<string> {
  let command: string;
  if (os.platform() === 'win32') {
    command = `shutdown /r /t 0 ${args.force ? '/f' : ''}`;
  } else if (os.platform() === 'linux' || os.platform() === 'darwin') {
    command = `sudo reboot ${args.force ? '-f' : ''}`;
  } else {
    return "Error: System reboot is not supported on this operating system.";
  }
  return executeShellCommand(command);
}

export const shutdownSystemTool: Tool = {
  type: "function",
  function: {
    name: "shutdownSystem",
    description: "Shuts down the system. Requires appropriate permissions. Use with extreme caution.",
    parameters: {
      type: "object",
      properties: {
        force: {
          type: "boolean",
          description: "Optional: Force shutdown without warning. Defaults to false.",
          nullable: true,
        },
      },
      required: [],
    },
  },
};

export async function executeShutdownSystemTool(args: { force?: boolean }): Promise<string> {
  let command: string;
  if (os.platform() === 'win32') {
    command = `shutdown /s /t 0 ${args.force ? '/f' : ''}`;
  } else if (os.platform() === 'linux' || os.platform() === 'darwin') {
    command = `sudo shutdown -h now ${args.force ? '-f' : ''}`;
  } else {
    return "Error: System shutdown is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
