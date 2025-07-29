var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const jsonTool = {
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
export function executeJsonTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const parsed = JSON.parse(args.jsonString);
            return JSON.stringify(parsed, null, 2);
        }
        catch (error) {
            return `Error parsing JSON: ${error.message}`;
        }
    });
}
