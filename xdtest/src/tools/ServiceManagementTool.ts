import { Tool } from "../core/types.js";
import * as os from "os";
import { executeShellCommand } from "../utils/command.js";
export const startServiceTool: Tool = {
  type: "function",
  function: {
    name: "startService",
    description: "Starts a system service. Requires appropriate permissions.",
    parameters: {
      type: "object",
      properties: {
        serviceName: {
          type: "string",
          description: "The name of the service to start.",
        },
      },
      required: ["serviceName"],
    },
  },
};
export async function executeStartServiceTool(args: {
  serviceName: string;
}): Promise<string> {
  let command: string;
  if (os.platform() === "win32") {
    command = `net start "${args.serviceName}"`;
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    command = `sudo systemctl start ${args.serviceName} || sudo service ${args.serviceName} start`;
  } else {
    return "Error: Service management is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
export const stopServiceTool: Tool = {
  type: "function",
  function: {
    name: "stopService",
    description: "Stops a system service. Requires appropriate permissions.",
    parameters: {
      type: "object",
      properties: {
        serviceName: {
          type: "string",
          description: "The name of the service to stop.",
        },
      },
      required: ["serviceName"],
    },
  },
};
export async function executeStopServiceTool(args: {
  serviceName: string;
}): Promise<string> {
  let command: string;
  if (os.platform() === "win32") {
    command = `net stop "${args.serviceName}"`;
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    command = `sudo systemctl stop ${args.serviceName} || sudo service ${args.serviceName} stop`;
  } else {
    return "Error: Service management is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
export const restartServiceTool: Tool = {
  type: "function",
  function: {
    name: "restartService",
    description: "Restarts a system service. Requires appropriate permissions.",
    parameters: {
      type: "object",
      properties: {
        serviceName: {
          type: "string",
          description: "The name of the service to restart.",
        },
      },
      required: ["serviceName"],
    },
  },
};
export async function executeRestartServiceTool(args: {
  serviceName: string;
}): Promise<string> {
  let command: string;
  if (os.platform() === "win32") {
    command = `net stop "${args.serviceName}" && net start "${args.serviceName}"`;
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    command = `sudo systemctl restart ${args.serviceName} || sudo service ${args.serviceName} restart`;
  } else {
    return "Error: Service management is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
export const getServiceStatusTool: Tool = {
  type: "function",
  function: {
    name: "getServiceStatus",
    description:
      "Gets the status of a system service. Requires appropriate permissions.",
    parameters: {
      type: "object",
      properties: {
        serviceName: {
          type: "string",
          description: "The name of the service to get status for.",
        },
      },
      required: ["serviceName"],
    },
  },
};
export async function executeGetServiceStatusTool(args: {
  serviceName: string;
}): Promise<string> {
  let command: string;
  if (os.platform() === "win32") {
    command = `sc query "${args.serviceName}"`;
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    command = `sudo systemctl status ${args.serviceName} || sudo service ${args.serviceName} status`;
  } else {
    return "Error: Service management is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
