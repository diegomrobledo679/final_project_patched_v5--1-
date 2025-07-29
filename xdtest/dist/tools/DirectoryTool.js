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
import * as path from "path";
export const listDirectoryTool = {
    type: "function",
    function: {
        name: "listDirectory",
        description: "Lists the contents of a specified directory.",
        parameters: {
            type: "object",
            properties: {
                directoryPath: {
                    type: "string",
                    description: "The path to the directory to list.",
                },
            },
            required: ["directoryPath"],
        },
    },
};
export function executeListDirectoryTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = fs.readdirSync(args.directoryPath);
            let output = `Contents of ${args.directoryPath}:\n`;
            files.forEach(file => {
                const fullPath = path.join(args.directoryPath, file);
                const stats = fs.statSync(fullPath);
                output += `- ${file} (${stats.isDirectory() ? 'directory' : 'file'})\n`;
            });
            return output;
        }
        catch (error) {
            return `Error listing directory: ${error.message}`;
        }
    });
}
