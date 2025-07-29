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
import os from "os";
export const openUrlTool = {
    type: "function",
    function: {
        name: "openUrl",
        description: "Opens a URL in the default browser using the OS open command.",
        parameters: {
            type: "object",
            properties: {
                url: { type: "string", description: "The URL to open" }
            },
            required: ["url"],
        },
    },
};
export function executeOpenUrlTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true') {
            return `Opened ${args.url}`;
        }
        const cmd = os.platform() === 'win32'
            ? `start "" "${args.url}"`
            : os.platform() === 'darwin'
                ? `open "${args.url}"`
                : `xdg-open "${args.url}"`;
        return new Promise((resolve) => {
            exec(cmd, (err) => {
                if (err)
                    resolve(`Failed to open URL: ${err.message}`);
                else
                    resolve(`Opened ${args.url}`);
            });
        });
    });
}
