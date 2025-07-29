import { Tool } from "../core/types.js";
import * as fs from "fs";
import * as path from "path";
import { executeShellCommand } from "../utils/command.js";
export const zipCompressTool: Tool = {
  type: "function",
  function: {
    name: "zipCompress",
    description: "Compresses a file or directory into a .zip archive.",
    parameters: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "The path to the file or directory to compress.",
        },
        outputPath: {
          type: "string",
          description:
            "The path for the output .zip file (e.g., 'archive.zip').",
        },
      },
      required: ["inputPath", "outputPath"],
    },
  },
};
export async function executeZipCompressTool(args: {
  inputPath: string;
  outputPath: string;
}): Promise<string> {
  const command = `zip -r ${args.outputPath} ${args.inputPath}`;
  return executeShellCommand(command);
}
export const zipDecompressTool: Tool = {
  type: "function",
  function: {
    name: "zipDecompress",
    description: "Decompresses a .zip archive to a specified directory.",
    parameters: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "The path to the .zip archive to decompress.",
        },
        outputPath: {
          type: "string",
          description:
            "The path to the directory where contents will be extracted.",
        },
      },
      required: ["inputPath", "outputPath"],
    },
  },
};
export async function executeZipDecompressTool(args: {
  inputPath: string;
  outputPath: string;
}): Promise<string> {
  if (!fs.existsSync(args.outputPath)) {
    fs.mkdirSync(args.outputPath, { recursive: true });
  }
  const command = `unzip ${args.inputPath} -d ${args.outputPath}`;
  return executeShellCommand(command);
}
export const tarCompressTool: Tool = {
  type: "function",
  function: {
    name: "tarCompress",
    description: "Compresses a file or directory into a .tar.gz archive.",
    parameters: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "The path to the file or directory to compress.",
        },
        outputPath: {
          type: "string",
          description:
            "The path for the output .tar.gz file (e.g., 'archive.tar.gz').",
        },
      },
      required: ["inputPath", "outputPath"],
    },
  },
};
export async function executeTarCompressTool(args: {
  inputPath: string;
  outputPath: string;
}): Promise<string> {
  const command = `tar -czf ${args.outputPath} ${args.inputPath}`;
  return executeShellCommand(command);
}
export const tarDecompressTool: Tool = {
  type: "function",
  function: {
    name: "tarDecompress",
    description: "Decompresses a .tar.gz archive to a specified directory.",
    parameters: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "The path to the .tar.gz archive to decompress.",
        },
        outputPath: {
          type: "string",
          description:
            "The path to the directory where contents will be extracted.",
        },
      },
      required: ["inputPath", "outputPath"],
    },
  },
};
export async function executeTarDecompressTool(args: {
  inputPath: string;
  outputPath: string;
}): Promise<string> {
  if (!fs.existsSync(args.outputPath)) {
    fs.mkdirSync(args.outputPath, { recursive: true });
  }
  const command = `tar -xzf ${args.inputPath} -C ${args.outputPath}`;
  return executeShellCommand(command);
}
