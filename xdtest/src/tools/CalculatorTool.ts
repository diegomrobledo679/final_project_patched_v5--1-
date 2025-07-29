import { Tool } from "../core/types.js";

export const calculatorTool: Tool = {
  type: "function",
  function: {
    name: "calculator",
    description: "A simple calculator tool to perform basic arithmetic operations.",
    parameters: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["add", "subtract", "multiply", "divide"],
          description: "The arithmetic operation to perform.",
        },
        num1: {
          type: "number",
          description: "The first number.",
        },
        num2: {
          type: "number",
          description: "The second number.",
        },
      },
      required: ["operation", "num1", "num2"],
    },
  },
};

export async function executeCalculatorTool(args: { operation: string; num1: number; num2: number }): Promise<string> {
  const { operation, num1, num2 } = args;

  switch (operation) {
    case "add":
      return (num1 + num2).toString();
    case "subtract":
      return (num1 - num2).toString();
    case "multiply":
      return (num1 * num2).toString();
    case "divide":
      if (num2 === 0) {
        return "Error: Division by zero.";
      }
      return (num1 / num2).toString();
    default:
      return `Error: Unknown operation ${operation}`;
  }
}
