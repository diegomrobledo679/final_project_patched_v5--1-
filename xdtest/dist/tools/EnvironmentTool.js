var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as process from "process";
import { RELEVANT_ENV_VARS } from "../envVars.js";
export const getEnvironmentVariableTool = {
    type: "function",
    function: {
        name: "getEnvironmentVariable",
        description: "Retrieves the value of a specified environment variable.",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "The name of the environment variable.",
                },
            },
            required: ["name"],
        },
    },
};
export function executeGetEnvironmentVariableTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const value = process.env[args.name];
        if (value !== undefined) {
            return `Environment variable ${args.name}: ${value}`;
        }
        else {
            return `Environment variable ${args.name} is not set.`;
        }
    });
}
export const setEnvironmentVariableTool = {
    type: "function",
    function: {
        name: "setEnvironmentVariable",
        description: "Sets the value of an environment variable. This change is temporary and only affects the current process and its children.",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "The name of the environment variable.",
                },
                value: {
                    type: "string",
                    description: "The value to set for the environment variable.",
                },
            },
            required: ["name", "value"],
        },
    },
};
export function executeSetEnvironmentVariableTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        process.env[args.name] = args.value;
        return `Environment variable ${args.name} set to ${args.value}`;
    });
}
export const unsetEnvironmentVariableTool = {
    type: "function",
    function: {
        name: "unsetEnvironmentVariable",
        description: "Deletes a specified environment variable. This change is temporary and only affects the current process and its children.",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "The name of the environment variable to delete.",
                },
            },
            required: ["name"],
        },
    },
};
export function executeUnsetEnvironmentVariableTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        delete process.env[args.name];
        return `Environment variable ${args.name} unset.`;
    });
}
export const listEnvironmentVariablesTool = {
    type: "function",
    function: {
        name: "listEnvironmentVariables",
        description: "Lists relevant environment variables and their current values if set.",
        parameters: { type: "object", properties: {} }
    }
};
export function executeListEnvironmentVariablesTool() {
    return __awaiter(this, void 0, void 0, function* () {
        return RELEVANT_ENV_VARS.map(k => process.env[k] ? `${k}=${process.env[k]}` : k).join("\n");
    });
}
