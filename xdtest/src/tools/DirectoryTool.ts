import { Tool } from "../core/types.js";
import * as fs from "fs";
import * as path from "path";

export const listDirectoryTool: Tool = {
  type: "function",
  function: {
    name: "listDirectory",
    description: "Lists the contents of a specified directory.",
    parameters: {
      type: "object",
      properties: {
        directoryPath: {
          type: "string",
          description: "The path to the directory to list.",
        },
      },
      required: ["directoryPath"],
    },
  },
};

export async function executeListDirectoryTool(args: { directoryPath: string }): Promise<string> {
  try {
    const files = fs.readdirSync(args.directoryPath);
    let output = `Contents of ${args.directoryPath}:\n`;
    files.forEach(file => {
      const fullPath = path.join(args.directoryPath, file);
      const stats = fs.statSync(fullPath);
      output += `- ${file} (${stats.isDirectory() ? 'directory' : 'file'})\n`;
    });
    return output;
  } catch (error: any) {
    return `Error listing directory: ${error.message}`;
  }
}
