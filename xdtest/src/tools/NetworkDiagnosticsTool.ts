import { Tool } from "../core/types.js";
import * as os from "os";
import { executeShellCommand } from "../utils/command.js";
export const checkNetworkConnectivityTool: Tool = {
  type: "function",
  function: {
    name: "checkNetworkConnectivity",
    description:
      "Performs basic network diagnostics including ping, DNS lookup, and traceroute.",
    parameters: {
      type: "object",
      properties: {
        targetHost: {
          type: "string",
          description:
            "Optional: The host to check connectivity to. Defaults to 'google.com'.",
          nullable: true,
        },
      },
      required: [],
    },
  },
};
export async function executeCheckNetworkConnectivityTool(args: {
  targetHost?: string;
}): Promise<string> {
  const target = args.targetHost || "google.com";
  const pingCmd =
    os.platform() === "win32" ? `ping -n 4 ${target}` : `ping -c 4 ${target}`;
  const nsCmd = `nslookup ${target}`;
  const traceCmd =
    os.platform() === "win32"
      ? `tracert -d ${target}`
      : `traceroute ${target}`;
  try {
    const pingOutput = await executeShellCommand(pingCmd);
    const nsOutput = await executeShellCommand(nsCmd);
    const traceOutput = await executeShellCommand(traceCmd);
    return [
      `Network diagnostics for ${target}:`,
      "--- PING ---",
      pingOutput.trim(),
      "--- DNS LOOKUP ---",
      nsOutput.trim(),
      "--- TRACEROUTE ---",
      traceOutput.trim(),
    ].join("\n");
  } catch (error: any) {
    return `Error performing network diagnostics: ${error.message}`;
  }
}
export const performNetworkSpeedTestTool: Tool = {
  type: "function",
  function: {
    name: "performNetworkSpeedTest",
    description:
      "Runs a simple network speed test using 'speedtest-cli' if available, falling back to a curl based test.",
    parameters: { type: "object", properties: {}, required: [] },
  },
};
export async function executePerformNetworkSpeedTestTool(): Promise<string> {
  try {
    const output = await executeShellCommand("speedtest-cli --simple");
    return output.trim();
  } catch {
    const curlCmd =
      "curl -o /dev/null -s -w 'Download speed: %{speed_download}\n' https://speed.hetzner.de/1MB.bin";
    try {
      const output = await executeShellCommand(curlCmd);
      return output.trim();
    } catch (error: any) {
      return `Error performing speed test: ${error.message}`;
    }
  }
}
