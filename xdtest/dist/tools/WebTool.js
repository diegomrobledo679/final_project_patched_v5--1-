var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
export const webFetchTool = {
    type: "function",
    function: {
        name: "webFetch",
        description: "Fetches the content of a given URL.",
        parameters: {
            type: "object",
            properties: {
                url: {
                    type: "string",
                    description: "The URL to fetch.",
                },
            },
            required: ["url"],
        },
    },
};
export function executeWebFetchTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(args.url);
            if (!response.ok) {
                return `Error: HTTP status ${response.status}`;
            }
            const text = yield response.text();
            return `Content from ${args.url}:\n${text.substring(0, 1000)}...`; // Limit output to 1000 characters
        }
        catch (error) {
            return `Error fetching URL: ${error.message}`;
        }
    });
}
export const httpRequestTool = {
    type: "function",
    function: {
        name: "httpRequest",
        description: "Performs an HTTP request to a specified URL with configurable method, headers, and body.",
        parameters: {
            type: "object",
            properties: {
                url: {
                    type: "string",
                    description: "The URL to send the request to.",
                },
                method: {
                    type: "string",
                    enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
                    description: "The HTTP method to use (e.g., GET, POST). Defaults to GET.",
                    default: "GET",
                },
                headers: {
                    type: "object",
                    description: "Optional: A JSON object of HTTP headers.",
                    nullable: true,
                },
                body: {
                    type: "string",
                    description: "Optional: The request body as a string.",
                    nullable: true,
                },
            },
            required: ["url"],
        },
    },
};
export function executeHttpRequestTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const response = yield axios({
                url: args.url,
                method: args.method,
                headers: args.headers,
                data: args.body,
            });
            return `HTTP Request to ${args.url} (${args.method || 'GET'}) successful. Status: ${response.status}. Data:\n${JSON.stringify(response.data, null, 2)}`;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return `HTTP Request to ${args.url} failed. Status: ${(_a = error.response) === null || _a === void 0 ? void 0 : _a.status}. Error: ${error.message}. Data: ${JSON.stringify((_b = error.response) === null || _b === void 0 ? void 0 : _b.data)}`;
            }
            return `Error performing HTTP request: ${error.message}`;
        }
    });
}
