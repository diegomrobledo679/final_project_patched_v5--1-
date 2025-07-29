
import { Tool } from "../core/types.js";
import * as fs from "fs";
import * as path from "path";

export const listDependenciesTool: Tool = {
  type: "function",
  function: {
    name: "listDependencies",
    description: "Analyzes common dependency configuration files (e.g., package.json, requirements.txt) and lists the project's dependencies.",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "The path to the dependency configuration file (e.g., package.json, requirements.txt, Cargo.toml).",
        },
      },
      required: ["filePath"],
    },
  },
};

export async function executeListDependenciesTool(args: { filePath: string }): Promise<string> {
  try {
    const content = fs.readFileSync(args.filePath, "utf-8");
    const fileName = path.basename(args.filePath);

    let dependencies: string[] = [];

    if (fileName === 'package.json') {
      const packageJson = JSON.parse(content);
      if (packageJson.dependencies) {
        dependencies = dependencies.concat(Object.keys(packageJson.dependencies).map(dep => `${dep}: ${packageJson.dependencies[dep]}`));
      }
      if (packageJson.devDependencies) {
        dependencies = dependencies.concat(Object.keys(packageJson.devDependencies).map(dep => `${dep}: ${packageJson.devDependencies[dep]} (dev)`));
      }
      if (packageJson.peerDependencies) {
        dependencies = dependencies.concat(Object.keys(packageJson.peerDependencies).map(dep => `${dep}: ${packageJson.peerDependencies[dep]} (peer)`));
      }
    } else if (fileName === 'requirements.txt') {
      dependencies = content.split(/\r\n|\r|\n/).filter(line => line.trim() !== '' && !line.startsWith('#'));
    } else if (fileName === 'Cargo.toml') {
      // Basic parsing for Cargo.toml
      const lines = content.split(/\r\n|\r|\n/);
      let inDependenciesSection = false;
      for (const line of lines) {
        if (line.trim() === '[dependencies]') {
          inDependenciesSection = true;
          continue;
        }
        if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
          inDependenciesSection = false;
        }
        if (inDependenciesSection && line.includes('=')) {
          const [depName, depVersion] = line.split('=').map(s => s.trim().replace(/\"/g, ''));
          dependencies.push(`${depName}: ${depVersion}`);
        }
      }
    } else {
      return `Unsupported dependency file type: ${fileName}. Supported: package.json, requirements.txt, Cargo.toml.`;
    }

    if (dependencies.length > 0) {
      return `Dependencies found in ${fileName}:\n${dependencies.join('\n')}`;
    } else {
      return `No dependencies found in ${fileName}.`;
    }
  } catch (error: any) {
    return `Error listing dependencies: ${error.message}`;
  }
}
