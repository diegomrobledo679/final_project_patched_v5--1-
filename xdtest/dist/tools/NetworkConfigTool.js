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
import { executeShellCommand } from "../utils/command.js";
export const getNetworkConfigTool = {
    type: "function",
    function: {
        name: "getNetworkConfig",
        description: "Displays the network configuration of the system's interfaces.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
};
export function executeGetNetworkConfigTool() {
    return __awaiter(this, void 0, void 0, function* () {
        const command = os.platform() === 'win32' ? 'ipconfig /all' : 'ifconfig -a || ip a';
        return executeShellCommand(command);
    });
}
export const flushDnsCacheTool = {
    type: "function",
    function: {
        name: "flushDnsCache",
        description: "Flushes the DNS resolver cache.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
};
export function executeFlushDnsCacheTool() {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === 'win32') {
            command = 'ipconfig /flushdns';
        }
        else if (os.platform() === 'darwin') {
            command = 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder';
        }
        else if (os.platform() === 'linux') {
            command = 'sudo systemctl restart systemd-resolved || sudo /etc/init.d/nscd restart';
        }
        else {
            return 'Error: Flushing DNS cache is not supported on this operating system.';
        }
        return executeShellCommand(command);
    });
}
export const addFirewallRuleTool = {
    type: "function",
    function: {
        name: "addFirewallRule",
        description: "Adds a firewall rule to allow or block traffic. Requires appropriate permissions.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "A unique name for the firewall rule." },
                action: { type: "string", enum: ["allow", "block"], description: "The action to perform." },
                direction: { type: "string", enum: ["in", "out"], description: "The traffic direction." },
                port: { type: "number", description: "Optional port number.", nullable: true },
                protocol: { type: "string", enum: ["tcp", "udp", "any"], description: "Protocol", default: "any", nullable: true },
                ipAddress: { type: "string", description: "Optional IP address or range.", nullable: true },
            },
            required: ["name", "action", "direction"],
        },
    },
};
export function executeAddFirewallRuleTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        const { name, action, direction, port, protocol, ipAddress } = args;
        if (os.platform() === 'win32') {
            const portStr = port ? `localport=${port}` : '';
            const protocolStr = protocol && protocol !== 'any' ? `protocol=${protocol}` : '';
            const remoteIpStr = ipAddress ? `remoteip=${ipAddress}` : '';
            command = `netsh advfirewall firewall add rule name="${name}" dir=${direction} action=${action} ${portStr} ${protocolStr} ${remoteIpStr}`;
        }
        else if (os.platform() === 'linux') {
            const portStr = port ? `proto ${protocol || 'any'} to any port ${port}` : '';
            const ipStr = ipAddress ? `from ${ipAddress}` : '';
            command = `sudo ufw ${action} ${direction} ${portStr} ${ipStr}`;
        }
        else {
            return 'Error: Firewall management is not supported on this operating system.';
        }
        return executeShellCommand(command);
    });
}
export const deleteFirewallRuleTool = {
    type: "function",
    function: {
        name: "deleteFirewallRule",
        description: "Deletes a firewall rule by name.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "The name of the firewall rule to delete." },
            },
            required: ["name"],
        },
    },
};
export function executeDeleteFirewallRuleTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        const { name } = args;
        if (os.platform() === 'win32') {
            command = `netsh advfirewall firewall delete rule name="${name}"`;
        }
        else if (os.platform() === 'linux') {
            command = `sudo ufw delete allow name="${name}" || sudo ufw delete deny name="${name}"`;
        }
        else {
            return 'Error: Firewall management is not supported on this operating system.';
        }
        return executeShellCommand(command);
    });
}
