import { exec } from "child_process";
export const executeShellCommand = (command, options = {}) => {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: options.cwd, shell: options.shell, timeout: options.timeout }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
            }
            else {
                resolve((stdout || stderr).trim());
            }
        });
    });
};
export const commandExists = (command) => {
    const checkCmd = process.platform === 'win32' ? `where ${command}` : `which ${command}`;
    return new Promise((resolve) => {
        exec(checkCmd, (error) => {
            resolve(!error);
        });
    });
};
export const shellEscape = (arg) => {
    if (process.platform === 'win32') {
        return `"${arg.replace(/"/g, '""')}"`;
    }
    return `'${arg.replace(/'/g, `'\\''`)}'`;
};
