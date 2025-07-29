
import { Tool } from "../core/types.js";
import * as fs from "fs";

export const changeFilePermissionsTool: Tool = {
  type: "function",
  function: {
    name: "changeFilePermissions",
    description: "Changes the permissions of a file or directory (chmod equivalent).",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "The path to the file or directory.",
        },
        mode: {
          type: "number",
          description: "The numeric mode (e.g., 755 for rwxr-xr-x).",
        },
      },
      required: ["filePath", "mode"],
    },
  },
};

export async function executeChangeFilePermissionsTool(args: { filePath: string; mode: number }): Promise<string> {
  try {
    fs.chmodSync(args.filePath, args.mode);
    return `Permissions of ${args.filePath} changed to ${args.mode.toString(8)}.`;
  } catch (error: any) {
    return `Error changing file permissions: ${error.message}`;
  }
}
