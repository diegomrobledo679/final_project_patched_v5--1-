var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const calculatorTool = {
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
export function executeCalculatorTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
