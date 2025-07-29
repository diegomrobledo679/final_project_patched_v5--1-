import { Tool } from "../core/types.js";
import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from "../utils/logger.js";

export const searchTool: Tool = {
  type: "function",
  function: {
    name: "search",
    description: "Performs a web search using Google and returns the top results with titles, links, and snippets.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query.",
        },
      },
      required: ["query"],
    },
  },
};

export async function executeSearchTool(args: { query: string }): Promise<string> {
  try {
    const searchQuery = encodeURIComponent(args.query);
    const url = `https://www.google.com/search?q=${searchQuery}`;

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const results: { title: string; link: string; snippet: string }[] = [];

    $('div.g').each((i, el) => {
      if (results.length >= 5) return; // Limit to 5 results

      const title = $(el).find('h3').text();
      const link = $(el).find('a').attr('href');
      const snippet = $(el).find('div[data-sncf="1"]').text();

      if (title && link) {
        results.push({ title, link, snippet });
      }
    });

    if (results.length > 0) {
        return `Search results for "${args.query}":\n\n` + results.map(r => `Title: ${r.title}\nLink: ${r.link}\nSnippet: ${r.snippet}`).join('\n\n');
    }

    return `No search results found for "${args.query}".`;

  } catch (error: any) {
    logger.error(`Error performing search for query: ${args.query}`, error);
    return `Error performing search: ${error.message}`;
  }
}