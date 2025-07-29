
import { Models } from "../../const.js";
import { Interpreter } from "../Interpreter.js";
import { logger } from "../../utils/logger.js";
import { assert } from "console";
import { Message, Role, MessageType, ToolCall } from "../types.js";
import OpenAI from 'openai';
import { G4F } from 'g4f';
import { InterpreterOptions } from "../InterpreterOptions.js";

export class Llm {
  private readonly interpreter: Interpreter;
  private model!: string;
  private temperature: number = 0;
  private contextWindow: number | null;
  private maxTokens: number | null;
  private openai!: OpenAI;
  private g4f?: G4F;
  private llmProvider!: string;
  private llmApiKey?: string;
  private llmBaseUrl?: string;

  constructor(interpreter: Interpreter, options: InterpreterOptions) {
    this.interpreter = interpreter;
    this.contextWindow = interpreter.maxOutput;
    this.maxTokens = interpreter.maxOutput;
    this.setLlmSettings(options);
  }

  public setLlmSettings(options: InterpreterOptions) {
    this.llmProvider = options.llmProvider || process.env.LLM_PROVIDER || 'g4f';
    this.model = options.llmModel || process.env.LLM_MODEL || Models.GPT_4O;
    this.llmApiKey =
      options.llmApiKey ||
      process.env.LLM_API_KEY ||
      (this.llmProvider === 'ollama' ? process.env.OLLAMA_API_KEY : process.env.OPENAI_API_KEY);
    this.llmBaseUrl = options.llmBaseUrl || process.env.LLM_BASE_URL;
    this.temperature = options.llmTemperature ?? (process.env.LLM_TEMPERATURE ? parseFloat(process.env.LLM_TEMPERATURE) : this.temperature);
    this.maxTokens = options.llmMaxTokens ?? (process.env.LLM_MAX_TOKENS ? parseInt(process.env.LLM_MAX_TOKENS, 10) : this.maxTokens);

    if (this.llmProvider === 'g4f') {
      this.g4f = new G4F();
    } else if (this.llmProvider === 'ollama') {
      this.llmBaseUrl = this.llmBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
      if (!this.llmApiKey) {
        // OpenAI client requires a non-empty apiKey, but Ollama does not use it
        this.llmApiKey = 'none';
      }
    } else if (this.llmProvider === 'openai') {
      this.llmBaseUrl = this.llmBaseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
      if (!this.llmApiKey) {
        throw new Error('No API key provided for OpenAI. Set LLM_API_KEY or OPENAI_API_KEY.');
      }
    }

    if (this.llmProvider !== 'g4f') {
      this.openai = new OpenAI({
        apiKey: this.llmApiKey,
        baseURL: this.llmBaseUrl,
      });
    }
  }

  public async run(messages: Message[], tools?: any[]): Promise<Message> {
    logger.debug("Llm.run called.");

    if (this.maxTokens && this.contextWindow && this.maxTokens > this.contextWindow) {
      logger.warn("Warning: max_tokens is larger than context_window. Setting max_tokens to 0.2 times the context_window.");
      this.maxTokens = Math.floor(0.2 * this.contextWindow);
    }

    assert(messages[0].role === Role.System, "First message must have the role 'system'");
    assert(!messages.slice(1).some(m => m.role === Role.System), "No message after the first can have the role 'system'");

    const model = this.model;
    logger.info(`Running LLM with model: ${model}`);
    logger.debug(`Messages sent to LLM: ${JSON.stringify(messages)}`);

    const preparedMessages = messages.map(msg => ({
      role: msg.role.toLowerCase() as 'system' | 'user' | 'assistant' | 'tool',
      content: msg.content,
      ...(msg.tool_calls && { tool_calls: msg.tool_calls }),
    }));

    if (this.llmProvider === 'g4f' && this.g4f) {
      const g4fMessages = preparedMessages.map(m => ({ role: m.role, content: m.content }));
      const content = await this.g4f.chatCompletion(g4fMessages);
      return { role: Role.Assistant, messageType: MessageType.Message, content };
    }

    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: model,
          messages: preparedMessages as any,
          temperature: this.temperature,
          max_tokens: this.maxTokens || undefined,
          tools: tools as any,
        });

        const choice = response.choices[0];
        if (!choice) {
          logger.warn("LLM returned no choices.");
          return { role: Role.Assistant, messageType: MessageType.Message, content: "" };
        }

        const message = choice.message;
        logger.debug(`LLM response content: ${message.content}`);
        logger.debug(`LLM tool calls: ${JSON.stringify(message.tool_calls)}`);

        return {
          role: Role.Assistant,
          messageType: MessageType.Message,
          content: message.content || "",
          tool_calls: (message.tool_calls as ToolCall[]) || [],
        };
      } catch (error: any) {
        logger.error(`Error during LLM completion (Attempt ${i + 1}/${maxRetries}): ${error}`);
        if (i < maxRetries - 1) {
          await new Promise(res => setTimeout(res, 1000 * 2 ** i));
        } else {
          throw error;
        }
      }
    }
    throw new Error("Failed to get LLM completion after multiple retries.");
  }
}
