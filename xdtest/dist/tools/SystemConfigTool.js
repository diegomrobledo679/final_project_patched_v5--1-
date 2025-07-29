var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from "fs";
import * as yaml from "js-yaml";
import { parseStringPromise } from "xml2js";
import Ajv from "ajv";
import * as os from "os";
export const readConfigFileTool = {
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
export function executeReadConfigFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
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
                    const iniConfig = {};
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
                        const result = yield parseStringPromise(content);
                        return JSON.stringify(result, null, 2);
                    }
                    catch (err) {
                        throw err;
                    }
                default:
                    return `Error: Unsupported file type for reading: ${args.fileType}`;
            }
        }
        catch (error) {
            return `Error reading configuration file: ${error.message}`;
        }
    });
}
export const modifyConfigFileTool = {
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
export function executeModifyConfigFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!fs.existsSync(args.filePath)) {
                return `Error: Configuration file not found at ${args.filePath}`;
            }
            const content = fs.readFileSync(args.filePath, "utf-8");
            let configData;
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
                    let modifiedIniLines = [];
                    let keyFound = false;
                    iniLines.forEach(line => {
                        const trimmedLine = line.trim();
                        if (trimmedLine.startsWith(args.key + '=')) {
                            modifiedIniLines.push(`${args.key}=${args.value}`);
                            keyFound = true;
                        }
                        else {
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
                    }
                    catch (_a) {
                        current[k] = args.value; // Otherwise, treat as string
                    }
                }
                else {
                    if (!current[k] || typeof current[k] !== 'object') {
                        current[k] = {};
                    }
                    current = current[k];
                }
            }
            let newContent;
            if (args.fileType === "json") {
                newContent = JSON.stringify(configData, null, 2);
            }
            else { // yaml
                newContent = yaml.dump(configData);
            }
            fs.writeFileSync(args.filePath, newContent, "utf-8");
            return `Successfully modified key '${args.key}' in ${args.filePath}.`;
        }
        catch (error) {
            return `Error modifying configuration file: ${error.message}`;
        }
    });
}
export const validateConfigFileTool = {
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
export function executeValidateConfigFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = fs.readFileSync(args.filePath, "utf-8");
            let data;
            if (args.fileType === "json") {
                data = JSON.parse(content);
            }
            else if (args.fileType === "yaml") {
                data = yaml.load(content);
            }
            else {
                data = yield parseStringPromise(content);
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
        }
        catch (error) {
            return `Error validating configuration file: ${error.message}`;
        }
    });
}
