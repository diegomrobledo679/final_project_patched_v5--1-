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
import * as os from "os";
import * as path from "path";
export const readFileTool = {
    type: "function",
    function: {
        name: "readFile",
        description: "Reads the content of a specified file.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file to read.",
                },
            },
            required: ["filePath"],
        },
    },
};
export function executeReadFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = fs.readFileSync(args.filePath, "utf-8");
            return `File content:\n${content}`;
        }
        catch (error) {
            return `Error reading file: ${error.message}`;
        }
    });
}
export const writeFileTool = {
    type: "function",
    function: {
        name: "writeFile",
        description: "Writes content to a specified file. Overwrites if the file exists.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file to write.",
                },
                content: {
                    type: "string",
                    description: "The content to write to the file.",
                },
            },
            required: ["filePath", "content"],
        },
    },
};
export function executeWriteFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            fs.writeFileSync(args.filePath, args.content, "utf-8");
            return `Content successfully written to ${args.filePath}`;
        }
        catch (error) {
            return `Error writing to file: ${error.message}`;
        }
    });
}
export const prependToFileTool = {
    type: "function",
    function: {
        name: "prependToFile",
        description: "Adds content to the beginning of a specified file.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file.",
                },
                content: {
                    type: "string",
                    description: "The content to prepend.",
                },
            },
            required: ["filePath", "content"],
        },
    },
};
export function executePrependToFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const originalContent = fs.readFileSync(args.filePath, "utf-8");
            fs.writeFileSync(args.filePath, args.content + originalContent, "utf-8");
            return `Content successfully prepended to ${args.filePath}`;
        }
        catch (error) {
            return `Error prepending to file: ${error.message}`;
        }
    });
}
export const appendToFileTool = {
    type: "function",
    function: {
        name: "appendToFile",
        description: "Adds content to the end of a specified file.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file.",
                },
                content: {
                    type: "string",
                    description: "The content to append.",
                },
            },
            required: ["filePath", "content"],
        },
    },
};
export function executeAppendToFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            fs.appendFileSync(args.filePath, args.content, "utf-8");
            return `Content successfully appended to ${args.filePath}`;
        }
        catch (error) {
            return `Error appending to file: ${error.message}`;
        }
    });
}
export const insertIntoFileTool = {
    type: "function",
    function: {
        name: "insertIntoFile",
        description: "Inserts content into a specified file at a given line number.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file.",
                },
                content: {
                    type: "string",
                    description: "The content to insert.",
                },
                lineNumber: {
                    type: "number",
                    description: "The 1-based line number before which to insert the content.",
                },
            },
            required: ["filePath", "content", "lineNumber"],
        },
    },
};
export function executeInsertIntoFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lines = fs.readFileSync(args.filePath, "utf-8").split(/\r\n|\r|\n/);
            if (args.lineNumber < 1 || args.lineNumber > lines.length + 1) {
                return `Error: Line number ${args.lineNumber} is out of bounds for file ${args.filePath} (total lines: ${lines.length}).`;
            }
            lines.splice(args.lineNumber - 1, 0, args.content);
            fs.writeFileSync(args.filePath, lines.join(os.EOL), "utf-8");
            return `Content successfully inserted into ${args.filePath} at line ${args.lineNumber}.`;
        }
        catch (error) {
            return `Error inserting into file: ${error.message}`;
        }
    });
}
export const deleteFromFileTool = {
    type: "function",
    function: {
        name: "deleteFromFile",
        description: "Deletes specific lines or content from a file.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file.",
                },
                lineNumber: {
                    type: "number",
                    description: "Optional: The 1-based line number to delete.",
                    nullable: true,
                },
                pattern: {
                    type: "string",
                    description: "Optional: A regex pattern to match and delete lines containing it.",
                    nullable: true,
                },
            },
            required: ["filePath"],
        },
    },
};
export function executeDeleteFromFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let lines = fs.readFileSync(args.filePath, "utf-8").split(/\r\n|\r|\n/);
            let originalLength = lines.length;
            if (args.lineNumber !== undefined) {
                if (args.lineNumber < 1 || args.lineNumber > lines.length) {
                    return `Error: Line number ${args.lineNumber} is out of bounds for file ${args.filePath} (total lines: ${lines.length}).`;
                }
                lines.splice(args.lineNumber - 1, 1);
            }
            else if (args.pattern !== undefined) {
                const regex = new RegExp(args.pattern, 'gim');
                lines = lines.filter(line => !regex.test(line));
            }
            else {
                return "Error: Either lineNumber or pattern must be provided.";
            }
            if (lines.length === originalLength) {
                return `No changes made to ${args.filePath}. No matching lines found or line number out of bounds.`;
            }
            fs.writeFileSync(args.filePath, lines.join(os.EOL), "utf-8");
            return `Content successfully deleted from ${args.filePath}. New line count: ${lines.length}.`;
        }
        catch (error) {
            return `Error deleting from file: ${error.message}`;
        }
    });
}
export const replaceInFileTool = {
    type: "function",
    function: {
        name: "replaceInFile",
        description: "Replaces all occurrences of a specified pattern with new content within a file.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file.",
                },
                pattern: {
                    type: "string",
                    description: "The regex pattern to search for.",
                },
                replacement: {
                    type: "string",
                    description: "The content to replace the matched pattern with.",
                },
            },
            required: ["filePath", "pattern", "replacement"],
        },
    },
};
export function executeReplaceInFileTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let content = fs.readFileSync(args.filePath, "utf-8");
            const regex = new RegExp(args.pattern, 'g');
            const newContent = content.replace(regex, args.replacement);
            if (content === newContent) {
                return `No matches found for pattern "${args.pattern}" in ${args.filePath}. No changes made.`;
            }
            fs.writeFileSync(args.filePath, newContent, "utf-8");
            return `Successfully replaced content in ${args.filePath}.`;
        }
        catch (error) {
            return `Error replacing content in file: ${error.message}`;
        }
    });
}
export const createDirectoryTool = {
    type: "function",
    function: {
        name: "createDirectory",
        description: "Creates a new directory at the specified path.",
        parameters: {
            type: "object",
            properties: {
                directoryPath: {
                    type: "string",
                    description: "The path where the new directory will be created.",
                },
                recursive: {
                    type: "boolean",
                    description: "Optional: If true, creates parent directories recursively. Defaults to false.",
                    nullable: true,
                },
            },
            required: ["directoryPath"],
        },
    },
};
export function executeCreateDirectoryTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            fs.mkdirSync(args.directoryPath, { recursive: args.recursive });
            return `Directory ${args.directoryPath} created successfully.`;
        }
        catch (error) {
            return `Error creating directory: ${error.message}`;
        }
    });
}
export const deletePathTool = {
    type: "function",
    function: {
        name: "deletePath",
        description: "Deletes a file or an empty directory. For non-empty directories, use recursive option.",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The path to the file or directory to delete.",
                },
                recursive: {
                    type: "boolean",
                    description: "Optional: If true, performs a recursive delete for directories. Use with caution. Defaults to false.",
                    nullable: true,
                },
            },
            required: ["path"],
        },
    },
};
export function executeDeletePathTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            fs.rmSync(args.path, { recursive: args.recursive, force: true });
            return `Path ${args.path} deleted successfully.`;
        }
        catch (error) {
            return `Error deleting path: ${error.message}`;
        }
    });
}
export const copyPathTool = {
    type: "function",
    function: {
        name: "copyPath",
        description: "Copies a file or directory from a source path to a destination path.",
        parameters: {
            type: "object",
            properties: {
                sourcePath: {
                    type: "string",
                    description: "The path to the source file or directory.",
                },
                destinationPath: {
                    type: "string",
                    description: "The path to the destination.",
                },
                recursive: {
                    type: "boolean",
                    description: "Optional: If true, copies directories recursively. Defaults to false.",
                    nullable: true,
                },
            },
            required: ["sourcePath", "destinationPath"],
        },
    },
};
export function executeCopyPathTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            fs.cpSync(args.sourcePath, args.destinationPath, { recursive: args.recursive });
            return `Path ${args.sourcePath} copied to ${args.destinationPath} successfully.`;
        }
        catch (error) {
            return `Error copying path: ${error.message}`;
        }
    });
}
export const movePathTool = {
    type: "function",
    function: {
        name: "movePath",
        description: "Moves a file or directory from a source path to a destination path.",
        parameters: {
            type: "object",
            properties: {
                sourcePath: {
                    type: "string",
                    description: "The path to the source file or directory.",
                },
                destinationPath: {
                    type: "string",
                    description: "The path to the destination.",
                },
            },
            required: ["sourcePath", "destinationPath"],
        },
    },
};
export function executeMovePathTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            fs.renameSync(args.sourcePath, args.destinationPath);
            return `Path ${args.sourcePath} moved to ${args.destinationPath} successfully.`;
        }
        catch (error) {
            return `Error moving path: ${error.message}`;
        }
    });
}
export const searchFilesTool = {
    type: "function",
    function: {
        name: "searchFiles",
        description: "Recursively searches for a regex pattern in all files under a directory and returns matching lines.",
        parameters: {
            type: "object",
            properties: {
                directory: {
                    type: "string",
                    description: "The directory to search within.",
                },
                pattern: {
                    type: "string",
                    description: "The regex pattern to search for.",
                },
            },
            required: ["directory", "pattern"],
        },
    },
};
export function executeSearchFilesTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        const regex = new RegExp(args.pattern, 'g');
        const searchDir = (dir) => {
            for (const entry of fs.readdirSync(dir)) {
                const fullPath = path.join(dir, entry);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    searchDir(fullPath);
                }
                else if (stat.isFile()) {
                    const lines = fs.readFileSync(fullPath, 'utf-8').split(/\r?\n/);
                    lines.forEach((line, idx) => {
                        if (regex.test(line)) {
                            results.push(`${fullPath}:${idx + 1}:${line.trim()}`);
                        }
                    });
                }
            }
        };
        try {
            searchDir(args.directory);
            return results.length > 0 ? results.join(os.EOL) : 'No matches found.';
        }
        catch (error) {
            return `Error searching files: ${error.message}`;
        }
    });
}
