import { Interpreter } from "./core/Interpreter.js";
import { logger } from "./utils/logger.js";
import * as readline from "readline";
import { InterpreterOptions } from "./core/InterpreterOptions.js";
import minimist from "minimist";
import { config } from "./config.js";

// Import all tools and their execution functions
import { registerAllTools } from "./tools/register.js";
import { executeLaunchUITool } from "./tools/SystemIntegrationTool.js";

export async function main() {
  logger.info("Starting Open Interpreter CLI...");

  const argv = minimist(process.argv.slice(2));

  const envBool = (value: string | undefined, fallback: boolean) => {
    if (value === undefined) return fallback;
    return value.toLowerCase() === 'true';
  };

  const envNumber = (value: string | undefined, fallback?: number) => {
    if (value === undefined) return fallback;
    const num = parseFloat(value);
    return isNaN(num) ? fallback : num;
  };

  const envString = (value: string | undefined, fallback?: string) => {
    return value !== undefined ? value : fallback;
  };

  const options: InterpreterOptions = {
    ...argv, // Pass all command-line arguments to options
    autoRun: argv.autoRun !== undefined ? argv.autoRun : envBool(process.env.AUTO_RUN, true),
    loop: argv.loop !== undefined ? argv.loop : envBool(process.env.LOOP, config.defaultLoop),
    offline: argv.offline !== undefined ? argv.offline : envBool(process.env.OFFLINE, false),
    verbose: argv.verbose !== undefined ? argv.verbose : envBool(process.env.VERBOSE, false),
    debug: argv.debug !== undefined ? argv.debug : envBool(process.env.DEBUG, false),
    safeMode: argv.safeMode || process.env.SAFE_MODE || config.defaultSafeMode,
    maxOutput: argv.maxOutput !== undefined ? parseInt(argv.maxOutput, 10) : envNumber(process.env.MAX_OUTPUT, config.defaultMaxOutput),
    llmProvider: argv.llmProvider || process.env.LLM_PROVIDER || 'g4f.dev',
    llmModel: argv.llmModel || process.env.LLM_MODEL,
    llmApiKey: argv.llmApiKey || process.env.LLM_API_KEY || (process.env.LLM_PROVIDER === 'ollama' ? process.env.OLLAMA_API_KEY : process.env.OPENAI_API_KEY),
    llmBaseUrl: argv.llmBaseUrl || process.env.LLM_BASE_URL || (process.env.LLM_PROVIDER === 'openai' ? process.env.OPENAI_BASE_URL : process.env.OLLAMA_BASE_URL),
    llmTemperature: argv.llmTemperature !== undefined ? parseFloat(argv.llmTemperature) : envNumber(process.env.LLM_TEMPERATURE, 0),
    llmMaxTokens: argv.llmMaxTokens !== undefined ? parseInt(argv.llmMaxTokens, 10) : envNumber(process.env.LLM_MAX_TOKENS, config.defaultMaxOutput),
    conversationHistoryPath: envString(argv.conversationHistoryPath, process.env.CONVERSATION_HISTORY_PATH),
    conversationFilename: envString(argv.conversationFilename, process.env.CONVERSATION_FILENAME ?? config.conversationFilename),
    conversationMaxLength: argv.conversationMaxLength !== undefined ? parseInt(argv.conversationMaxLength, 10) : envNumber(process.env.CONVERSATION_MAX_LENGTH, undefined as any),
    skillsPath: envString(argv.skillsPath, process.env.SKILLS_PATH),
    importSkills: argv.importSkills !== undefined ? argv.importSkills : envBool(process.env.IMPORT_SKILLS, false),
    displayMode: envString(argv.displayMode, process.env.DISPLAY_MODE ?? 'cli') as 'cli' | 'gui',
    // ... other options from original file
  };

  const interpreter = new Interpreter(options);

  if (options.displayMode === 'gui') {
    const msg = await executeLaunchUITool({ uiName: process.env.UI_NAME || 'cyrah' });
    console.log(msg);
  }

  // Register all tools
  registerAllTools(interpreter);


  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\nWelcome to Open Interpreter! Type your message or '/exit' to quit, '/reset' to clear conversation.");

  const chat = async (initialMessage?: string) => {
    const userInput: string = initialMessage || await new Promise((resolve) => {
      rl.question("User: ", (answer) => {
        resolve(answer);
      });
    });

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
      const msg = await executeLaunchUITool({ uiName: process.env.UI_NAME || 'cyrah' });
      console.log(msg);
      chat();
      return;
    }

    try {
      await interpreter.chat(userInput);
    } catch (error: any) {
      logger.error(`Error during chat: ${error.message}`);
    }

    if (interpreter.loop) {
        chat(); // Continue loop
    } else if (!initialMessage) {
        chat(); // Keep asking for input if not in a loop and not from initial message
    }
  };

  // If there's a command line query, use it as the first message
  const initialQuery = argv._.join(' ');
  if (initialQuery) {
      await chat(initialQuery);
      if (!options.loop) {
          rl.close();
      }
  } else {
      chat();
  }
}

