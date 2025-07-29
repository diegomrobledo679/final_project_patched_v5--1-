import { Tool } from "../core/types.js";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { parseStringPromise } from "xml2js";
import Ajv from "ajv";
import * as os from "os";
import { executeShellCommand } from "../utils/command.js";

export const readConfigFileTool: Tool = {
  type: "function",
  function: {
    name: "readConfigFile",
    description: "Reads and parses the content of a specified configuration file (supports JSON, YAML, INI, XML).",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "The path to the configuration file.",
        },
        fileType: {
          type: "string",
          enum: ["json", "yaml", "ini", "xml"],
          description: "The type of the configuration file.",
        },
      },
      required: ["filePath", "fileType"],
    },
  },
};

export async function executeReadConfigFileTool(args: { filePath: string; fileType: "json" | "yaml" | "ini" | "xml" }): Promise<string> {
  try {
    if (!fs.existsSync(args.filePath)) {
      return `Error: Configuration file not found at ${args.filePath}`;
    }
    const content = fs.readFileSync(args.filePath, "utf-8");

    switch (args.fileType) {
      case "json":
        return JSON.stringify(JSON.parse(content), null, 2);
      case "yaml":
        return JSON.stringify(yaml.load(content), null, 2);
      case "ini":
        // Basic INI parsing (key=value per line)
        const iniConfig: { [key: string]: string } = {};
        content.split(/\r\n|\r|\n/).forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith(';')) {
            const parts = trimmedLine.split('=');
            if (parts.length >= 2) {
              iniConfig[parts[0].trim()] = parts.slice(1).join('=').trim();
            }
          }
        });
        return JSON.stringify(iniConfig, null, 2);
      case "xml":
        try {
          const result = await parseStringPromise(content);
          return JSON.stringify(result, null, 2);
        } catch (err: any) {
          throw err;
        }
      default:
        return `Error: Unsupported file type for reading: ${args.fileType}`;
    }
  } catch (error: any) {
    return `Error reading configuration file: ${error.message}`;
  }
}

export const modifyConfigFileTool: Tool = {
  type: "function",
  function: {
    name: "modifyConfigFile",
    description: "Modifies a specified key-value pair in a configuration file (supports JSON, YAML, INI).",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "The path to the configuration file.",
        },
        fileType: {
          type: "string",
          enum: ["json", "yaml", "ini"],
          description: "The type of the configuration file.",
        },
        key: {
          type: "string",
          description: "The key to modify (for nested keys, use dot notation, e.g., 'database.port').",
        },
        value: {
          type: "string",
          description: "The new value for the key. Will be parsed as JSON for JSON/YAML files if possible.",
        },
      },
      required: ["filePath", "fileType", "key", "value"],
    },
  },
};

export async function executeModifyConfigFileTool(args: { filePath: string; fileType: "json" | "yaml" | "ini"; key: string; value: string }): Promise<string> {
  try {
    if (!fs.existsSync(args.filePath)) {
      return `Error: Configuration file not found at ${args.filePath}`;
    }
    const content = fs.readFileSync(args.filePath, "utf-8");
    let configData: any;

    switch (args.fileType) {
      case "json":
        configData = JSON.parse(content);
        break;
      case "yaml":
        configData = yaml.load(content);
        break;
      case "ini":
        // Basic INI parsing for modification
        const iniLines = content.split(/\r\n|\r|\n/);
        let modifiedIniLines: string[] = [];
        let keyFound = false;
        iniLines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith(args.key + '=')) {
            modifiedIniLines.push(`${args.key}=${args.value}`);
            keyFound = true;
          } else {
            modifiedIniLines.push(line);
          }
        });
        if (!keyFound) {
          modifiedIniLines.push(`${args.key}=${args.value}`); // Add if key not found
        }
        fs.writeFileSync(args.filePath, modifiedIniLines.join(os.EOL), "utf-8");
        return `Successfully modified key '${args.key}' in ${args.filePath}.`;
      default:
        return `Error: Unsupported file type for modification: ${args.fileType}`;
    }

    // For JSON and YAML
    const keys = args.key.split('.');
    let current = configData;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        try {
          current[k] = JSON.parse(args.value); // Try parsing as JSON
        } catch {
          current[k] = args.value; // Otherwise, treat as string
        }
      } else {
        if (!current[k] || typeof current[k] !== 'object') {
          current[k] = {};
        }
        current = current[k];
      }
    }

    let newContent: string;
    if (args.fileType === "json") {
      newContent = JSON.stringify(configData, null, 2);
    } else { // yaml
      newContent = yaml.dump(configData);
    }

    fs.writeFileSync(args.filePath, newContent, "utf-8");
    return `Successfully modified key '${args.key}' in ${args.filePath}.`;
  } catch (error: any) {
    return `Error modifying configuration file: ${error.message}`;
  }
}

export const validateConfigFileTool: Tool = {
  type: "function",
  function: {
    name: "validateConfigFile",
    description: "Validates a configuration file using an optional JSON Schema.",
    parameters: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "The path to the configuration file." },
        fileType: { type: "string", enum: ["json", "yaml", "xml"], description: "The type of the configuration file." },
        schemaPath: { type: "string", description: "Optional path to a JSON Schema file used for validation.", nullable: true },
      },
      required: ["filePath", "fileType"],
    },
  },
};

export async function executeValidateConfigFileTool(args: { filePath: string; fileType: "json" | "yaml" | "xml"; schemaPath?: string }): Promise<string> {
  try {
    const content = fs.readFileSync(args.filePath, "utf-8");
    let data: any;
    if (args.fileType === "json") {
      data = JSON.parse(content);
    } else if (args.fileType === "yaml") {
      data = yaml.load(content);
    } else {
      data = await parseStringPromise(content);
    }

    if (args.schemaPath) {
      const schemaContent = fs.readFileSync(args.schemaPath, "utf-8");
      const schema = JSON.parse(schemaContent);
      const ajv = new Ajv.default({ allErrors: true });
      const validate = ajv.compile(schema);
      const valid = validate(data);
      if (!valid) {
        return `Validation failed: ${ajv.errorsText(validate.errors)}`;
      }
    }
    return `Validation successful for ${args.filePath}.`;
  } catch (error: any) {
    return `Error validating configuration file: ${error.message}`;
  }
}