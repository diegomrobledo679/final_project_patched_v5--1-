var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as net from "net";
export const checkPortTool = {
    type: "function",
    function: {
        name: "checkPort",
        description: "Checks if a specific port is open on a given host.",
        parameters: {
            type: "object",
            properties: {
                host: {
                    type: "string",
                    description: "The hostname or IP address to check.",
                },
                port: {
                    type: "number",
                    description: "The port number to check.",
                },
                timeout: {
                    type: "number",
                    description: "Optional: Connection timeout in milliseconds. Defaults to 1000ms.",
                    nullable: true,
                },
            },
            required: ["host", "port"],
        },
    },
};
export function executeCheckPortTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            const timeout = args.timeout || 1000; // Default to 1 second
            socket.setTimeout(timeout);
            socket.once('connect', () => {
                socket.destroy();
                resolve(`Port ${args.port} on ${args.host} is open.`);
            });
            socket.once('timeout', () => {
                socket.destroy();
                resolve(`Port ${args.port} on ${args.host} is closed (timeout).`);
            });
            socket.once('error', (err) => {
                socket.destroy();
                resolve(`Port ${args.port} on ${args.host} is closed (error: ${err.message}).`);
            });
            socket.connect(args.port, args.host);
        });
    });
}
