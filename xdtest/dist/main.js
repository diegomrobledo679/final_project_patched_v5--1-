var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Interpreter } from "./core/Interpreter.js";
import { logger } from "./utils/logger.js";
import * as readline from "readline";
import minimist from "minimist";
import { config } from "./config.js";
// Import all tools and their execution functions
import { registerAllTools } from "./tools/register.js";
import { executeLaunchUITool } from "./tools/SystemIntegrationTool.js";
export function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        logger.info("Starting Open Interpreter CLI...");
        const argv = minimist(process.argv.slice(2));
        const envBool = (value, fallback) => {
            if (value === undefined)
                return fallback;
            return value.toLowerCase() === 'true';
        };
        const envNumber = (value, fallback) => {
            if (value === undefined)
                return fallback;
            const num = parseFloat(value);
            return isNaN(num) ? fallback : num;
        };
        const envString = (value, fallback) => {
            return value !== undefined ? value : fallback;
        };
        const options = Object.assign(Object.assign({}, argv), { autoRun: argv.autoRun !== undefined ? argv.autoRun : envBool(process.env.AUTO_RUN, true), loop: argv.loop !== undefined ? argv.loop : envBool(process.env.LOOP, config.defaultLoop), offline: argv.offline !== undefined ? argv.offline : envBool(process.env.OFFLINE, false), verbose: argv.verbose !== undefined ? argv.verbose : envBool(process.env.VERBOSE, false), debug: argv.debug !== undefined ? argv.debug : envBool(process.env.DEBUG, false), safeMode: argv.safeMode || process.env.SAFE_MODE || config.defaultSafeMode, maxOutput: argv.maxOutput !== undefined ? parseInt(argv.maxOutput, 10) : envNumber(process.env.MAX_OUTPUT, config.defaultMaxOutput), llmProvider: argv.llmProvider || process.env.LLM_PROVIDER || 'g4f', llmModel: argv.llmModel || process.env.LLM_MODEL, llmApiKey: argv.llmApiKey || process.env.LLM_API_KEY || (process.env.LLM_PROVIDER === 'ollama' ? process.env.OLLAMA_API_KEY : process.env.OPENAI_API_KEY), llmBaseUrl: argv.llmBaseUrl || process.env.LLM_BASE_URL || (process.env.LLM_PROVIDER === 'openai' ? process.env.OPENAI_BASE_URL : process.env.OLLAMA_BASE_URL), llmTemperature: argv.llmTemperature !== undefined ? parseFloat(argv.llmTemperature) : envNumber(process.env.LLM_TEMPERATURE, 0), llmMaxTokens: argv.llmMaxTokens !== undefined ? parseInt(argv.llmMaxTokens, 10) : envNumber(process.env.LLM_MAX_TOKENS, config.defaultMaxOutput), conversationHistoryPath: envString(argv.conversationHistoryPath, process.env.CONVERSATION_HISTORY_PATH), conversationFilename: envString(argv.conversationFilename, (_a = process.env.CONVERSATION_FILENAME) !== null && _a !== void 0 ? _a : config.conversationFilename), conversationMaxLength: argv.conversationMaxLength !== undefined ? parseInt(argv.conversationMaxLength, 10) : envNumber(process.env.CONVERSATION_MAX_LENGTH, undefined), skillsPath: envString(argv.skillsPath, process.env.SKILLS_PATH), importSkills: argv.importSkills !== undefined ? argv.importSkills : envBool(process.env.IMPORT_SKILLS, false), displayMode: envString(argv.displayMode, (_b = process.env.DISPLAY_MODE) !== null && _b !== void 0 ? _b : 'cli') });
        const interpreter = new Interpreter(options);
        if (options.displayMode === 'gui') {
            const msg = yield executeLaunchUITool({ uiName: process.env.UI_NAME || 'cyrah' });
            console.log(msg);
        }
        // Register all tools
        registerAllTools(interpreter);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        console.log("\nWelcome to Open Interpreter! Type your message or '/exit' to quit, '/reset' to clear conversation.");
        const chat = (initialMessage) => __awaiter(this, void 0, void 0, function* () {
            const userInput = initialMessage || (yield new Promise((resolve) => {
                rl.question("User: ", (answer) => {
                    resolve(answer);
                });
            }));
            if (userInput.toLowerCase() === '/exit') {
                logger.info("User initiated exit.");
                rl.close();
                return;
            }
            if (userInput.toLowerCase() === '/reset') {
                interpreter.reset();
                console.clear();
                logger.info("Conversation has been reset. Welcome to Open Interpreter! Type your message or '/exit' to quit, '/reset' to clear conversation.");
                chat();
                return;
            }
            if (userInput.toLowerCase() === 'cyrah') {
                const msg = yield executeLaunchUITool({ uiName: process.env.UI_NAME || 'cyrah' });
                console.log(msg);
                chat();
                return;
            }
            try {
                yield interpreter.chat(userInput);
            }
            catch (error) {
                logger.error(`Error during chat: ${error.message}`);
            }
            if (interpreter.loop) {
                chat(); // Continue loop
            }
            else if (!initialMessage) {
                chat(); // Keep asking for input if not in a loop and not from initial message
            }
        });
        // If there's a command line query, use it as the first message
        const initialQuery = argv._.join(' ');
        if (initialQuery) {
            yield chat(initialQuery);
            if (!options.loop) {
                rl.close();
            }
        }
        else {
            chat();
        }
    });
}
