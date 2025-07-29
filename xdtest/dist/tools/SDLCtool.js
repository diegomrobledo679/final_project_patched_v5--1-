var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { executeShellCommand } from "../utils/command.js";
export const createBranchTool = {
    type: "function",
    function: {
        name: "createBranch",
        description: "Creates a new version control branch using the Git CLI.",
        parameters: {
            type: "object",
            properties: {
                branchName: {
                    type: "string",
                    description: "The name of the new branch.",
                },
                baseBranch: {
                    type: "string",
                    description: "Optional: The branch to create the new branch from. Defaults to current branch.",
                    nullable: true,
                },
            },
            required: ["branchName"],
        },
    },
};
export function executeCreateBranchTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const base = args.baseBranch ? args.baseBranch : '';
        const command = base
            ? `git checkout ${base} && git checkout -b ${args.branchName}`
            : `git checkout -b ${args.branchName}`;
        try {
            const output = yield executeShellCommand(command);
            return output.trim() || `Created branch ${args.branchName}`;
        }
        catch (error) {
            return `Error creating branch: ${error.message}`;
        }
    });
}
export const mergeBranchTool = {
    type: "function",
    function: {
        name: "mergeBranch",
        description: "Merges a source branch into a target branch using Git.",
        parameters: {
            type: "object",
            properties: {
                sourceBranch: {
                    type: "string",
                    description: "The branch to merge from.",
                },
                targetBranch: {
                    type: "string",
                    description: "Optional: The branch to merge into. Defaults to current branch.",
                    nullable: true,
                },
            },
            required: ["sourceBranch"],
        },
    },
};
export function executeMergeBranchTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = args.targetBranch
            ? `git checkout ${args.targetBranch} && git merge ${args.sourceBranch}`
            : `git merge ${args.sourceBranch}`;
        try {
            const output = yield executeShellCommand(command);
            return output.trim() || 'Merge completed';
        }
        catch (error) {
            return `Error merging branch: ${error.message}`;
        }
    });
}
export const triggerCIBuildTool = {
    type: "function",
    function: {
        name: "triggerCIBuild",
        description: "Runs tests and builds the project, mimicking a CI build step.",
        parameters: {
            type: "object",
            properties: {
                projectName: {
                    type: "string",
                    description: "The name or identifier of the project.",
                },
                branch: {
                    type: "string",
                    description: "Optional: The branch to build. Defaults to main/master.",
                    nullable: true,
                },
            },
            required: ["projectName"],
        },
    },
};
export function executeTriggerCIBuildTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const initial = args.branch ? `git checkout ${args.branch} && ` : '';
        const command = `${initial}npm test && npm run build`;
        try {
            const output = yield executeShellCommand(command);
            return output.trim() || 'CI build completed';
        }
        catch (error) {
            return `CI build failed: ${error.message}`;
        }
    });
}
export const deployProjectTool = {
    type: "function",
    function: {
        name: "deployProject",
        description: "Runs the build script and reports deployment completion.",
        parameters: {
            type: "object",
            properties: {
                projectName: {
                    type: "string",
                    description: "The name or identifier of the project.",
                },
                environment: {
                    type: "string",
                    description: "The environment to deploy to (e.g., 'staging', 'production').",
                },
                version: {
                    type: "string",
                    description: "Optional: The version or commit hash to deploy.",
                    nullable: true,
                },
            },
            required: ["projectName", "environment"],
        },
    },
};
export function executeDeployProjectTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const version = args.version ? `--version ${args.version}` : '';
        const command = `npm run build ${version}`.trim();
        try {
            const output = yield executeShellCommand(command);
            return output.trim() || `Project ${args.projectName} deployed to ${args.environment}`;
        }
        catch (error) {
            return `Deployment failed: ${error.message}`;
        }
    });
}
export const runStaticAnalysisTool = {
    type: "function",
    function: {
        name: "runStaticAnalysis",
        description: "Runs ESLint for JavaScript/TypeScript or Pylint for Python projects.",
        parameters: {
            type: "object",
            properties: {
                projectPath: {
                    type: "string",
                    description: "The path to the project directory.",
                },
                language: {
                    type: "string",
                    description: "Optional: The primary programming language of the project.",
                    nullable: true,
                },
            },
            required: ["projectPath"],
        },
    },
};
export function executeRunStaticAnalysisTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const lang = (_a = args.language) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        let command;
        if (lang === 'python') {
            command = `pylint ${args.projectPath}`;
        }
        else {
            command = `npx eslint ${args.projectPath} --format stylish`;
        }
        try {
            const output = yield executeShellCommand(command);
            return output.trim() || 'Static analysis complete';
        }
        catch (error) {
            return `Static analysis failed: ${error.message}`;
        }
    });
}
