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
export const createUserTool = {
    type: "function",
    function: {
        name: "createUser",
        description: "Creates a new system user. Requires appropriate permissions.",
        parameters: {
            type: "object",
            properties: {
                username: {
                    type: "string",
                    description: "The username for the new user.",
                },
                password: {
                    type: "string",
                    description: "Optional: The password for the new user.",
                    nullable: true,
                },
                homeDir: {
                    type: "string",
                    description: "Optional: The home directory for the new user.",
                    nullable: true,
                },
            },
            required: ["username"],
        },
    },
};
export function executeCreateUserTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = `net user ${args.username} ${args.password || ""} /add`;
            if (args.homeDir) {
                command += ` /homedir:"${args.homeDir}"`;
            }
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `sudo useradd ${args.username}`;
            if (args.homeDir) {
                command += ` -m -d "${args.homeDir}"`;
            }
            if (args.password) {
                command += ` && echo "${args.username}:${args.password}" | sudo chpasswd`;
            }
        }
        else {
            return "Error: User management is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
export const deleteUserTool = {
    type: "function",
    function: {
        name: "deleteUser",
        description: "Deletes a system user. Requires appropriate permissions.",
        parameters: {
            type: "object",
            properties: {
                username: {
                    type: "string",
                    description: "The username of the user to delete.",
                },
            },
            required: ["username"],
        },
    },
};
export function executeDeleteUserTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = `net user ${args.username} /delete`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `sudo userdel ${args.username}`;
        }
        else {
            return "Error: User management is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
export const createGroupTool = {
    type: "function",
    function: {
        name: "createGroup",
        description: "Creates a new system group. Requires appropriate permissions.",
        parameters: {
            type: "object",
            properties: {
                groupName: {
                    type: "string",
                    description: "The name for the new group.",
                },
            },
            required: ["groupName"],
        },
    },
};
export function executeCreateGroupTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = `net localgroup ${args.groupName} /add`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `sudo groupadd ${args.groupName}`;
        }
        else {
            return "Error: Group management is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
export const deleteGroupTool = {
    type: "function",
    function: {
        name: "deleteGroup",
        description: "Deletes a system group. Requires appropriate permissions.",
        parameters: {
            type: "object",
            properties: {
                groupName: {
                    type: "string",
                    description: "The name of the group to delete.",
                },
            },
            required: ["groupName"],
        },
    },
};
export function executeDeleteGroupTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = `net localgroup ${args.groupName} /delete`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `sudo groupdel ${args.groupName}`;
        }
        else {
            return "Error: Group management is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
export const addUserToGroupTool = {
    type: "function",
    function: {
        name: "addUserToGroup",
        description: "Adds an existing user to a system group. Requires appropriate permissions.",
        parameters: {
            type: "object",
            properties: {
                username: {
                    type: "string",
                    description: "The username to add to the group.",
                },
                groupName: { type: "string", description: "The name of the group." },
            },
            required: ["username", "groupName"],
        },
    },
};
export function executeAddUserToGroupTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = `net localgroup ${args.groupName} ${args.username} /add`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `sudo usermod -aG ${args.groupName} ${args.username}`;
        }
        else {
            return "Error: User and group management is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
export const removeUserFromGroupTool = {
    type: "function",
    function: {
        name: "removeUserFromGroup",
        description: "Removes a user from a system group. Requires appropriate permissions.",
        parameters: {
            type: "object",
            properties: {
                username: {
                    type: "string",
                    description: "The username to remove from the group.",
                },
                groupName: { type: "string", description: "The name of the group." },
            },
            required: ["username", "groupName"],
        },
    },
};
export function executeRemoveUserFromGroupTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let command;
        if (os.platform() === "win32") {
            command = `net localgroup ${args.groupName} ${args.username} /delete`;
        }
        else if (os.platform() === "linux" || os.platform() === "darwin") {
            command = `sudo gpasswd -d ${args.username} ${args.groupName}`;
        }
        else {
            return "Error: User and group management is not supported on this operating system.";
        }
        return executeShellCommand(command);
    });
}
