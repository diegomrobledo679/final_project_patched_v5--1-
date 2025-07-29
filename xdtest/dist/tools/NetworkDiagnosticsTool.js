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
export const checkNetworkConnectivityTool = {
    type: "function",
    function: {
        name: "checkNetworkConnectivity",
        description: "Performs basic network diagnostics including ping, DNS lookup, and traceroute.",
        parameters: {
            type: "object",
            properties: {
                targetHost: {
                    type: "string",
                    description: "Optional: The host to check connectivity to. Defaults to 'google.com'.",
                    nullable: true,
                },
            },
            required: [],
        },
    },
};
export function executeCheckNetworkConnectivityTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = args.targetHost || "google.com";
        const pingCmd = os.platform() === "win32" ? `ping -n 4 ${target}` : `ping -c 4 ${target}`;
        const nsCmd = `nslookup ${target}`;
        const traceCmd = os.platform() === "win32"
            ? `tracert -d ${target}`
            : `traceroute ${target}`;
        try {
            const pingOutput = yield executeShellCommand(pingCmd);
            const nsOutput = yield executeShellCommand(nsCmd);
            const traceOutput = yield executeShellCommand(traceCmd);
            return [
                `Network diagnostics for ${target}:`,
                "--- PING ---",
                pingOutput.trim(),
                "--- DNS LOOKUP ---",
                nsOutput.trim(),
                "--- TRACEROUTE ---",
                traceOutput.trim(),
            ].join("\n");
        }
        catch (error) {
            return `Error performing network diagnostics: ${error.message}`;
        }
    });
}
export const performNetworkSpeedTestTool = {
    type: "function",
    function: {
        name: "performNetworkSpeedTest",
        description: "Runs a simple network speed test using 'speedtest-cli' if available, falling back to a curl based test.",
        parameters: { type: "object", properties: {}, required: [] },
    },
};
export function executePerformNetworkSpeedTestTool() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const output = yield executeShellCommand("speedtest-cli --simple");
            return output.trim();
        }
        catch (_a) {
            const curlCmd = "curl -o /dev/null -s -w 'Download speed: %{speed_download}\n' https://speed.hetzner.de/1MB.bin";
            try {
                const output = yield executeShellCommand(curlCmd);
                return output.trim();
            }
            catch (error) {
                return `Error performing speed test: ${error.message}`;
            }
        }
    });
}
