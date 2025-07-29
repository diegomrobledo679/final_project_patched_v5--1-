
import { Tool } from "../core/types.js";
import { exec, spawn } from "child_process";
import pty from "node-pty";
import os from "os";

export const launchUITool: Tool = {
  type: "function",
  function: {
    name: "launchUI",
    description: "Launches a graphical user interface for the interpreter. This is a conceptual tool. A real implementation would require a separate UI application (e.g., a web app, desktop app) to be running and integrated. This function would typically send a signal or open a browser to that UI.",
    parameters: {
      type: "object",
      properties: {
        uiName: {
          type: "string",
          description: "The name or identifier of the UI to launch (e.g., 'cyrah').",
        },
        url: {
          type: "string",
          description: "Optional: The URL of the UI to open if it's a web-based interface.",
          nullable: true,
        },
      },
      required: ["uiName"],
    },
  },
};

export async function executeLaunchUITool(args: { uiName: string; url?: string }): Promise<string> {
  const baseUrl = process.env.UI_BASE_URL || 'http://localhost:3000';
  const url = args.url || `${baseUrl}/${args.uiName}`;
  const openCmd = os.platform() === 'win32'
    ? `start "" "${url}"`
    : os.platform() === 'darwin'
    ? `open "${url}"`
    : `xdg-open "${url}"`;

  return new Promise<string>((resolve) => {
    exec(openCmd, (error) => {
      if (error) {
        resolve(`Failed to launch UI ${args.uiName}: ${error.message}`);
      } else {
        resolve(`Launched UI ${args.uiName} at ${url}`);
      }
    });
  });
}

export const launchVirtualTerminalTool: Tool = {
  type: "function",
  function: {
    name: "launchVirtualTerminal",
    description: "Launches an ultra-fast virtual terminal, providing a highly responsive and interactive command-line environment. This is a conceptual tool. A real implementation would involve integrating a specialized terminal emulation library (e.g., xterm.js, libvterm) and potentially a backend process for efficient command execution and output streaming.",
    parameters: {
      type: "object",
      properties: {
        terminalName: {
          type: "string",
          description: "The name or identifier for the virtual terminal instance.",
        },
        initialCommand: {
          type: "string",
          description: "Optional: A command to execute immediately upon launching the virtual terminal.",
          nullable: true,
        },
      },
      required: ["terminalName"],
    },
  },
};

export async function executeLaunchVirtualTerminalTool(args: { terminalName: string; initialCommand?: string }): Promise<string> {
  const shell = os.platform() === 'win32' ? 'cmd.exe' : process.env.SHELL || 'bash';
  try {
    const ptyProcess = pty.spawn(shell, [], {
      name: args.terminalName,
      cols: process.stdout.columns || 80,
      rows: process.stdout.rows || 24,
      cwd: process.cwd(),
      env: process.env as any,
    });

    ptyProcess.onData(data => process.stdout.write(data));

    process.stdin.setRawMode?.(true);
    const inputListener = (data: Buffer) => ptyProcess.write(data.toString());
    process.stdin.on('data', inputListener);

    if (args.initialCommand) {
      ptyProcess.write(args.initialCommand + '\n');
    }

    return new Promise(resolve => {
      ptyProcess.onExit(() => {
        process.stdin.setRawMode?.(false);
        process.stdin.off('data', inputListener);
        resolve(`Virtual terminal "${args.terminalName}" session ended.`);
      });
    });
  } catch (error: any) {
    // Fallback to a plain shell if node-pty fails
    return new Promise(resolve => {
      const child = spawn(shell, { stdio: 'inherit' });
      if (args.initialCommand && child.stdin) {
        child.stdin.write(args.initialCommand + '\n');
      }
      child.on('exit', () => {
        resolve(`Terminal "${args.terminalName}" session ended.`);
      });
    });
  }
}

export const playSpotifyTool: Tool = {
  type: "function",
  function: {
    name: "playSpotify",
    description: "Opens a Spotify URI or URL in the default application.",
    parameters: {
      type: "object",
      properties: {
        uri: {
          type: "string",
          description: "Spotify URI or URL to open",
        },
      },
      required: ["uri"],
    },
  },
};

export async function executePlaySpotifyTool(args: { uri: string }): Promise<string> {
  const openCmd = os.platform() === 'win32'
    ? `start "" "${args.uri}"`
    : os.platform() === 'darwin'
    ? `open "${args.uri}"`
    : `xdg-open "${args.uri}"`;

  return new Promise<string>((resolve) => {
    exec(openCmd, (error) => {
      if (error) {
        resolve(`Failed to open Spotify URI: ${error.message}`);
      } else {
        resolve(`Opened Spotify URI ${args.uri}`);
      }
    });
  });
}
