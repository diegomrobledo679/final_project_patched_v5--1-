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
import * as os from "os";
import * as dns from "dns";
export const pingTool = {
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
export function executePingTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            var _a;
            let command;
            const count = (_a = args.count) !== null && _a !== void 0 ? _a : 4;
            if (os.platform() === 'win32') {
                command = `ping -n ${count} ${args.host}`;
            }
            else {
                command = `ping -c ${count} ${args.host}`;
            }
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error pinging host ${args.host}: ${stderr || error.message}`);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    });
}
export const tracerouteTool = {
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
export function executeTracerouteTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let command;
            if (os.platform() === 'win32') {
                command = `tracert ${args.host}`;
            }
            else {
                command = `traceroute ${args.host}`;
            }
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error tracing route to host ${args.host}: ${stderr || error.message}`);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    });
}
export const dnsLookupTool = {
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
export function executeDnsLookupTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            dns.resolve(args.hostname, args.recordType || 'A', (err, records) => {
                if (err) {
                    reject(`DNS lookup failed for ${args.hostname} (${args.recordType || 'A'}): ${err.message}`);
                }
                else {
                    resolve(`DNS records for ${args.hostname} (${args.recordType || 'A'}):\n${JSON.stringify(records, null, 2)}`);
                }
            });
        });
    });
}
