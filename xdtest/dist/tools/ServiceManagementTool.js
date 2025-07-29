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
export const startServiceTool = {
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
export function executeStartServiceTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = `net start "${args.serviceName}"`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `sudo systemctl start ${args.serviceName} || sudo service ${args.serviceName} start`;
        }
        else {
            return "Error: Service management is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
export const stopServiceTool = {
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
export function executeStopServiceTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = `net stop "${args.serviceName}"`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `sudo systemctl stop ${args.serviceName} || sudo service ${args.serviceName} stop`;
        }
        else {
            return "Error: Service management is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
export const restartServiceTool = {
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
export function executeRestartServiceTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = `net stop "${args.serviceName}" && net start "${args.serviceName}"`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `sudo systemctl restart ${args.serviceName} || sudo service ${args.serviceName} restart`;
        }
        else {
            return "Error: Service management is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
export const getServiceStatusTool = {
    type: "function",
    function: {
        name: "getServiceStatus",
        description: "Gets the status of a system service. Requires appropriate permissions.",
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
export function executeGetServiceStatusTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = `sc query "${args.serviceName}"`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `sudo systemctl status ${args.serviceName} || sudo service ${args.serviceName} status`;
        }
        else {
            return "Error: Service management is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
