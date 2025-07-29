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
import * as fs from "fs";
import { exec } from "child_process";
import * as crypto from "crypto";
import * as path from "path";
import { executeShellCommand, commandExists } from "../utils/command.js";
export const scanOpenPortsTool = {
    type: "function",
    function: {
        name: "scanOpenPorts",
        description: "Scans for open ports on the local machine or a specified host. Requires appropriate network tools (e.g., nmap, netstat).",
        parameters: {
            type: "object",
            properties: {
                host: {
                    type: "string",
                    description: "Optional: The host to scan. Defaults to localhost.",
                    nullable: true,
                },
                ports: {
                    type: "string",
                    description: "Optional: A comma-separated list of ports or port ranges to scan (e.g., '80,443,8000-9000').",
                    nullable: true,
                },
            },
            required: [],
        },
    },
};
export function executeScanOpenPortsTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        const target = args.host || 'localhost';
        const portScan = args.ports ? `-p ${args.ports}` : '';
        if (os.platform() === 'win32') {
            // Windows: Use netstat or a conceptual nmap call
            command = `netstat -ano | findstr LISTENING`;
            if (args.host && args.host !== 'localhost') {
                return "Error: Remote port scanning on Windows requires nmap or similar tools not natively available via netstat.";
            }
        }
        else if (os.platform() === 'linux' || os.platform() === 'darwin') {
            // Linux/macOS: Prefer nmap if available, otherwise netstat
            try {
                if (!(yield commandExists('nmap'))) {
                    throw new Error('nmap not found');
                }
                command = `nmap ${portScan} ${target}`;
            }
            catch (e) {
                command = `netstat -tuln`; // Fallback to netstat for listening ports
                if (args.host && args.host !== 'localhost') {
                    return "Error: nmap not found. Remote port scanning requires nmap.";
                }
            }
        }
        else {
            return "Error: Port scanning is not supported on this operating system.";
        }
        try {
            const output = yield executeShellCommand(command);
            return `Open ports on ${target}:\n${output}`;
        }
        catch (error) {
            return `Error scanning ports: ${error.message}`;
        }
    });
}
export const checkFileIntegrityTool = {
    type: "function",
    function: {
        name: "checkFileIntegrity",
        description: "Calculates the SHA256 hash of a file to verify its integrity.",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file to check.",
                },
            },
            required: ["filePath"],
        },
    },
};
export function executeCheckFileIntegrityTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!fs.existsSync(args.filePath)) {
                return `Error: File not found at ${args.filePath}`;
            }
            const fileBuffer = fs.readFileSync(args.filePath);
            const hashSum = crypto.createHash('sha256');
            hashSum.update(fileBuffer);
            const fileHash = hashSum.digest('hex');
            return `SHA256 hash of ${args.filePath}: ${fileHash}`;
        }
        catch (error) {
            return `Error checking file integrity: ${error.message}`;
        }
    });
}
export const listActiveConnectionsTool = {
    type: "function",
    function: {
        name: "listActiveConnections",
        description: "Lists all active network connections on the system. Requires appropriate permissions.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
};
export function executeListActiveConnectionsTool() {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === 'win32') {
            command = `netstat -ano`;
        }
        else if (os.platform() === 'linux' || os.platform() === 'darwin') {
            command = `netstat -tulnap || ss -tulnap`; // Prefer ss on Linux if available
        }
        else {
            return "Error: Listing active connections is not supported on this operating system.";
        }
        try {
            const output = yield executeShellCommand(command);
            return `Active Network Connections:\n${output}`;
        }
        catch (error) {
            return `Error listing active connections: ${error.message}`;
        }
    });
}
export const scanForMalwareTool = {
    type: "function",
    function: {
        name: "scanForMalware",
        description: "Scans the system or a specified path for malware using available antivirus tools.",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "Optional: The path to scan. Defaults to the entire system (conceptual).",
                    nullable: true,
                },
            },
            required: [],
        },
    },
};
export function executeScanForMalwareTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const os = yield import('os');
        const target = args.path || (os.platform() === 'win32' ? 'C:\\' : '/');
        return new Promise((resolve) => {
            if (os.platform() === 'win32') {
                const psCmd = `Start-MpScan -ScanType CustomScan -ScanPath '${target}'`;
                exec(`powershell -Command "${psCmd}"`, (error, stdout, stderr) => {
                    if (error) {
                        resolve(`Malware scan failed: ${stderr || error.message}`);
                    }
                    else {
                        resolve(stdout || 'Scan completed.');
                    }
                });
            }
            else {
                commandExists('clamscan').then((available) => {
                    if (!available) {
                        resolve('ClamAV (clamscan) not found. Install clamav to enable malware scanning.');
                    }
                    else {
                        exec(`clamscan -r ${target}`, (error, stdout, stderr) => {
                            if (error) {
                                resolve(`Malware scan failed: ${stderr || error.message}`);
                            }
                            else {
                                resolve(stdout || 'Scan completed.');
                            }
                        });
                    }
                });
            }
        });
    });
}
export const analyzeSecurityLogsTool = {
    type: "function",
    function: {
        name: "analyzeSecurityLogs",
        description: "Analyzes security-related logs for suspicious activities or anomalies.",
        parameters: {
            type: "object",
            properties: {
                logType: {
                    type: "string",
                    description: "The type of security logs to analyze (e.g., 'auth.log', 'syslog', 'firewall').",
                },
                keywords: {
                    type: "string",
                    description: "Optional: Keywords to search for in the logs.",
                    nullable: true,
                },
            },
            required: ["logType"],
        },
    },
};
export function executeAnalyzeSecurityLogsTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const logPath = args.logType;
        if (!fs.existsSync(logPath)) {
            return `Log file ${logPath} not found.`;
        }
        const content = fs.readFileSync(logPath, 'utf-8');
        if (args.keywords) {
            const regex = new RegExp(args.keywords, 'gi');
            const matches = content.split(/\r?\n/).filter(line => regex.test(line));
            return matches.length > 0 ? matches.join('\n') : 'No matching log entries found.';
        }
        return content.split(/\r?\n/).slice(-50).join('\n');
    });
}
export const manageCryptographicKeysTool = {
    type: "function",
    function: {
        name: "manageCryptographicKeys",
        description: "Generates, stores, retrieves, and deletes simple RSA keys on disk.",
        parameters: {
            type: "object",
            properties: {
                operation: {
                    type: "string",
                    enum: ["generate", "store", "retrieve", "delete"],
                    description: "The cryptographic key operation to perform.",
                },
                keyName: {
                    type: "string",
                    description: "The name or identifier of the key.",
                },
                keyType: {
                    type: "string",
                    description: "Optional: The type of key (e.g., 'RSA', 'AES').",
                    nullable: true,
                },
                keyData: {
                    type: "string",
                    description: "Optional: Key material for the 'store' operation.",
                    nullable: true,
                },
            },
            required: ["operation", "keyName"],
        },
    },
};
export function executeManageCryptographicKeysTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const keyDir = path.resolve(process.cwd(), 'keys');
        if (!fs.existsSync(keyDir))
            fs.mkdirSync(keyDir);
        const baseName = path.join(keyDir, args.keyName);
        switch (args.operation) {
            case 'generate': {
                const { generateKeyPair } = yield import('crypto');
                return new Promise((resolve, reject) => {
                    generateKeyPair('rsa', { modulusLength: 2048 }, (err, publicKey, privateKey) => {
                        if (err) {
                            resolve(`Failed to generate key: ${err.message}`);
                        }
                        else {
                            fs.writeFileSync(`${baseName}.pem`, privateKey.export({ type: 'pkcs1', format: 'pem' }));
                            fs.writeFileSync(`${baseName}.pub`, publicKey.export({ type: 'pkcs1', format: 'pem' }));
                            resolve(`Generated RSA key pair at ${baseName}.pem and ${baseName}.pub`);
                        }
                    });
                });
            }
            case 'store': {
                if (!args.keyType) {
                    return 'keyType is required when storing a key';
                }
                if (!args.keyData) {
                    return 'keyData is required for storing a key';
                }
                const file = `${baseName}.${args.keyType === 'public' ? 'pub' : 'pem'}`;
                fs.writeFileSync(file, args.keyData);
                return `Stored key at ${file}`;
            }
            case 'retrieve': {
                let file = `${baseName}.pem`;
                if (args.keyType === 'public') {
                    file = `${baseName}.pub`;
                }
                if (!fs.existsSync(file)) {
                    return `Key not found for ${args.keyName}`;
                }
                const content = fs.readFileSync(file, 'utf-8');
                return content;
            }
            case 'delete': {
                try {
                    fs.unlinkSync(`${baseName}.pem`);
                    fs.unlinkSync(`${baseName}.pub`);
                    return `Deleted keys for ${args.keyName}.`;
                }
                catch (e) {
                    return `Failed to delete keys: ${e.message}`;
                }
            }
            default:
                return `Unsupported operation: ${args.operation}`;
        }
    });
}
