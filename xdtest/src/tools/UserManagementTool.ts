import { Tool } from "../core/types.js";
import * as os from "os";
import { executeShellCommand } from "../utils/command.js";
export const createUserTool: Tool = {
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
export async function executeCreateUserTool(args: {
  username: string;
  password?: string;
  homeDir?: string;
}): Promise<string> {
  let command: string;
  if (os.platform() === "win32") {
    command = `net user ${args.username} ${args.password || ""} /add`;
    if (args.homeDir) {
      command += ` /homedir:"${args.homeDir}"`;
    }
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    command = `sudo useradd ${args.username}`;
    if (args.homeDir) {
      command += ` -m -d "${args.homeDir}"`;
    }
    if (args.password) {
      command += ` && echo "${args.username}:${args.password}" | sudo chpasswd`;
    }
  } else {
    return "Error: User management is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
export const deleteUserTool: Tool = {
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
export async function executeDeleteUserTool(args: {
  username: string;
}): Promise<string> {
  let command: string;
  if (os.platform() === "win32") {
    command = `net user ${args.username} /delete`;
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    command = `sudo userdel ${args.username}`;
  } else {
    return "Error: User management is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
export const createGroupTool: Tool = {
  type: "function",
  function: {
    name: "createGroup",
    description:
      "Creates a new system group. Requires appropriate permissions.",
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
export async function executeCreateGroupTool(args: {
  groupName: string;
}): Promise<string> {
  let command: string;
  if (os.platform() === "win32") {
    command = `net localgroup ${args.groupName} /add`;
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    command = `sudo groupadd ${args.groupName}`;
  } else {
    return "Error: Group management is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
export const deleteGroupTool: Tool = {
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
export async function executeDeleteGroupTool(args: {
  groupName: string;
}): Promise<string> {
  let command: string;
  if (os.platform() === "win32") {
    command = `net localgroup ${args.groupName} /delete`;
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    command = `sudo groupdel ${args.groupName}`;
  } else {
    return "Error: Group management is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
export const addUserToGroupTool: Tool = {
  type: "function",
  function: {
    name: "addUserToGroup",
    description:
      "Adds an existing user to a system group. Requires appropriate permissions.",
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
export async function executeAddUserToGroupTool(args: {
  username: string;
  groupName: string;
}): Promise<string> {
  let command: string;
  if (os.platform() === "win32") {
    command = `net localgroup ${args.groupName} ${args.username} /add`;
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    command = `sudo usermod -aG ${args.groupName} ${args.username}`;
  } else {
    return "Error: User and group management is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
export const removeUserFromGroupTool: Tool = {
  type: "function",
  function: {
    name: "removeUserFromGroup",
    description:
      "Removes a user from a system group. Requires appropriate permissions.",
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
export async function executeRemoveUserFromGroupTool(args: {
  username: string;
  groupName: string;
}): Promise<string> {
  let command: string;
  if (os.platform() === "win32") {
    command = `net localgroup ${args.groupName} ${args.username} /delete`;
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    command = `sudo gpasswd -d ${args.username} ${args.groupName}`;
  } else {
    return "Error: User and group management is not supported on this operating system.";
  }
  return executeShellCommand(command);
}
