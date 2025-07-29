
import { Tool } from "../core/types.js";
import * as process from "process";
import { RELEVANT_ENV_VARS } from "../envVars.js";

export const getEnvironmentVariableTool: Tool = {
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

export async function executeGetEnvironmentVariableTool(args: { name: string }): Promise<string> {
  const value = process.env[args.name];
  if (value !== undefined) {
    return `Environment variable ${args.name}: ${value}`;
  } else {
    return `Environment variable ${args.name} is not set.`;
  }
}

export const setEnvironmentVariableTool: Tool = {
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

export async function executeSetEnvironmentVariableTool(args: { name: string; value: string }): Promise<string> {
  process.env[args.name] = args.value;
  return `Environment variable ${args.name} set to ${args.value}`;
}

export const unsetEnvironmentVariableTool: Tool = {
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

export async function executeUnsetEnvironmentVariableTool(args: { name: string }): Promise<string> {
  delete process.env[args.name];
  return `Environment variable ${args.name} unset.`;
}

export const listEnvironmentVariablesTool: Tool = {
  type: "function",
  function: {
    name: "listEnvironmentVariables",
    description: "Lists relevant environment variables and their current values if set.",
    parameters: { type: "object", properties: {} }
  }
};

export async function executeListEnvironmentVariablesTool(): Promise<string> {
  return RELEVANT_ENV_VARS.map(k => process.env[k] ? `${k}=${process.env[k]}` : k).join("\n");
}
