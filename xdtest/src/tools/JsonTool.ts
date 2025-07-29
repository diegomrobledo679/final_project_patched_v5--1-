import { Tool } from "../core/types.js";

export const jsonTool: Tool = {
  type: "function",
  function: {
    name: "parse_json",
    description: "Parses a JSON string and returns the resulting JavaScript object.",
    parameters: {
      type: "object",
      properties: {
        jsonString: {
          type: "string",
          description: "The JSON string to parse.",
        },
      },
      required: ["jsonString"],
    },
  },
};

export async function executeJsonTool(args: { jsonString: string }): Promise<string> {
  try {
    const parsed = JSON.parse(args.jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (error: any) {
    return `Error parsing JSON: ${error.message}`;
  }
}
