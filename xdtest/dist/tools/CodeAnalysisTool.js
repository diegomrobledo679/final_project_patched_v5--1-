var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
export const syntaxCheckTool = {
    type: "function",
    function: {
        name: "syntaxCheck",
        description: "Performs a syntax check on the provided code using language-specific tools. Returns a report of syntax errors or warnings.",
        parameters: {
            type: "object",
            properties: {
                code: {
                    type: "string",
                    description: "The code to check for syntax errors.",
                },
                language: {
                    type: "string",
                    description: "The programming language of the code (e.g., 'python', 'javascript', 'typescript', 'java', 'cpp', 'ruby', 'php', 'go', 'rust', 'swift', 'csharp', 'kotlin', 'r', 'groovy', 'scala', 'powershell').",
                },
            },
            required: ["code", "language"],
        },
    },
};
export function executeSyntaxCheckTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { code, language } = args;
        const tempDir = os.tmpdir();
        const fileName = `temp_syntax_check_${Date.now()}`;
        let fileExtension;
        let command;
        const filePath = path.join(tempDir, fileName);
        let fullFilePath; // Declare fullFilePath here
        switch (language.toLowerCase()) {
            case 'python':
                fileExtension = 'py';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `python -m py_compile ${JSON.stringify(fullFilePath)}`;
                break;
            case 'javascript':
                fileExtension = 'js';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `node --check ${JSON.stringify(fullFilePath)}`;
                break;
            case 'typescript':
                fileExtension = 'ts';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `tsc --noEmit ${JSON.stringify(fullFilePath)}`;
                break;
            case 'java':
                fileExtension = 'java';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `javac -Xlint:all -Werror ${JSON.stringify(fullFilePath)}`;
                break;
            case 'cpp':
                fileExtension = 'cpp';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `g++ -Wall -Wextra -pedantic -fsyntax-only ${JSON.stringify(fullFilePath)}`;
                break;
            case 'ruby':
                fileExtension = 'rb';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `ruby -c ${JSON.stringify(fullFilePath)}`;
                break;
            case 'php':
                fileExtension = 'php';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `php -l ${JSON.stringify(fullFilePath)}`;
                break;
            case 'go':
                fileExtension = 'go';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `go build -o /dev/null ${JSON.stringify(fullFilePath)}`;
                break;
            case 'rust':
                fileExtension = 'rs';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `rustc --emit=metadata --crate-type lib ${JSON.stringify(fullFilePath)}`;
                break;
            case 'swift':
                fileExtension = 'swift';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `swiftc -parse-as-library -typecheck ${JSON.stringify(fullFilePath)}`;
                break;
            case 'csharp':
                fileExtension = 'cs';
                fullFilePath = path.join(tempDir, `csharp_syntax_check_${Date.now()}`, `Program.cs`); // Update fullFilePath for C#
                const csharpProjectDir = path.dirname(fullFilePath); // Get project directory from fullFilePath
                const csharpProjectFile = path.join(csharpProjectDir, `csharp_syntax_check_${Date.now()}.csproj`);
                fs.mkdirSync(csharpProjectDir, { recursive: true });
                fs.writeFileSync(csharpProjectFile, `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>`);
                fs.writeFileSync(fullFilePath, code);
                command = `dotnet build ${csharpProjectDir} --nologo`;
                // Add cleanup for the project directory
                setTimeout(() => {
                    fs.rmSync(csharpProjectDir, { recursive: true, force: true });
                }, 5000); // Clean up after 5 seconds
                break;
            case 'kotlin':
                fileExtension = 'kt';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `kotlinc -Xno-stdlib -nowarn -Werror -proc:none ${JSON.stringify(fullFilePath)}`;
                break;
            case 'r':
                fileExtension = 'R';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `Rscript -e "parse(text=readLines(${JSON.stringify(fullFilePath)}))"`;
                break;
            case 'groovy':
                fileExtension = 'groovy';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `groovyc -c ${JSON.stringify(fullFilePath)}`;
                break;
            case 'scala':
                fileExtension = 'scala';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                command = `scalac -Xlint ${JSON.stringify(fullFilePath)}`;
                break;
            case 'powershell':
                fileExtension = 'ps1';
                fullFilePath = filePath + '.' + fileExtension;
                fs.writeFileSync(fullFilePath, code);
                // Use PSScriptAnalyzer for robust syntax checking if available, otherwise a basic check.
                // This assumes PSScriptAnalyzer is installed. If not, the user might need to install it.
                command = `pwsh -NoProfile -Command "try { Get-Content -Raw ${JSON.stringify(fullFilePath)} | Invoke-ScriptAnalyzer -Severity Error,Warning,Information | Out-String } catch { Invoke-Expression (Get-Content -Raw ${JSON.stringify(fullFilePath)}) }"`;
                break;
            default:
                return `Error: Unsupported language for syntax check: ${language}`;
        }
        return new Promise((resolve) => {
            exec(command, { cwd: tempDir }, (error, stdout, stderr) => {
                fs.unlinkSync(fullFilePath); // Clean up temp file
                if (error) {
                    resolve(`Syntax check failed for ${language} code:\n${stderr || stdout || error.message}`);
                }
                else {
                    if (stderr) {
                        resolve(`Syntax check completed with warnings for ${language} code:\n${stderr}`);
                    }
                    else if (stdout) {
                        resolve(`Syntax check completed for ${language} code:\n${stdout}`);
                    }
                    else {
                        resolve(`Syntax check completed successfully for ${language} code. No issues found.`);
                    }
                }
            });
        });
    });
}
export const fixCodeTool = {
    type: "function",
    function: {
        name: "fixCode",
        description: "Attempts to fix code errors using external linting tools or by leveraging AI capabilities. For a real implementation, this tool would integrate with language-specific linters (e.g., ESLint for JavaScript/TypeScript, Pylint for Python) or send the code to an AI model for suggested corrections.",
        parameters: {
            type: "object",
            properties: {
                code: {
                    type: "string",
                    description: "The code to fix.",
                },
                language: {
                    type: "string",
                    description: "The programming language of the code.",
                },
                errorDetails: {
                    type: "string",
                    description: "Optional: Details about the error to help in fixing the code.",
                    nullable: true,
                },
            },
            required: ["code", "language"],
        },
    },
};
export function executeFixCodeTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { code, language } = args;
        const lang = language.toLowerCase();
        if (lang === 'javascript' || lang === 'typescript') {
            const prettier = yield import('prettier');
            const parser = lang === 'javascript' ? 'babel' : 'typescript';
            return prettier.format(code, { parser });
        }
        if (lang === 'python') {
            try {
                const { execSync } = yield import('child_process');
                return execSync('autopep8 -', { input: code }).toString();
            }
            catch (err) {
                return `autopep8 failed or is not installed: ${err.message}`;
            }
        }
        return `Automatic fixing not supported for ${language}.`;
    });
}
export const formatCodeTool = {
    type: "function",
    function: {
        name: "formatCode",
        description: "Formats code according to standard style guidelines using external formatting tools. For a real implementation, this tool would integrate with language-specific formatters (e.g., Prettier for JavaScript/TypeScript, Black for Python, gofmt for Go).",
        parameters: {
            type: "object",
            properties: {
                code: {
                    type: "string",
                    description: "The code to format.",
                },
                language: {
                    type: "string",
                    description: "The programming language of the code.",
                },
            },
            required: ["code", "language"],
        },
    },
};
export function executeFormatCodeTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { code, language } = args;
        const lang = language.toLowerCase();
        if (lang === 'javascript' || lang === 'typescript') {
            const prettier = yield import('prettier');
            const parser = lang === 'javascript' ? 'babel' : 'typescript';
            return prettier.format(code, { parser });
        }
        if (lang === 'python') {
            try {
                const { execSync } = yield import('child_process');
                return execSync('black -q -', { input: code }).toString();
            }
            catch (err) {
                return `black failed or is not installed: ${err.message}`;
            }
        }
        return `Automatic formatting not supported for ${language}.`;
    });
}
export const executeLinterFormatterTool = {
    type: "function",
    function: {
        name: "executeLinterFormatter",
        description: "Executes an external linter or formatter tool on the provided code and returns the output. This tool is intended to be used by the AI to apply actual code style and fix issues.",
        parameters: {
            type: "object",
            properties: {
                code: {
                    type: "string",
                    description: "The code to be processed by the linter/formatter.",
                },
                language: {
                    type: "string",
                    description: "The programming language of the code.",
                },
                command: {
                    type: "string",
                    description: "The shell command to execute the linter/formatter (e.g., 'eslint --fix', 'black', 'prettier --write'). The command should be able to read code from stdin or a temporary file and output to stdout.",
                },
                args: {
                    type: "array",
                    items: { type: "string" },
                    description: "Optional: Additional arguments for the linter/formatter command.",
                    nullable: true,
                },
            },
            required: ["code", "language", "command"],
        },
    },
};
export function executeExecuteLinterFormatterTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const tempDir = os.tmpdir();
        const fileName = `temp_code_for_linter_${Date.now()}`;
        let fileExtension;
        switch (args.language.toLowerCase()) {
            case 'python':
                fileExtension = 'py';
                break;
            case 'javascript':
                fileExtension = 'js';
                break;
            case 'typescript':
                fileExtension = 'ts';
                break;
            case 'java':
                fileExtension = 'java';
                break;
            case 'cpp':
                fileExtension = 'cpp';
                break;
            case 'ruby':
                fileExtension = 'rb';
                break;
            case 'php':
                fileExtension = 'php';
                break;
            case 'go':
                fileExtension = 'go';
                break;
            case 'rust':
                fileExtension = 'rs';
                break;
            case 'swift':
                fileExtension = 'swift';
                break;
            case 'csharp':
                fileExtension = 'cs';
                break;
            case 'kotlin':
                fileExtension = 'kt';
                break;
            case 'r':
                fileExtension = 'R';
                break;
            case 'groovy':
                fileExtension = 'groovy';
                break;
            case 'scala':
                fileExtension = 'scala';
                break;
            case 'powershell':
                fileExtension = 'ps1';
                break;
            default: return `Error: Unsupported language for linter/formatter: ${args.language}`;
        }
        const fullFilePath = path.join(tempDir, `${fileName}.${fileExtension}`);
        fs.writeFileSync(fullFilePath, args.code);
        return new Promise((resolve) => {
            const commandToExecute = `${args.command} ${fullFilePath} ${args.args ? args.args.join(' ') : ''}`;
            exec(commandToExecute, { cwd: tempDir }, (error, stdout, stderr) => {
                fs.unlinkSync(fullFilePath); // Clean up temp file
                if (error) {
                    resolve(`Linter/Formatter execution failed: ${stderr || stdout || error.message}`);
                }
                else {
                    // Read the potentially modified file content if the tool modifies in place
                    try {
                        const modifiedContent = fs.readFileSync(fullFilePath, "utf-8");
                        resolve(`Linter/Formatter output:\n${stdout}\nModified code:\n\`\`\`${args.language}\n${modifiedContent}\n\`\`\``);
                    }
                    catch (readError) {
                        const msg = readError.message || readError;
                        resolve(`Linter/Formatter output:\n${stdout}\nError reading modified file: ${msg}`);
                    }
                }
            });
        });
    });
}
