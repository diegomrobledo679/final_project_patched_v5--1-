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
export const countLinesInFileTool = {
    type: "function",
    function: {
        name: "countLinesInFile",
        description: "Counts the number of lines in a specified text file.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the text file.",
                },
            },
            required: ["filePath"],
        },
    },
};
export function executeCountLinesInFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = fs.readFileSync(args.filePath, "utf-8");
            const lines = content.split(/\r\n|\r|\n/).length;
            return `File ${args.filePath} has ${lines} lines.`;
        }
        catch (error) {
            return `Error counting lines in file: ${error.message}`;
        }
    });
}
export const findTextInFileTool = {
    type: "function",
    function: {
        name: "findTextInFile",
        description: "Searches for a specified text pattern within a file and returns matching lines.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file to search.",
                },
                pattern: {
                    type: "string",
                    description: "The text pattern (regex) to search for.",
                },
            },
            required: ["filePath", "pattern"],
        },
    },
};
export function executeFindTextInFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = fs.readFileSync(args.filePath, "utf-8");
            const lines = content.split(/\r\n|\r|\n/);
            const regex = new RegExp(args.pattern, 'gim'); // g: global, i: case-insensitive, m: multiline
            const matches = [];
            lines.forEach((line, index) => {
                if (regex.test(line)) {
                    matches.push(`Line ${index + 1}: ${line}`);
                }
            });
            if (matches.length > 0) {
                return `Found ${matches.length} matches in ${args.filePath}:\n${matches.join('\n')}`;
            }
            else {
                return `No matches found for pattern "${args.pattern}" in ${args.filePath}.`;
            }
        }
        catch (error) {
            return `Error searching for text in file: ${error.message}`;
        }
    });
}
export const deepSearchTool = {
    type: "function",
    function: {
        name: "deepSearch",
        description: "Recursively searches for a text pattern within files in a specified directory and its subdirectories.",
        parameters: {
            type: "object",
            properties: {
                directoryPath: {
                    type: "string",
                    description: "The path to the directory to search within.",
                },
                pattern: {
                    type: "string",
                    description: "The text pattern (regex) to search for.",
                },
                fileExtension: {
                    type: "string",
                    description: "Optional: Filter files by extension (e.g., 'js', 'ts').",
                    nullable: true,
                },
                maxDepth: {
                    type: "number",
                    description: "Optional: The maximum depth to recurse. Defaults to unlimited.",
                    nullable: true,
                },
            },
            required: ["directoryPath", "pattern"],
        },
    },
};
export function executeDeepSearchTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        const regex = new RegExp(args.pattern, 'gim');
        const maxDepth = args.maxDepth !== undefined ? args.maxDepth : -1; // -1 for unlimited depth
        function searchDir(currentPath, currentDepth) {
            if (maxDepth !== -1 && currentDepth > maxDepth) {
                return;
            }
            let files;
            try {
                files = fs.readdirSync(currentPath);
            }
            catch (e) {
                results.push(`Error accessing directory ${currentPath}: ${e.message}`);
                return;
            }
            files.forEach(file => {
                const fullPath = path.join(currentPath, file);
                let stats;
                try {
                    stats = fs.statSync(fullPath);
                }
                catch (e) {
                    results.push(`Error accessing file/directory ${fullPath}: ${e.message}`);
                    return;
                }
                if (stats.isDirectory()) {
                    searchDir(fullPath, currentDepth + 1);
                }
                else if (stats.isFile()) {
                    if (args.fileExtension && !file.endsWith(`.${args.fileExtension}`)) {
                        return; // Skip if extension doesn't match
                    }
                    try {
                        const content = fs.readFileSync(fullPath, "utf-8");
                        const lines = content.split(/\r\n|\r|\n/);
                        lines.forEach((line, index) => {
                            if (regex.test(line)) {
                                results.push(`${fullPath} (Line ${index + 1}): ${line}`);
                            }
                        });
                    }
                    catch (e) {
                        // Ignore errors for unreadable files (e.g., binary files) or encoding issues
                    }
                }
            });
        }
        try {
            searchDir(args.directoryPath, 0);
            if (results.length > 0) {
                return `Deep search found ${results.length} matches for pattern "${args.pattern}" in ${args.directoryPath}:\n${results.join('\n')}`;
            }
            else {
                return `No matches found for pattern "${args.pattern}" in ${args.directoryPath}.`;
            }
        }
        catch (error) {
            return `Error during deep search: ${error.message}`;
        }
    });
}
export const getDirectoryStructureTool = {
    type: "function",
    function: {
        name: "getDirectoryStructure",
        description: "Recursively lists the structure of a directory, including files and subdirectories.",
        parameters: {
            type: "object",
            properties: {
                directoryPath: {
                    type: "string",
                    description: "The path to the directory.",
                },
                depth: {
                    type: "number",
                    description: "Optional: The maximum depth to recurse. Defaults to 3.",
                    nullable: true,
                },
            },
            required: ["directoryPath"],
        },
    },
};
export function executeGetDirectoryStructureTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const maxDepth = args.depth !== undefined ? args.depth : 3;
        let output = `Directory structure for ${args.directoryPath}:\n`;
        function readDir(currentPath, currentDepth, prefix) {
            if (currentDepth > maxDepth)
                return;
            const files = fs.readdirSync(currentPath);
            files.forEach((file, index) => {
                const fullPath = path.join(currentPath, file);
                const isLast = index === files.length - 1;
                const newPrefix = prefix + (isLast ? '    ' : '│   ');
                const entryPrefix = prefix + (isLast ? '└── ' : '├── ');
                output += `${entryPrefix}${file}\n`;
                if (fs.statSync(fullPath).isDirectory()) {
                    readDir(fullPath, currentDepth + 1, newPrefix);
                }
            });
        }
        try {
            readDir(args.directoryPath, 0, '');
            return output;
        }
        catch (error) {
            return `Error getting directory structure: ${error.message}`;
        }
    });
}
export const listFileTypesTool = {
    type: "function",
    function: {
        name: "listFileTypes",
        description: "Lists unique file extensions found in a specified directory and its subdirectories.",
        parameters: {
            type: "object",
            properties: {
                directoryPath: {
                    type: "string",
                    description: "The path to the directory.",
                },
            },
            required: ["directoryPath"],
        },
    },
};
import fileType from 'file-type';
export function executeListFileTypesTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileTypes = new Set();
        function collectFileTypes(currentPath) {
            const files = fs.readdirSync(currentPath);
            files.forEach(file => {
                const fullPath = path.join(currentPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    collectFileTypes(fullPath);
                }
                else {
                    const ext = path.extname(file);
                    if (ext) {
                        fileTypes.add(ext);
                    }
                }
            });
        }
        try {
            collectFileTypes(args.directoryPath);
            if (fileTypes.size > 0) {
                return `Unique file types in ${fileTypes.size} files in ${args.directoryPath}:\n${Array.from(fileTypes).sort().join(', ')}`;
            }
            else {
                return `No file types found in ${args.directoryPath}.`;
            }
        }
        catch (error) {
            return `Error listing file types: ${error.message}`;
        }
    });
}
export const getFileContentTypeTool = {
    type: "function",
    function: {
        name: "getFileContentType",
        description: "Determines the content type (MIME type) of a specified file.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file.",
                },
            },
            required: ["filePath"],
        },
    },
};
export function executeGetFileContentTypeTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const buffer = fs.readFileSync(args.filePath);
            const type = yield fileType.fromBuffer(buffer);
            if (type) {
                return `File ${args.filePath} has content type: ${type.mime} (extension: ${type.ext})`;
            }
            else {
                return `Could not determine content type for file ${args.filePath}. It might be a text file or an unknown binary format.`;
            }
        }
        catch (error) {
            return `Error getting file content type: ${error.message}`;
        }
    });
}
