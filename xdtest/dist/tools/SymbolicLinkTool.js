var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from "fs";
export const createSymbolicLinkTool = {
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
export function executeCreateSymbolicLinkTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            fs.symlinkSync(args.targetPath, args.linkPath, args.type);
            return `Symbolic link created from ${args.targetPath} to ${args.linkPath}`;
        }
        catch (error) {
            return `Error creating symbolic link: ${error.message}`;
        }
    });
}
export const readSymbolicLinkTool = {
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
export function executeReadSymbolicLinkTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const target = fs.readlinkSync(args.linkPath);
            return `Symbolic link ${args.linkPath} points to ${target}`;
        }
        catch (error) {
            return `Error reading symbolic link: ${error.message}`;
        }
    });
}
export const deleteSymbolicLinkTool = {
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
export function executeDeleteSymbolicLinkTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            fs.unlinkSync(args.linkPath);
            return `Symbolic link ${args.linkPath} deleted.`;
        }
        catch (error) {
            return `Error deleting symbolic link: ${error.message}`;
        }
    });
}
