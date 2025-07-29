import { Tool } from "../core/types.js";
import { exec } from "child_process";
import fs from "fs";
import os from "os";

export const openPathTool: Tool = {
  type: "function",
  function: {
    name: "openPath",
    description: "Opens a file or folder in the default application or file explorer.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to file or folder" }
      },
      required: ["path"]
    }
  }
};

export async function executeOpenPathTool(args: { path: string }): Promise<string> {
  if (!fs.existsSync(args.path)) {
    return `Path not found: ${args.path}`;
  }
  if (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true') {
    return `Opened ${args.path}`;
  }
  const cmd = os.platform() === 'win32'
    ? `start "" "${args.path}"`
    : os.platform() === 'darwin'
    ? `open "${args.path}"`
    : `xdg-open "${args.path}"`;

  return new Promise(resolve => {
    exec(cmd, err => {
      if (err) resolve(`Failed to open path: ${err.message}`);
      else resolve(`Opened ${args.path}`);
    });
  });
}
