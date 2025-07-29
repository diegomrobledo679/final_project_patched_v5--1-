var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as os from "os";
import { executeShellCommand } from "../utils/command.js";
export const rebootSystemTool = {
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
export function executeRebootSystemTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === 'win32') {
            command = `shutdown /r /t 0 ${args.force ? '/f' : ''}`;
        }
        else if (os.platform() === 'linux' || os.platform() === 'darwin') {
            command = `sudo reboot ${args.force ? '-f' : ''}`;
        }
        else {
            return "Error: System reboot is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
export const shutdownSystemTool = {
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
export function executeShutdownSystemTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === 'win32') {
            command = `shutdown /s /t 0 ${args.force ? '/f' : ''}`;
        }
        else if (os.platform() === 'linux' || os.platform() === 'darwin') {
            command = `sudo shutdown -h now ${args.force ? '-f' : ''}`;
        }
        else {
            return "Error: System shutdown is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
