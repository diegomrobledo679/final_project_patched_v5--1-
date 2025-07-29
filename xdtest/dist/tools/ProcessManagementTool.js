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
import { spawn } from "child_process";
import { executeShellCommand } from "../utils/command.js";
export const terminateProcessTool = {
    type: "function",
    function: {
        name: "terminateProcess",
        description: "Terminates a process by its Process ID (PID). Use with caution.",
        parameters: {
            type: "object",
            properties: {
                pid: {
                    type: "number",
                    description: "The Process ID (PID) of the process to terminate.",
                },
            },
            required: ["pid"],
        },
    },
};
export function executeTerminateProcessTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === 'win32') {
            command = `taskkill /PID ${args.pid} /F`; // /F to force terminate
        }
        else {
            command = `kill ${args.pid}`; // Default kill command
        }
        return executeShellCommand(command);
    });
}
export const startProcessTool = {
    type: "function",
    function: {
        name: "startProcess",
        description: "Starts a new process with the given command and arguments.",
        parameters: {
            type: "object",
            properties: {
                command: {
                    type: "string",
                    description: "The command to execute to start the process.",
                },
                args: {
                    type: "array",
                    items: { type: "string" },
                    description: "Optional: An array of string arguments for the command.",
                    nullable: true,
                },
                detached: {
                    type: "boolean",
                    description: "Optional: If true, the child process will be run independently of its parent process.",
                    nullable: true,
                },
            },
            required: ["command"],
        },
    },
};
export function executeStartProcessTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            var _a;
            const child = spawn(args.command, (_a = args.args) !== null && _a !== void 0 ? _a : [], { shell: true, detached: !!args.detached, stdio: args.detached ? 'ignore' : 'inherit' });
            child.on('error', (err) => reject(`Error starting process: ${err.message}`));
            if (args.detached) {
                child.unref();
                resolve(`Process started in background with PID ${child.pid}.`);
            }
            else {
                child.on('close', (code) => {
                    resolve(`Process exited with code ${code !== null && code !== void 0 ? code : 0}.`);
                });
            }
        });
    });
}
export const getProcessInfoTool = {
    type: "function",
    function: {
        name: "getProcessInfo",
        description: "Retrieves detailed information about a running process by its PID.",
        parameters: {
            type: "object",
            properties: {
                pid: {
                    type: "number",
                    description: "The Process ID (PID) of the process.",
                },
            },
            required: ["pid"],
        },
    },
};
export function executeGetProcessInfoTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === 'win32') {
            command = `tasklist /FI "PID eq ${args.pid}" /v`;
        }
        else {
            command = `ps -p ${args.pid} -o pid,ppid,user,group,comm,pcpu,pmem,vsz,rss,tty,stat,start,time,cmd`;
        }
        try {
            const output = yield executeShellCommand(command);
            return `Process Info for PID ${args.pid}:\n${output}`;
        }
        catch (error) {
            return `Error getting process info for PID ${args.pid}: ${error.message}`;
        }
    });
}
