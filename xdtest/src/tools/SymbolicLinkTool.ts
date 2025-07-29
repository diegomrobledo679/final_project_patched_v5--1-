
import { Tool } from "../core/types.js";
import * as fs from "fs";
import * as path from "path";

export const createSymbolicLinkTool: Tool = {
  type: "function",
  function: {
    name: "createSymbolicLink",
    description: "Creates a symbolic link (symlink) from a target path to a new path.",
    parameters: {
      type: "object",
      properties: {
        targetPath: {
          type: "string",
          description: "The path to the existing file or directory that the symlink will point to.",
        },
        linkPath: {
          type: "string",
          description: "The path where the new symbolic link will be created.",
        },
        type: {
          type: "string",
          enum: ["file", "dir", "junction"],
          description: "Optional: The type of symlink to create. 'file' for files, 'dir' for directories. 'junction' is Windows-only for directories. Defaults to 'file'.",
          nullable: true,
        },
      },
      required: ["targetPath", "linkPath"],
    },
  },
};

export async function executeCreateSymbolicLinkTool(args: { targetPath: string; linkPath: string; type?: 'file' | 'dir' | 'junction' }): Promise<string> {
  try {
    fs.symlinkSync(args.targetPath, args.linkPath, args.type);
    return `Symbolic link created from ${args.targetPath} to ${args.linkPath}`;
  } catch (error: any) {
    return `Error creating symbolic link: ${error.message}`;
  }
}

export const readSymbolicLinkTool: Tool = {
  type: "function",
  function: {
    name: "readSymbolicLink",
    description: "Reads the target path of a symbolic link.",
    parameters: {
      type: "object",
      properties: {
        linkPath: {
          type: "string",
          description: "The path to the symbolic link.",
        },
      },
      required: ["linkPath"],
    },
  },
};

export async function executeReadSymbolicLinkTool(args: { linkPath: string }): Promise<string> {
  try {
    const target = fs.readlinkSync(args.linkPath);
    return `Symbolic link ${args.linkPath} points to ${target}`;
  } catch (error: any) {
    return `Error reading symbolic link: ${error.message}`;
  }
}

export const deleteSymbolicLinkTool: Tool = {
  type: "function",
  function: {
    name: "deleteSymbolicLink",
    description: "Deletes a symbolic link.",
    parameters: {
      type: "object",
      properties: {
        linkPath: {
          type: "string",
          description: "The path to the symbolic link to delete.",
        },
      },
      required: ["linkPath"],
    },
  },
};

export async function executeDeleteSymbolicLinkTool(args: { linkPath: string }): Promise<string> {
  try {
    fs.unlinkSync(args.linkPath);
    return `Symbolic link ${args.linkPath} deleted.`;
  } catch (error: any) {
    return `Error deleting symbolic link: ${error.message}`;
  }
}
