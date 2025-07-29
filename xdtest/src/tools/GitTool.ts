
import { Tool } from "../core/types.js";
import { exec } from "child_process";

export const gitStatusTool: Tool = {
  type: "function",
  function: {
    name: "gitStatus",
    description: "Retrieves the current status of the Git repository, showing modified, staged, and untracked files.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

export async function executeGitStatusTool(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('git status', (error, stdout, stderr) => {
      if (error) {
        reject(`Error getting Git status: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

export const gitDiffTool: Tool = {
  type: "function",
  function: {
    name: "gitDiff",
    description: "Shows changes between commits, commit and working tree, etc. Can be used to inspect specific files or the entire repository.",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Optional: The path to a specific file to show differences for. If omitted, shows diff for the entire repository.",
          nullable: true,
        },
        staged: {
          type: "boolean",
          description: "Optional: If true, shows the diff for staged changes. Defaults to false (shows changes in working directory not yet staged).",
          nullable: true,
        },
      },
      required: [],
    },
  },
};

export async function executeGitDiffTool(args: { filePath?: string; staged?: boolean }): Promise<string> {
  return new Promise((resolve, reject) => {
    let command = 'git diff';
    if (args.staged) {
      command += ' --staged';
    }
    if (args.filePath) {
      command += ` ${args.filePath}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error getting Git diff: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

export const gitAddTool: Tool = {
  type: "function",
  function: {
    name: "gitAdd",
    description: "Adds file contents to the index (stages changes).",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "The path to the file or directory to add. Use '.' to add all changes.",
        },
      },
      required: ["filePath"],
    },
  },
};

export async function executeGitAddTool(args: { filePath: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`git add ${args.filePath}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error adding file to Git: ${stderr}`);
      } else {
        resolve(stdout || `Successfully added ${args.filePath}`);
      }
    });
  });
}

export const gitCommitTool: Tool = {
  type: "function",
  function: {
    name: "gitCommit",
    description: "Records changes to the repository with a commit message.",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The commit message.",
        },
      },
      required: ["message"],
    },
  },
};

export async function executeGitCommitTool(args: { message: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`git commit -m "${args.message}"`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error committing changes: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

export const gitLogTool: Tool = {
  type: "function",
  function: {
    name: "gitLog",
    description: "Shows the commit logs.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Optional: Limit the number of commits to output. Defaults to 5.",
          nullable: true,
        },
      },
      required: [],
    },
  },
};

export async function executeGitLogTool(args: { limit?: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    const limit = args.limit ? `-n ${args.limit}` : '-n 5';
    exec(`git log ${limit}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error getting Git log: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}
