import { Tool } from "../core/types.js";
import axios from 'axios';
import * as cheerio from 'cheerio';

export const webResearchTool: Tool = {
  type: "function",
  function: {
    name: "webResearch",
    description: "Performs a web search and fetches short summaries from the top results.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query.",
        },
        numResults: {
          type: "number",
          description: "Optional: number of results to summarize. Defaults to 3.",
          nullable: true,
        },
      },
      required: ["query"],
    },
  },
};

export async function executeWebResearchTool(args: { query: string; numResults?: number }): Promise<string> {
  try {
    const q = encodeURIComponent(args.query);
    const resultsToFetch = args.numResults ?? 3;
    const searchUrl = `https://www.google.com/search?q=${q}`;
    const { data } = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const results: { title: string; link: string }[] = [];
    $('div.g').each((i, el) => {
      if (results.length >= resultsToFetch) return;
      const link = $(el).find('a').attr('href');
      const title = $(el).find('h3').text();
      if (link && title) {
        results.push({ title, link });
      }
    });

    const summaries: string[] = [];
    for (const result of results) {
      try {
        const res = await axios.get(result.link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const page = cheerio.load(res.data);
        const text = page('body').text().replace(/\s+/g, ' ').trim();
        summaries.push(`${result.title}: ${text.substring(0, 200)}... (${result.link})`);
      } catch {
        summaries.push(`${result.title}: Unable to fetch (${result.link})`);
      }
    }

    return summaries.length > 0
      ? `Web research results for "${args.query}":\n` + summaries.join('\n')
      : `No web research results found for "${args.query}".`;
  } catch (error: any) {
    return `Error performing web research: ${error.message}`;
  }
}
