var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { exec } from "child_process";
import fs from "fs";
import os from "os";
export const openPathTool = {
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
export function executeOpenPathTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
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
                if (err)
                    resolve(`Failed to open path: ${err.message}`);
                else
                    resolve(`Opened ${args.path}`);
            });
        });
    });
}
