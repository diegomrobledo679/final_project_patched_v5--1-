import { Tool } from "../core/types.js";
import { executeShellCommand, commandExists } from "../utils/command.js";

async function ensureDocker(): Promise<string | null> {
  if (await commandExists("docker")) {
    return null;
  }
  return "Docker CLI not found. Please install Docker to use container tools.";
}

export const listContainersTool: Tool = {
  type: "function",
  function: {
    name: "listContainers",
    description: "Lists running or stopped Docker containers.",
    parameters: {
      type: "object",
      properties: {
        all: {
          type: "boolean",
          description:
            "Optional: If true, lists all containers (running and stopped). Defaults to false (only running).",
          nullable: true,
        },
      },
      required: [],
    },
  },
};

export async function executeListContainersTool(args: {
  all?: boolean;
}): Promise<string> {
  const missing = await ensureDocker();
  if (missing) return missing;
  const command = args.all ? "docker ps -a" : "docker ps";
  try {
    const output = await executeShellCommand(command);
    return `Docker Containers:\n${output}`;
  } catch (error: any) {
    return `Error listing Docker containers: ${error.message}. Make sure Docker is installed and running.`;
  }
}

export const startContainerTool: Tool = {
  type: "function",
  function: {
    name: "startContainer",
    description: "Starts a stopped Docker container.",
    parameters: {
      type: "object",
      properties: {
        containerId: {
          type: "string",
          description: "The ID or name of the container to start.",
        },
      },
      required: ["containerId"],
    },
  },
};

export async function executeStartContainerTool(args: {
  containerId: string;
}): Promise<string> {
  const missing = await ensureDocker();
  if (missing) return missing;
  const command = `docker start ${args.containerId}`;
  try {
    const output = await executeShellCommand(command);
    return `Container ${args.containerId} started successfully.\n${output}`;
  } catch (error: any) {
    return `Error starting container ${args.containerId}: ${error.message}. Make sure Docker is installed and the container ID is correct.`;
  }
}

export const stopContainerTool: Tool = {
  type: "function",
  function: {
    name: "stopContainer",
    description: "Stops a running Docker container.",
    parameters: {
      type: "object",
      properties: {
        containerId: {
          type: "string",
          description: "The ID or name of the container to stop.",
        },
      },
      required: ["containerId"],
    },
  },
};

export async function executeStopContainerTool(args: {
  containerId: string;
}): Promise<string> {
  const missing = await ensureDocker();
  if (missing) return missing;
  const command = `docker stop ${args.containerId}`;
  try {
    const output = await executeShellCommand(command);
    return `Container ${args.containerId} stopped successfully.\n${output}`;
  } catch (error: any) {
    return `Error stopping container ${args.containerId}: ${error.message}. Make sure Docker is installed and the container ID is correct.`;
  }
}

export const listContainerImagesTool: Tool = {
  type: "function",
  function: {
    name: "listContainerImages",
    description: "Lists Docker container images.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

export async function executeListContainerImagesTool(): Promise<string> {
  const missing = await ensureDocker();
  if (missing) return missing;
  const command = "docker images";
  try {
    const output = await executeShellCommand(command);
    return `Docker Images:\n${output}`;
  } catch (error: any) {
    return `Error listing Docker images: ${error.message}. Make sure Docker is installed and running.`;
  }
}

export const buildContainerImageTool: Tool = {
  type: "function",
  function: {
    name: "buildContainerImage",
    description: "Builds a Docker image from a Dockerfile.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The path to the Dockerfile and build context.",
        },
        tagName: {
          type: "string",
          description:
            "Optional: The name and optionally a tag in the 'name:tag' format.",
          nullable: true,
        },
      },
      required: ["path"],
    },
  },
};

export async function executeBuildContainerImageTool(args: {
  path: string;
  tagName?: string;
}): Promise<string> {
  const missing = await ensureDocker();
  if (missing) return missing;
  const tag = args.tagName ? `-t ${args.tagName}` : "";
  const command = `docker build ${tag} ${args.path}`;
  try {
    const output = await executeShellCommand(command);
    return `Docker image built successfully.\n${output}`;
  } catch (error: any) {
    return `Error building Docker image: ${error.message}.`;
  }
}

export const pushContainerImageTool: Tool = {
  type: "function",
  function: {
    name: "pushContainerImage",
    description: "Pushes a Docker image to a registry.",
    parameters: {
      type: "object",
      properties: {
        imageName: {
          type: "string",
          description:
            "The name of the image to push (e.g., 'myrepo/myimage:latest').",
        },
      },
      required: ["imageName"],
    },
  },
};

export async function executePushContainerImageTool(args: {
  imageName: string;
}): Promise<string> {
  const missing = await ensureDocker();
  if (missing) return missing;
  const command = `docker push ${args.imageName}`;
  try {
    const output = await executeShellCommand(command);
    return `Docker image ${args.imageName} pushed successfully.\n${output}`;
  } catch (error: any) {
    return `Error pushing Docker image ${args.imageName}: ${error.message}.`;
  }
}

export const pullContainerImageTool: Tool = {
  type: "function",
  function: {
    name: "pullContainerImage",
    description: "Pulls a Docker image from a registry.",
    parameters: {
      type: "object",
      properties: {
        imageName: {
          type: "string",
          description: "The name of the image to pull (e.g., 'ubuntu:latest').",
        },
      },
      required: ["imageName"],
    },
  },
};

export async function executePullContainerImageTool(args: {
  imageName: string;
}): Promise<string> {
  const missing = await ensureDocker();
  if (missing) return missing;
  const command = `docker pull ${args.imageName}`;
  try {
    const output = await executeShellCommand(command);
    return `Docker image ${args.imageName} pulled successfully.\n${output}`;
  } catch (error: any) {
    return `Error pulling Docker image ${args.imageName}: ${error.message}.`;
  }
}

export const removeContainerImageTool: Tool = {
  type: "function",
  function: {
    name: "removeContainerImage",
    description: "Removes a Docker image by ID or name.",
    parameters: {
      type: "object",
      properties: {
        imageId: {
          type: "string",
          description: "The ID or name of the image to remove.",
        },
      },
      required: ["imageId"],
    },
  },
};

export async function executeRemoveContainerImageTool(args: {
  imageId: string;
}): Promise<string> {
  const missing = await ensureDocker();
  if (missing) return missing;
  const command = `docker rmi ${args.imageId}`;
  try {
    const output = await executeShellCommand(command);
    return `Docker image ${args.imageId} removed successfully.\n${output}`;
  } catch (error: any) {
    return `Error removing Docker image ${args.imageId}: ${error.message}.`;
  }
}
