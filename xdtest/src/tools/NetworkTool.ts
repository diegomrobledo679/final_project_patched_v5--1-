import { Tool } from "../core/types.js";
import { exec } from "child_process";
import * as os from "os";
import * as dns from "dns";

export const pingTool: Tool = {
  type: "function",
  function: {
    name: "ping",
    description: "Pings a host and returns the output.",
    parameters: {
      type: "object",
      properties: {
        host: {
          type: "string",
          description: "The host to ping (e.g., 'google.com' or '192.168.1.1').",
        },
        count: {
          type: "number",
          description: "Number of echo requests to send. Defaults to 4.",
          default: 4,
        },
      },
      required: ["host"],
    },
  },
};

export async function executePingTool(args: { host: string; count?: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    let command: string;
    const count = args.count ?? 4;
    if (os.platform() === 'win32') {
      command = `ping -n ${count} ${args.host}`;
    } else {
      command = `ping -c ${count} ${args.host}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error pinging host ${args.host}: ${stderr || error.message}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

export const tracerouteTool: Tool = {
  type: "function",
  function: {
    name: "traceroute",
    description: "Traces the route packets take to a network host.",
    parameters: {
      type: "object",
      properties: {
        host: {
          type: "string",
          description: "The host to trace (e.g., 'google.com').",
        },
      },
      required: ["host"],
    },
  },
};

export async function executeTracerouteTool(args: { host: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    let command: string;
    if (os.platform() === 'win32') {
      command = `tracert ${args.host}`;
    } else {
      command = `traceroute ${args.host}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error tracing route to host ${args.host}: ${stderr || error.message}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

export const dnsLookupTool: Tool = {
  type: "function",
  function: {
    name: "dnsLookup",
    description: "Performs a DNS lookup for a given hostname and record type.",
    parameters: {
      type: "object",
      properties: {
        hostname: {
          type: "string",
          description: "The hostname to look up (e.g., 'google.com').",
        },
        recordType: {
          type: "string",
          enum: ["A", "AAAA", "CNAME", "MX", "NS", "PTR", "SOA", "SRV", "TXT"],
          description: "The type of DNS record to query. Defaults to 'A' (IPv4 address).",
          default: "A",
        },
      },
      required: ["hostname"],
    },
  },
};

export async function executeDnsLookupTool(args: { hostname: string; recordType?: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.resolve(args.hostname, args.recordType || 'A', (err, records) => {
      if (err) {
        reject(`DNS lookup failed for ${args.hostname} (${args.recordType || 'A'}): ${err.message}`);
      } else {
        resolve(`DNS records for ${args.hostname} (${args.recordType || 'A'}):\n${JSON.stringify(records, null, 2)}`);
      }
    });
  });
}
