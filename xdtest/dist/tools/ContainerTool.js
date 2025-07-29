var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { executeShellCommand, commandExists } from "../utils/command.js";
function ensureDocker() {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield commandExists("docker")) {
            return null;
        }
        return "Docker CLI not found. Please install Docker to use container tools.";
    });
}
export const listContainersTool = {
    type: "function",
    function: {
        name: "listContainers",
        description: "Lists running or stopped Docker containers.",
        parameters: {
            type: "object",
            properties: {
                all: {
                    type: "boolean",
                    description: "Optional: If true, lists all containers (running and stopped). Defaults to false (only running).",
                    nullable: true,
                },
            },
            required: [],
        },
    },
};
export function executeListContainersTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const missing = yield ensureDocker();
        if (missing)
            return missing;
        const command = args.all ? "docker ps -a" : "docker ps";
        try {
            const output = yield executeShellCommand(command);
            return `Docker Containers:\n${output}`;
        }
        catch (error) {
            return `Error listing Docker containers: ${error.message}. Make sure Docker is installed and running.`;
        }
    });
}
export const startContainerTool = {
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
export function executeStartContainerTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const missing = yield ensureDocker();
        if (missing)
            return missing;
        const command = `docker start ${args.containerId}`;
        try {
            const output = yield executeShellCommand(command);
            return `Container ${args.containerId} started successfully.\n${output}`;
        }
        catch (error) {
            return `Error starting container ${args.containerId}: ${error.message}. Make sure Docker is installed and the container ID is correct.`;
        }
    });
}
export const stopContainerTool = {
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
export function executeStopContainerTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const missing = yield ensureDocker();
        if (missing)
            return missing;
        const command = `docker stop ${args.containerId}`;
        try {
            const output = yield executeShellCommand(command);
            return `Container ${args.containerId} stopped successfully.\n${output}`;
        }
        catch (error) {
            return `Error stopping container ${args.containerId}: ${error.message}. Make sure Docker is installed and the container ID is correct.`;
        }
    });
}
export const listContainerImagesTool = {
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
export function executeListContainerImagesTool() {
    return __awaiter(this, void 0, void 0, function* () {
        const missing = yield ensureDocker();
        if (missing)
            return missing;
        const command = "docker images";
        try {
            const output = yield executeShellCommand(command);
            return `Docker Images:\n${output}`;
        }
        catch (error) {
            return `Error listing Docker images: ${error.message}. Make sure Docker is installed and running.`;
        }
    });
}
export const buildContainerImageTool = {
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
                    description: "Optional: The name and optionally a tag in the 'name:tag' format.",
                    nullable: true,
                },
            },
            required: ["path"],
        },
    },
};
export function executeBuildContainerImageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const missing = yield ensureDocker();
        if (missing)
            return missing;
        const tag = args.tagName ? `-t ${args.tagName}` : "";
        const command = `docker build ${tag} ${args.path}`;
        try {
            const output = yield executeShellCommand(command);
            return `Docker image built successfully.\n${output}`;
        }
        catch (error) {
            return `Error building Docker image: ${error.message}.`;
        }
    });
}
export const pushContainerImageTool = {
    type: "function",
    function: {
        name: "pushContainerImage",
        description: "Pushes a Docker image to a registry.",
        parameters: {
            type: "object",
            properties: {
                imageName: {
                    type: "string",
                    description: "The name of the image to push (e.g., 'myrepo/myimage:latest').",
                },
            },
            required: ["imageName"],
        },
    },
};
export function executePushContainerImageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const missing = yield ensureDocker();
        if (missing)
            return missing;
        const command = `docker push ${args.imageName}`;
        try {
            const output = yield executeShellCommand(command);
            return `Docker image ${args.imageName} pushed successfully.\n${output}`;
        }
        catch (error) {
            return `Error pushing Docker image ${args.imageName}: ${error.message}.`;
        }
    });
}
export const pullContainerImageTool = {
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
export function executePullContainerImageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const missing = yield ensureDocker();
        if (missing)
            return missing;
        const command = `docker pull ${args.imageName}`;
        try {
            const output = yield executeShellCommand(command);
            return `Docker image ${args.imageName} pulled successfully.\n${output}`;
        }
        catch (error) {
            return `Error pulling Docker image ${args.imageName}: ${error.message}.`;
        }
    });
}
export const removeContainerImageTool = {
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
export function executeRemoveContainerImageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const missing = yield ensureDocker();
        if (missing)
            return missing;
        const command = `docker rmi ${args.imageId}`;
        try {
            const output = yield executeShellCommand(command);
            return `Docker image ${args.imageId} removed successfully.\n${output}`;
        }
        catch (error) {
            return `Error removing Docker image ${args.imageId}: ${error.message}.`;
        }
    });
}
