import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import { Interpreter } from './core/Interpreter.js';
import { InterpreterOptions } from './core/InterpreterOptions.js';
import { config } from './config.js';
import { registerAllTools } from './tools/register.js';

dotenv.config();

export function createInterpreter(): Interpreter {
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
    autoRun: envBool(process.env.AUTO_RUN, true),
    loop: envBool(process.env.LOOP, config.defaultLoop),
    offline: envBool(process.env.OFFLINE, false),
    verbose: envBool(process.env.VERBOSE, false),
    debug: envBool(process.env.DEBUG, false),
    safeMode: process.env.SAFE_MODE || config.defaultSafeMode,
    maxOutput: envNumber(process.env.MAX_OUTPUT, config.defaultMaxOutput),
    llmProvider: process.env.LLM_PROVIDER,
    llmModel: process.env.LLM_MODEL,
    llmApiKey: process.env.LLM_API_KEY || (process.env.LLM_PROVIDER === 'ollama' ? process.env.OLLAMA_API_KEY : process.env.OPENAI_API_KEY),
    llmBaseUrl: process.env.LLM_BASE_URL || (process.env.LLM_PROVIDER === 'openai' ? process.env.OPENAI_BASE_URL : process.env.OLLAMA_BASE_URL),
    llmTemperature: envNumber(process.env.LLM_TEMPERATURE, 0),
    llmMaxTokens: envNumber(process.env.LLM_MAX_TOKENS, config.defaultMaxOutput),
    conversationHistoryPath: process.env.CONVERSATION_HISTORY_PATH,
    conversationFilename: envString(process.env.CONVERSATION_FILENAME, config.conversationFilename),
    conversationMaxLength: envNumber(process.env.CONVERSATION_MAX_LENGTH, undefined as any),
    skillsPath: envString(process.env.SKILLS_PATH, undefined as any),
    importSkills: envBool(process.env.IMPORT_SKILLS, false),
    displayMode: (process.env.DISPLAY_MODE ?? 'cli') as 'cli' | 'gui',
  };

  return new Interpreter(options);
}

const interpreter = createInterpreter();
registerAllTools(interpreter);
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  socket.on('message', async (msg: string) => {
    try {
      const messages = await interpreter.chat(msg);
      socket.emit('response', messages[messages.length - 1]);
    } catch (err: any) {
      socket.emit('response', { role: 'error', content: err.message });
    }
  });
});

const PORT = parseInt(process.env.PORT || '3000', 10);
server.listen(PORT, () => {
  console.log(`Web interface running at http://localhost:${PORT}`);
});
