
import { Tool } from "../core/types.js";
import * as net from "net";

export const checkPortTool: Tool = {
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

export async function executeCheckPortTool(args: { host: string; port: number; timeout?: number }): Promise<string> {
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

    socket.once('error', (err: any) => {
      socket.destroy();
      resolve(`Port ${args.port} on ${args.host} is closed (error: ${err.message}).`);
    });

    socket.connect(args.port, args.host);
  });
}
