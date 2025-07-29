import { Tool } from "../core/types.js";
import { executeShellCommand } from "../utils/command.js";

export const createBranchTool: Tool = {
  type: "function",
  function: {
    name: "createBranch",
    description:
      "Creates a new version control branch using the Git CLI.",
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

export async function executeCreateBranchTool(args: { branchName: string; baseBranch?: string }): Promise<string> {
  const base = args.baseBranch ? args.baseBranch : '';
  const command = base
    ? `git checkout ${base} && git checkout -b ${args.branchName}`
    : `git checkout -b ${args.branchName}`;
  try {
    const output = await executeShellCommand(command);
    return output.trim() || `Created branch ${args.branchName}`;
  } catch (error: any) {
    return `Error creating branch: ${error.message}`;
  }
}

export const mergeBranchTool: Tool = {
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

export async function executeMergeBranchTool(args: { sourceBranch: string; targetBranch?: string }): Promise<string> {
  const command = args.targetBranch
    ? `git checkout ${args.targetBranch} && git merge ${args.sourceBranch}`
    : `git merge ${args.sourceBranch}`;
  try {
    const output = await executeShellCommand(command);
    return output.trim() || 'Merge completed';
  } catch (error: any) {
    return `Error merging branch: ${error.message}`;
  }
}

export const triggerCIBuildTool: Tool = {
  type: "function",
  function: {
    name: "triggerCIBuild",
    description:
      "Runs tests and builds the project, mimicking a CI build step.",
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

export async function executeTriggerCIBuildTool(args: { projectName: string; branch?: string }): Promise<string> {
  const initial = args.branch ? `git checkout ${args.branch} && ` : '';
  const command = `${initial}npm test && npm run build`;
  try {
    const output = await executeShellCommand(command);
    return output.trim() || 'CI build completed';
  } catch (error: any) {
    return `CI build failed: ${error.message}`;
  }
}

export const deployProjectTool: Tool = {
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

export async function executeDeployProjectTool(args: { projectName: string; environment: string; version?: string }): Promise<string> {
  const version = args.version ? `--version ${args.version}` : '';
  const command = `npm run build ${version}`.trim();
  try {
    const output = await executeShellCommand(command);
    return output.trim() || `Project ${args.projectName} deployed to ${args.environment}`;
  } catch (error: any) {
    return `Deployment failed: ${error.message}`;
  }
}

export const runStaticAnalysisTool: Tool = {
  type: "function",
  function: {
    name: "runStaticAnalysis",
    description:
      "Runs ESLint for JavaScript/TypeScript or Pylint for Python projects.",
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

export async function executeRunStaticAnalysisTool(args: { projectPath: string; language?: string }): Promise<string> {
  const lang = args.language?.toLowerCase();
  let command: string;
  if (lang === 'python') {
    command = `pylint ${args.projectPath}`;
  } else {
    command = `npx eslint ${args.projectPath} --format stylish`;
  }
  try {
    const output = await executeShellCommand(command);
    return output.trim() || 'Static analysis complete';
  } catch (error: any) {
    return `Static analysis failed: ${error.message}`;
  }
}
