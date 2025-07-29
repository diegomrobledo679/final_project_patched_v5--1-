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
import * as path from "path"; // Added import
import * as fs from "fs"; // Added import
import { executeShellCommand } from "../utils/command.js";
export const npmInstallTool = {
    type: "function",
    function: {
        name: "npmInstall",
        description: "Installs an npm package globally or locally.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the npm package to install.",
                },
                global: {
                    type: "boolean",
                    description: "Optional: If true, installs the package globally. Defaults to false.",
                    nullable: true,
                },
            },
            required: ["packageName"],
        },
    },
};
export function executeNpmInstallTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const installCommand = args.global ? `npm install -g ${args.packageName}` : `npm install ${args.packageName}`;
        return executeShellCommand(installCommand);
    });
}
export const pipInstallTool = {
    type: "function",
    function: {
        name: "pipInstall",
        description: "Installs a Python package using pip.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the Python package to install.",
                },
            },
            required: ["packageName"],
        },
    },
};
export function executePipInstallTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const pythonExecutable = path.join(process.cwd(), '.venv', 'bin', 'python');
        const pipCommand = fs.existsSync(pythonExecutable) ? `${pythonExecutable} -m pip install ${args.packageName}` : `pip install ${args.packageName}`;
        return executeShellCommand(pipCommand);
    });
}
export const aptInstallTool = {
    type: "function",
    function: {
        name: "aptInstall",
        description: "Installs a package using apt (for Debian/Ubuntu-based systems). Requires sudo privileges.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the package to install.",
                },
            },
            required: ["packageName"],
        },
    },
};
export function executeAptInstallTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() !== 'linux') {
            return "Error: apt is only available on Linux systems.";
        }
        return executeShellCommand(`sudo apt-get update && sudo apt-get install -y ${args.packageName}`);
    });
}
export const brewInstallTool = {
    type: "function",
    function: {
        name: "brewInstall",
        description: "Installs a package using Homebrew (for macOS and Linux).",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the package to install.",
                },
            },
            required: ["packageName"],
        },
    },
};
export function executeBrewInstallTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() !== 'darwin' && os.platform() !== 'linux') {
            return "Error: Homebrew is primarily for macOS and Linux.";
        }
        return executeShellCommand(`brew install ${args.packageName}`);
    });
}
export const chocoInstallTool = {
    type: "function",
    function: {
        name: "chocoInstall",
        description: "Installs a package using Chocolatey (for Windows). Requires administrative privileges.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the package to install.",
                },
            },
            required: ["packageName"],
        },
    },
};
export function executeChocoInstallTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() !== 'win32') {
            return "Error: Chocolatey is only available on Windows systems.";
        }
        return executeShellCommand(`choco install ${args.packageName} -y`);
    });
}
export const checkMissingDependenciesTool = {
    type: "function",
    function: {
        name: "checkMissingDependencies",
        description: "Checks for missing project dependencies based on common configuration files (e.g., package.json, requirements.txt).",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the dependency configuration file (e.g., package.json, requirements.txt).",
                },
            },
            required: ["filePath"],
        },
    },
};
export function executeCheckMissingDependenciesTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = fs.readFileSync(args.filePath, "utf-8");
            const fileName = path.basename(args.filePath);
            let declaredDependencies = [];
            let missingDependencies = [];
            if (fileName === 'package.json') {
                const packageJson = JSON.parse(content);
                declaredDependencies = Object.keys(Object.assign(Object.assign({}, packageJson.dependencies), packageJson.devDependencies));
                for (const dep of declaredDependencies) {
                    try {
                        // Check if the package exists in node_modules
                        const packagePath = path.join(process.cwd(), 'node_modules', dep);
                        if (!fs.existsSync(packagePath)) {
                            missingDependencies.push(dep);
                        }
                    }
                    catch (e) {
                        missingDependencies.push(dep);
                    }
                }
            }
            else if (fileName === 'requirements.txt') {
                declaredDependencies = content.split(/\r\n|\r|\n/).filter(line => line.trim() !== '' && !line.startsWith('#'));
                for (const dep of declaredDependencies) {
                    try {
                        // Check if pip can find the package
                        yield executeShellCommand(`pip show ${dep.split('==')[0].split('>=')[0].split('<=')[0].split('~')[0].split('>')[0].split('<')[0].trim()}`);
                    }
                    catch (e) {
                        missingDependencies.push(dep);
                    }
                }
            }
            else {
                return `Unsupported dependency file type: ${fileName}. Supported: package.json, requirements.txt.`;
            }
            if (missingDependencies.length > 0) {
                return `Missing dependencies in ${fileName}:\n${missingDependencies.join('\n')}`;
            }
            else {
                return `All declared dependencies in ${fileName} appear to be installed.`;
            }
        }
        catch (error) {
            return `Error checking missing dependencies: ${error.message}`;
        }
    });
}
export const listInstalledPackagesTool = {
    type: "function",
    function: {
        name: "listInstalledPackages",
        description: "Lists packages installed by a specified package manager.",
        parameters: {
            type: "object",
            properties: {
                packageManager: {
                    type: "string",
                    enum: ["npm", "pip", "apt", "brew", "choco"],
                    description: "The package manager to list packages for.",
                },
            },
            required: ["packageManager"],
        },
    },
};
export function executeListInstalledPackagesTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        switch (args.packageManager) {
            case 'npm':
                command = 'npm list --depth=0';
                break;
            case 'pip':
                command = 'pip list';
                break;
            case 'apt':
                command = 'apt list --installed';
                break;
            case 'brew':
                command = 'brew list';
                break;
            case 'choco':
                command = 'choco list --localonly';
                break;
            default:
                return `Error: Unsupported package manager: ${args.packageManager}`;
        }
        try {
            const output = yield executeShellCommand(command);
            return `Installed packages for ${args.packageManager}:\n${output}`;
        }
        catch (error) {
            return `Error listing installed packages for ${args.packageManager}: ${error.message}`;
        }
    });
}
export const npmUninstallTool = {
    type: "function",
    function: {
        name: "npmUninstall",
        description: "Uninstalls an npm package globally or locally.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the npm package to uninstall.",
                },
                global: {
                    type: "boolean",
                    description: "Optional: If true, uninstalls the package globally. Defaults to false.",
                    nullable: true,
                },
            },
            required: ["packageName"],
        },
    },
};
export function executeNpmUninstallTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const uninstallCommand = args.global ? `npm uninstall -g ${args.packageName}` : `npm uninstall ${args.packageName}`;
        return executeShellCommand(uninstallCommand);
    });
}
export const pipUninstallTool = {
    type: "function",
    function: {
        name: "pipUninstall",
        description: "Uninstalls a Python package using pip.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the Python package to uninstall.",
                },
            },
            required: ["packageName"],
        },
    },
};
export function executePipUninstallTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const pythonExecutable = path.join(process.cwd(), '.venv', 'bin', 'python');
        const pipCommand = fs.existsSync(pythonExecutable) ? `${pythonExecutable} -m pip uninstall ${args.packageName}` : `pip uninstall ${args.packageName}`;
        return executeShellCommand(pipCommand);
    });
}
export const aptRemoveTool = {
    type: "function",
    function: {
        name: "aptRemove",
        description: "Removes a package using apt (for Debian/Ubuntu-based systems). Requires sudo privileges.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the package to remove.",
                },
            },
            required: ["packageName"],
        },
    },
};
export function executeAptRemoveTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() !== 'linux') {
            return "Error: apt is only available on Linux systems.";
        }
        return executeShellCommand(`sudo apt-get remove -y ${args.packageName}`);
    });
}
export const brewUninstallTool = {
    type: "function",
    function: {
        name: "brewUninstall",
        description: "Uninstalls a package using Homebrew (for macOS and Linux).",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the package to uninstall.",
                },
            },
            required: ["packageName"],
        },
    },
};
export function executeBrewUninstallTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() !== 'darwin' && os.platform() !== 'linux') {
            return "Error: Homebrew is primarily for macOS and Linux.";
        }
        return executeShellCommand(`brew uninstall ${args.packageName}`);
    });
}
export const chocoUninstallTool = {
    type: "function",
    function: {
        name: "chocoUninstall",
        description: "Uninstalls a package using Chocolatey (for Windows). Requires administrative privileges.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the package to uninstall.",
                },
            },
            required: ["packageName"],
        },
    },
};
export function executeChocoUninstallTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() !== 'win32') {
            return "Error: Chocolatey is only available on Windows systems.";
        }
        return executeShellCommand(`choco uninstall ${args.packageName} -y`);
    });
}
export const npmUpdateTool = {
    type: "function",
    function: {
        name: "npmUpdate",
        description: "Updates an npm package globally or locally.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the npm package to update. If omitted, updates all packages.",
                    nullable: true,
                },
                global: {
                    type: "boolean",
                    description: "Optional: If true, updates the package globally. Defaults to false.",
                    nullable: true,
                },
            },
            required: [],
        },
    },
};
export function executeNpmUpdateTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const updateCommand = args.global ? `npm update -g ${args.packageName || ''}` : `npm update ${args.packageName || ''}`;
        return executeShellCommand(updateCommand);
    });
}
export const pipUpdateTool = {
    type: "function",
    function: {
        name: "pipUpdate",
        description: "Updates a Python package using pip.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the Python package to update. If omitted, updates all packages.",
                    nullable: true,
                },
            },
            required: [],
        },
    },
};
export function executePipUpdateTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const pythonExecutable = path.join(process.cwd(), '.venv', 'bin', 'python');
        const pipCommand = fs.existsSync(pythonExecutable) ? `${pythonExecutable} -m pip install --upgrade ${args.packageName || ''}` : `pip install --upgrade ${args.packageName || ''}`;
        return executeShellCommand(pipCommand);
    });
}
export const aptUpdateTool = {
    type: "function",
    function: {
        name: "aptUpdate",
        description: "Updates packages using apt (for Debian/Ubuntu-based systems). Requires sudo privileges.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the package to update. If omitted, updates all packages.",
                    nullable: true,
                },
            },
            required: [],
        },
    },
};
export function executeAptUpdateTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() !== 'linux') {
            return "Error: apt is only available on Linux systems.";
        }
        const updateCommand = args.packageName ? `sudo apt-get update && sudo apt-get install --only-upgrade -y ${args.packageName}` : `sudo apt-get update && sudo apt-get upgrade -y`;
        return executeShellCommand(updateCommand);
    });
}
export const brewUpdateTool = {
    type: "function",
    function: {
        name: "brewUpdate",
        description: "Updates a package using Homebrew (for macOS and Linux).",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the package to update. If omitted, updates all packages.",
                    nullable: true,
                },
            },
            required: [],
        },
    },
};
export function executeBrewUpdateTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() !== 'darwin' && os.platform() !== 'linux') {
            return "Error: Homebrew is primarily for macOS and Linux.";
        }
        const updateCommand = args.packageName ? `brew upgrade ${args.packageName}` : `brew update && brew upgrade`;
        return executeShellCommand(updateCommand);
    });
}
export const chocoUpdateTool = {
    type: "function",
    function: {
        name: "chocoUpdate",
        description: "Updates a package using Chocolatey (for Windows). Requires administrative privileges.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the package to update. If omitted, updates all packages.",
                    nullable: true,
                },
            },
            required: [],
        },
    },
};
export function executeChocoUpdateTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() !== 'win32') {
            return "Error: Chocolatey is only available on Windows systems.";
        }
        const updateCommand = args.packageName ? `choco upgrade ${args.packageName} -y` : `choco upgrade all -y`;
        return executeShellCommand(updateCommand);
    });
}
export const installFromSourceTool = {
    type: "function",
    function: {
        name: "installFromSource",
        description: "Installs software from source code. This is a conceptual tool as the steps vary widely depending on the software and build system.",
        parameters: {
            type: "object",
            properties: {
                sourcePath: {
                    type: "string",
                    description: "The path to the source code directory.",
                },
                buildCommands: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of shell commands to build and install the software (e.g., ['./configure', 'make', 'sudo make install']).",
                },
            },
            required: ["sourcePath", "buildCommands"],
        },
    },
};
export function executeInstallFromSourceTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = `Attempting to install from source at ${args.sourcePath}.\n`;
        for (const command of args.buildCommands) {
            try {
                output += `Executing: ${command}\n`;
                const cmdOutput = yield executeShellCommand(command);
                output += `Output:\n${cmdOutput}\n`;
            }
            catch (error) {
                output += `Error executing command \"${command}\": ${error.message}\n`;
                return `Installation from source failed: ${output}`;
            }
        }
        return `Installation from source completed successfully:\n${output}`;
    });
}
export const createPackageTool = {
    type: "function",
    function: {
        name: "createPackage",
        description: "Creates a distributable package from source code using common tooling (npm, Python build, deb packages).",
        parameters: {
            type: "object",
            properties: {
                sourcePath: {
                    type: "string",
                    description: "The path to the source code directory.",
                },
                packageType: {
                    type: "string",
                    description: "The type of package to create (e.g., 'npm', 'pip', 'deb', 'rpm').",
                },
                outputDir: {
                    type: "string",
                    description: "Optional: The directory to save the created package. Defaults to current directory.",
                    nullable: true,
                },
            },
            required: ["sourcePath", "packageType"],
        },
    },
};
export function executeCreatePackageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const cwd = path.resolve(args.sourcePath);
        const out = args.outputDir ? path.resolve(args.outputDir) : cwd;
        let command;
        switch (args.packageType) {
            case 'npm':
                command = `npm pack ${cwd} --pack-destination ${out}`;
                break;
            case 'pip':
                command = `python -m build ${cwd} -o ${out}`;
                break;
            case 'deb':
                command = `dpkg-buildpackage -b -us -uc`;
                break;
            default:
                return `Unsupported package type: ${args.packageType}`;
        }
        try {
            const output = yield executeShellCommand(command);
            return `Package created using ${args.packageType}:\n${output}`;
        }
        catch (error) {
            return `Error creating package: ${error.message}`;
        }
    });
}
export const publishPackageTool = {
    type: "function",
    function: {
        name: "publishPackage",
        description: "Publishes a package to a registry using npm or twine when possible.",
        parameters: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "The name of the package to publish.",
                },
                registryUrl: {
                    type: "string",
                    description: "Optional: The URL of the package registry. Defaults to public registry.",
                    nullable: true,
                },
            },
            required: ["packageName"],
        },
    },
};
export function executePublishPackageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const cwd = path.resolve(args.packageName);
        let command = null;
        if (fs.existsSync(path.join(cwd, 'package.json'))) {
            command = `npm publish${args.registryUrl ? ' --registry ' + args.registryUrl : ''}`;
        }
        else if (fs.existsSync(path.join(cwd, 'setup.py')) || fs.existsSync(path.join(cwd, 'pyproject.toml'))) {
            const repoFlag = args.registryUrl ? ` --repository-url ${args.registryUrl}` : '';
            command = `twine upload${repoFlag} dist/*`;
        }
        if (!command) {
            return 'Unsupported package directory. Expecting package.json or setup.py.';
        }
        try {
            const output = yield executeShellCommand(command + '');
            return `Package published:\n${output}`;
        }
        catch (error) {
            return `Error publishing package: ${error.message}`;
        }
    });
}
export const runTestsTool = {
    type: "function",
    function: {
        name: "runTests",
        description: "Runs tests for a project using a specified test runner. This is a conceptual tool as test commands vary widely.",
        parameters: {
            type: "object",
            properties: {
                testRunner: {
                    type: "string",
                    description: "The command to run tests (e.g., 'npm test', 'pytest', 'jest').",
                },
                testPath: {
                    type: "string",
                    description: "Optional: The path to a specific test file or directory.",
                    nullable: true,
                },
            },
            required: ["testRunner"],
        },
    },
};
export function executeRunTestsTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const testPath = args.testPath ? ` ${args.testPath}` : '';
        const command = `${args.testRunner}${testPath}`;
        try {
            const output = yield executeShellCommand(command);
            return `Test run completed successfully:\n${output}`;
        }
        catch (error) {
            return `Error running tests: ${error.message}`;
        }
    });
}
export const generateDocumentationTool = {
    type: "function",
    function: {
        name: "generateDocumentation",
        description: "Generates documentation for a project using a specified documentation generator. This is a conceptual tool as documentation tools vary widely.",
        parameters: {
            type: "object",
            properties: {
                docGenerator: {
                    type: "string",
                    description: "The command to run the documentation generator (e.g., 'jsdoc', 'sphinx-build', 'doxygen').",
                },
                sourcePath: {
                    type: "string",
                    description: "The path to the source code or documentation files.",
                },
                outputPath: {
                    type: "string",
                    description: "The path where the generated documentation will be saved.",
                },
            },
            required: ["docGenerator", "sourcePath", "outputPath"],
        },
    },
};
export function executeGenerateDocumentationTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = `${args.docGenerator} ${args.sourcePath} ${args.outputPath}`;
        try {
            const output = yield executeShellCommand(command);
            return `Documentation generated successfully at ${args.outputPath}:\n${output}`;
        }
        catch (error) {
            return `Error generating documentation: ${error.message}`;
        }
    });
}
export const installFromGitTool = {
    type: "function",
    function: {
        name: "installFromGit",
        description: "Installs a package directly from a Git repository. This is a conceptual tool as the installation steps vary.",
        parameters: {
            type: "object",
            properties: {
                repoUrl: {
                    type: "string",
                    description: "The URL of the Git repository.",
                },
                installCommand: {
                    type: "string",
                    description: "The command to run after cloning the repository (e.g., 'npm install', 'pip install .').",
                },
                branch: {
                    type: "string",
                    description: "Optional: The branch to clone. Defaults to main/master.",
                    nullable: true,
                },
            },
            required: ["repoUrl", "installCommand"],
        },
    },
};
export function executeInstallFromGitTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const branchInfo = args.branch ? ` -b ${args.branch}` : '';
        const repoName = ((_a = args.repoUrl.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.git', '')) || 'repo';
        const cloneCommand = `git clone ${branchInfo} ${args.repoUrl} ${repoName}`;
        const fullCommand = `${cloneCommand} && cd ${repoName} && ${args.installCommand}`;
        try {
            const output = yield executeShellCommand(fullCommand);
            return `Successfully installed from Git repository: ${args.repoUrl}.\nOutput:\n${output}`;
        }
        catch (error) {
            return `Error installing from Git repository: ${error.message}`;
        }
    });
}
export const manageCronJobTool = {
    type: "function",
    function: {
        name: "manageCronJob",
        description: "Manages cron jobs on Linux/macOS systems (add, list, delete).",
        parameters: {
            type: "object",
            properties: {
                operation: {
                    type: "string",
                    enum: ["add", "list", "delete"],
                    description: "The operation to perform (add, list, or delete).",
                },
                schedule: {
                    type: "string",
                    description: "The cron schedule string (e.g., '0 0 * * *' for daily). Required for 'add' operation.",
                    nullable: true,
                },
                command: {
                    type: "string",
                    description: "The command to execute. Required for 'add' operation.",
                    nullable: true,
                },
                jobIdentifier: {
                    type: "string",
                    description: "An optional identifier comment for the cron job. Required when deleting and recommended when adding for easy removal.",
                    nullable: true,
                },
            },
            required: ["operation"],
        },
    },
};
export function executeManageCronJobTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() === 'win32') {
            return "Error: Cron jobs are not available on Windows. Use Task Scheduler tools instead.";
        }
        let cmd;
        switch (args.operation) {
            case "add":
                if (!args.schedule || !args.command) {
                    return "Error: 'schedule' and 'command' are required for adding a cron job.";
                }
                const entry = args.jobIdentifier
                    ? `${args.schedule} ${args.command} # ${args.jobIdentifier}`
                    : `${args.schedule} ${args.command}`;
                cmd = `(crontab -l 2>/dev/null; echo "${entry}") | crontab -`;
                break;
            case "list":
                cmd = `crontab -l`;
                break;
            case "delete":
                if (!args.jobIdentifier) {
                    return "Error: 'jobIdentifier' is required for deleting a cron job.";
                }
                cmd = `crontab -l | grep -v '${args.jobIdentifier}' | crontab -`;
                break;
            default:
                return `Error: Invalid operation: ${args.operation}`;
        }
        try {
            const output = yield executeShellCommand(cmd);
            return `Cron job operation '${args.operation}' successful:\n${output}`;
        }
        catch (error) {
            return `Error managing cron job: ${error.message}`;
        }
    });
}
