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
export const changeFilePermissionsTool = {
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
export function executeChangeFilePermissionsTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            fs.chmodSync(args.filePath, args.mode);
            return `Permissions of ${args.filePath} changed to ${args.mode.toString(8)}.`;
        }
        catch (error) {
            return `Error changing file permissions: ${error.message}`;
        }
    });
}
