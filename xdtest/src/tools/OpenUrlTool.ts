import { Tool } from "../core/types.js";
import { exec } from "child_process";
import os from "os";

export const openUrlTool: Tool = {
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

export async function executeOpenUrlTool(args: { url: string }): Promise<string> {
  if (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true') {
    return `Opened ${args.url}`;
  }
  const cmd = os.platform() === 'win32'
    ? `start "" "${args.url}"`
    : os.platform() === 'darwin'
    ? `open "${args.url}"`
    : `xdg-open "${args.url}"`;

  return new Promise<string>((resolve) => {
    exec(cmd, (err) => {
      if (err) resolve(`Failed to open URL: ${err.message}`);
      else resolve(`Opened ${args.url}`);
    });
  });
}
