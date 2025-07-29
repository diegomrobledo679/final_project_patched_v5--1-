import { Tool } from "../core/types.js";
import axios from 'axios';

export const webFetchTool: Tool = {
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

export async function executeWebFetchTool(args: { url: string }): Promise<string> {
  try {
    const response = await fetch(args.url);
    if (!response.ok) {
      return `Error: HTTP status ${response.status}`;
    }
    const text = await response.text();
    return `Content from ${args.url}:\n${text.substring(0, 1000)}...`; // Limit output to 1000 characters
  } catch (error: any) {
    return `Error fetching URL: ${error.message}`;
  }
}

export const httpRequestTool: Tool = {
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

export async function executeHttpRequestTool(args: { url: string; method?: string; headers?: Record<string, string>; body?: string }): Promise<string> {
  try {
    const response = await axios({
      url: args.url,
      method: args.method,
      headers: args.headers,
      data: args.body,
    });
    return `HTTP Request to ${args.url} (${args.method || 'GET'}) successful. Status: ${response.status}. Data:\n${JSON.stringify(response.data, null, 2)}`;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return `HTTP Request to ${args.url} failed. Status: ${error.response?.status}. Error: ${error.message}. Data: ${JSON.stringify(error.response?.data)}`;
    }
    return `Error performing HTTP request: ${error.message}`;
  }
}