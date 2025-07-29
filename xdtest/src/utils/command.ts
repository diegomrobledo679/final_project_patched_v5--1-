import { exec } from "child_process";

export interface ExecOptions {
  /** Directory to execute the command in */
  cwd?: string;
  /** Shell to use, defaults to system default */
  shell?: string;
  /** Timeout in milliseconds before forcefully killing the command */
  timeout?: number;
}

export const executeShellCommand = (
  command: string,
  options: ExecOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd: options.cwd, shell: options.shell, timeout: options.timeout },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          resolve((stdout || stderr).trim());
        }
      }
    );
  });
};

export const commandExists = (command: string): Promise<boolean> => {
  const checkCmd = process.platform === 'win32' ? `where ${command}` : `which ${command}`;
  return new Promise((resolve) => {
    exec(checkCmd, (error) => {
      resolve(!error);
    });
  });
};

export const shellEscape = (arg: string): string => {
  if (process.platform === 'win32') {
    return `"${arg.replace(/"/g, '""')}"`;
  }
  return `'${arg.replace(/'/g, `'\\''`)}'`;
};
