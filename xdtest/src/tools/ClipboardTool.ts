
import { Tool } from "../core/types.js";
import * as os from "os";
import { executeShellCommand } from "../utils/command.js";

const readClipboardToolDefinition: Tool = {
  type: "function",
  function: {
    name: "readClipboard",
    description: "Reads the current content of the system clipboard.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

async function executeReadClipboardToolFunction(): Promise<string> {
  let command: string;
  if (os.platform() === 'darwin') {
    command = 'pbpaste';
  } else if (os.platform() === 'win32') {
    command = 'powershell.exe -command "Get-Clipboard" ';
  } else if (os.platform() === 'linux') {
    command = 'xclip -o -selection clipboard'; // Requires xclip to be installed
  } else {
    return "Error: Reading clipboard is not supported on this operating system.";
  }
  return executeShellCommand(command);
}

const writeClipboardToolDefinition: Tool = {
  type: "function",
  function: {
    name: "writeClipboard",
    description: "Writes content to the system clipboard.",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The text content to write to the clipboard.",
        },
      },
      required: ["content"],
    },
  },
};

async function executeWriteClipboardToolFunction(args: { content: string }): Promise<string> {
  let command: string;
  if (os.platform() === 'darwin') {
    command = `echo "${args.content}" | pbcopy`;
  } else if (os.platform() === 'win32') {
    command = `powershell.exe -command "Set-Clipboard -Value \"${args.content}\""`;
  } else if (os.platform() === 'linux') {
    command = `echo "${args.content}" | xclip -i -selection clipboard`; // Requires xclip to be installed
  } else {
    return "Error: Writing to clipboard is not supported on this operating system.";
  }
  return executeShellCommand(command);
}

export { readClipboardToolDefinition as readClipboardTool, executeReadClipboardToolFunction as executeReadClipboardTool, writeClipboardToolDefinition as writeClipboardTool, executeWriteClipboardToolFunction as executeWriteClipboardTool };
