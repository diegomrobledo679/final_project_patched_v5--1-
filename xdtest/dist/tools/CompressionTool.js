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
import { executeShellCommand } from "../utils/command.js";
export const zipCompressTool = {
    type: "function",
    function: {
        name: "zipCompress",
        description: "Compresses a file or directory into a .zip archive.",
        parameters: {
            type: "object",
            properties: {
                inputPath: {
                    type: "string",
                    description: "The path to the file or directory to compress.",
                },
                outputPath: {
                    type: "string",
                    description: "The path for the output .zip file (e.g., 'archive.zip').",
                },
            },
            required: ["inputPath", "outputPath"],
        },
    },
};
export function executeZipCompressTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = `zip -r ${args.outputPath} ${args.inputPath}`;
        return executeShellCommand(command);
    });
}
export const zipDecompressTool = {
    type: "function",
    function: {
        name: "zipDecompress",
        description: "Decompresses a .zip archive to a specified directory.",
        parameters: {
            type: "object",
            properties: {
                inputPath: {
                    type: "string",
                    description: "The path to the .zip archive to decompress.",
                },
                outputPath: {
                    type: "string",
                    description: "The path to the directory where contents will be extracted.",
                },
            },
            required: ["inputPath", "outputPath"],
        },
    },
};
export function executeZipDecompressTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(args.outputPath)) {
            fs.mkdirSync(args.outputPath, { recursive: true });
        }
        const command = `unzip ${args.inputPath} -d ${args.outputPath}`;
        return executeShellCommand(command);
    });
}
export const tarCompressTool = {
    type: "function",
    function: {
        name: "tarCompress",
        description: "Compresses a file or directory into a .tar.gz archive.",
        parameters: {
            type: "object",
            properties: {
                inputPath: {
                    type: "string",
                    description: "The path to the file or directory to compress.",
                },
                outputPath: {
                    type: "string",
                    description: "The path for the output .tar.gz file (e.g., 'archive.tar.gz').",
                },
            },
            required: ["inputPath", "outputPath"],
        },
    },
};
export function executeTarCompressTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = `tar -czf ${args.outputPath} ${args.inputPath}`;
        return executeShellCommand(command);
    });
}
export const tarDecompressTool = {
    type: "function",
    function: {
        name: "tarDecompress",
        description: "Decompresses a .tar.gz archive to a specified directory.",
        parameters: {
            type: "object",
            properties: {
                inputPath: {
                    type: "string",
                    description: "The path to the .tar.gz archive to decompress.",
                },
                outputPath: {
                    type: "string",
                    description: "The path to the directory where contents will be extracted.",
                },
            },
            required: ["inputPath", "outputPath"],
        },
    },
};
export function executeTarDecompressTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(args.outputPath)) {
            fs.mkdirSync(args.outputPath, { recursive: true });
        }
        const command = `tar -xzf ${args.inputPath} -C ${args.outputPath}`;
        return executeShellCommand(command);
    });
}
