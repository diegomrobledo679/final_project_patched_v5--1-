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
import * as cheerio from 'cheerio';
export const webResearchTool = {
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
export function executeWebResearchTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const q = encodeURIComponent(args.query);
            const resultsToFetch = (_a = args.numResults) !== null && _a !== void 0 ? _a : 3;
            const searchUrl = `https://www.google.com/search?q=${q}`;
            const { data } = yield axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(data);
            const results = [];
            $('div.g').each((i, el) => {
                if (results.length >= resultsToFetch)
                    return;
                const link = $(el).find('a').attr('href');
                const title = $(el).find('h3').text();
                if (link && title) {
                    results.push({ title, link });
                }
            });
            const summaries = [];
            for (const result of results) {
                try {
                    const res = yield axios.get(result.link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                    const page = cheerio.load(res.data);
                    const text = page('body').text().replace(/\s+/g, ' ').trim();
                    summaries.push(`${result.title}: ${text.substring(0, 200)}... (${result.link})`);
                }
                catch (_b) {
                    summaries.push(`${result.title}: Unable to fetch (${result.link})`);
                }
            }
            return summaries.length > 0
                ? `Web research results for "${args.query}":\n` + summaries.join('\n')
                : `No web research results found for "${args.query}".`;
        }
        catch (error) {
            return `Error performing web research: ${error.message}`;
        }
    });
}
