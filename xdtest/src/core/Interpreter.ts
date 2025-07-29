

import { Message, Role, MessageType, Tool, ToolCall } from "../core/types.js";
import { InterpreterOptions } from "./InterpreterOptions.js";
import { getStoragePath } from "../utils/localStoragePath.js";
import { AppConst } from "../const.js";
import { Llm } from "./llm/Llm.js";
import { Computer } from "./Computer.js";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../utils/logger.js";
import { config } from "../config.js";

const envBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
};

export class Interpreter {
  public messages: Message[] = [];
  public responding = false;
  private lastMessageCount = 0;
  public llm: Llm;
  public computer: Computer;

  // Settings
  public offline: boolean;
  public autoRun: boolean;
  public verbose: boolean;
  public debug: boolean;
  public maxOutput: number;
  public safeMode: string;
  public shrinkImages: boolean;
  public disableTelemetry: boolean;
  public inTerminalInterface: boolean;
  public multiLine: boolean;
  public contributeConversation: boolean;
  public plainTextDisplay: boolean;
  public highlightActiveLine: boolean;

  // Loop messages
  public loop: boolean;
  public loopMessage: string;
  public loopBreakers: string[];

  // Conversation History
  public conversationHistory: boolean;
  public conversationFilename: string | null;
  public conversationHistoryPath: string;
  public conversationMaxLength?: number;

  // OS control mode related attributes
  public speakMessage: boolean;

  // LLM related
  public systemMessage: string;
  public customerInstructions: string;
  public userMessageTemplate: string;
  public alwaysApplyMessageTemplate: boolean;
  public codeOutputTemplate: string;
  public emptyCodeOutputTemplate: string;
  public codeOutputSender: string;

  // Computer related
  public syncComputer: boolean;
  public importComputerApi: boolean;
  public skillsPath: string | null;
  public importSkills: boolean;

  public tools: (Tool & { execute: (args: any) => Promise<string> })[] = [];

  constructor(options: InterpreterOptions = {}) {
    const {
      messages = [],
      offline = envBool(process.env.OFFLINE, false),
      autoRun = true,
      verbose = envBool(process.env.VERBOSE, false),
      debug = envBool(process.env.DEBUG, false),
      maxOutput = config.defaultMaxOutput,
      safeMode = config.defaultSafeMode,
      shrinkImages = config.defaultShrinkImages,
      loop = false,
      loopMessage = "Proceed. You CAN run code on my machine. If the entire task I asked for is done, say exactly 'The task is done.'                      If you need some specific information (like username or password) say EXACTLY 'Please provide more information.' If it's impossible,                      say 'The task is impossible. (If I haven't provided a task, say exactly 'Let me know what you'd like to do next.') Otherwise keep going.",
      loopBreakers = [
        "The Task is done.",
        "The Task is impossible.",
        "Let me know what you'd like to do next",
        "Please provide more information",
      ],
      disableTelemetry = config.defaultDisableTelemetry,
      inTerminalInterface = config.defaultInTerminalInterface,
      conversationHistory = config.conversationHistoryEnabled,
      conversationFilename = config.conversationFilename,
      conversationHistoryPath = getStoragePath("conversations"),
      conversationMaxLength,
      speakMessage = config.defaultSpeakMessage,
      llm = null,
      customerInstructions = "",
      userMessageTemplate = "{content}",
      alwaysApplyMessageTemplate = config.defaultAlwaysApplyMessageTemplate,
      codeOutputTemplate = "Code output: {content}\n\nWhat does this output mean / what's next (if anything, or are we done)?",
      emptyCodeOutputTemplate = "The code above was executed on my machine. It produced no text output. what's next (if anything, or are we done?)",
      codeOutputSender = "user",
      computer = null,
      syncComputer = false,
      importComputerApi = false,
      skillsPath = null,
      importSkills = false,
      multiLine = config.defaultMultiLine,
      contributeConversation = config.defaultContributeConversation,
      plainTextDisplay = config.defaultPlainTextDisplay,
    } = options;

    this.messages = messages;
    this.offline = offline;
    this.autoRun = autoRun;
    this.verbose = verbose;
    this.debug = debug;
    this.maxOutput = maxOutput;
    this.safeMode = safeMode;
    this.shrinkImages = shrinkImages;
    this.disableTelemetry = disableTelemetry;
    this.inTerminalInterface = inTerminalInterface;
    this.multiLine = multiLine;
    this.contributeConversation = contributeConversation;
    this.plainTextDisplay = plainTextDisplay;
    this.highlightActiveLine = config.defaultHighlightActiveLine;

    this.loop = loop;
    this.loopMessage = loopMessage;
    this.loopBreakers = loopBreakers;

    this.conversationHistory = conversationHistory;
    this.conversationFilename = conversationFilename;
    this.conversationHistoryPath = conversationHistoryPath;
    this.conversationMaxLength = conversationMaxLength;

    if (this.conversationHistory && this.conversationFilename) {
      this.loadConversation(this.conversationFilename);
    }

    this.speakMessage = speakMessage;
    this.computer = computer == null ? new Computer(this) : computer;
    this.syncComputer = syncComputer;
    this.importComputerApi = importComputerApi;

    if (skillsPath) this.computer.skills.path = skillsPath;
    this.importSkills = importSkills;
    if (this.importSkills) {
      this.computer.loadSkills(skillsPath ?? "./skills").catch((err) => {
        logger.error(`Failed to load skills: ${err}`);
      });
    }

    this.llm = llm == null ? new Llm(this, options) : llm;

    this.customerInstructions = customerInstructions;
    this.userMessageTemplate = userMessageTemplate;
    this.alwaysApplyMessageTemplate = alwaysApplyMessageTemplate;
    this.codeOutputTemplate = codeOutputTemplate;
    this.emptyCodeOutputTemplate = emptyCodeOutputTemplate;
    this.codeOutputSender = codeOutputSender;
    this.skillsPath = skillsPath;

    this.systemMessage = this.getSystemMessage();
    this.messages.unshift({ role: Role.System, messageType: MessageType.Message, content: this.systemMessage });
  }

  private getConversationFilePath(filename: string): string {
    return path.join(this.conversationHistoryPath, filename);
  }

  public saveConversation(filename: string) {
    if (!fs.existsSync(this.conversationHistoryPath)) {
      fs.mkdirSync(this.conversationHistoryPath, { recursive: true });
    }
    this.trimConversation();
    const filePath = this.getConversationFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(this.messages, null, 2));
    logger.info(`Conversation saved to ${filePath}`);
  }

  public loadConversation(filename: string) {
    const filePath = this.getConversationFilePath(filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      this.messages = JSON.parse(data);
      logger.info(`Conversation loaded from ${filePath}`);
    } else {
      logger.info("No existing conversation found.");
    }
  }

  private trimConversation() {
    if (this.conversationMaxLength && this.messages.length > this.conversationMaxLength + 1) {
      const keep = this.messages.slice(-this.conversationMaxLength);
      this.messages = [this.messages[0], ...keep];
    }
  }

  public async chat(message?: string): Promise<Message[]> {
    if (message) {
        logger.info(`Received message: ${message}`);
        if (typeof message !== 'string' || message.trim() === '') {
            logger.warn("Invalid input: Message must be a non-empty string.");
            throw new Error("Message must be a non-empty string.");
        }
        this.messages.push({
            role: Role.User,
            messageType: MessageType.Message,
            content: message,
        });
        this.trimConversation();
    }

    if (this.loop) {
        return this.runLoop();
    }

    const finalMessages = await this.respond();
    if (this.conversationHistory && this.conversationFilename) {
        this.saveConversation(this.conversationFilename);
    }
    return finalMessages;
}

private async runLoop(): Promise<Message[]> {
    let finalMessages: Message[] = [];
    while (true) {
        finalMessages = await this.respond();
        const lastMessageContent = finalMessages[finalMessages.length - 1]?.content?.trim() || "";

        if (this.loopBreakers.some(breaker => lastMessageContent.includes(breaker))) {
            logger.info("Loop broken due to break message.");
            break;
        }

        this.messages.push({
            role: Role.User,
            messageType: MessageType.Message,
            content: this.loopMessage,
        });
        this.trimConversation();
    }
    if (this.conversationHistory && this.conversationFilename) {
        this.saveConversation(this.conversationFilename);
    }
    return finalMessages;
}

private async respond(): Promise<Message[]> {
    this.responding = true;
    logger.info("Calling LLM for response...");

    const llmResponse = await this.llm.run(this.messages, this.tools.map(t => t));
    this.messages.push(llmResponse);
    this.trimConversation();

    if (llmResponse.tool_calls && llmResponse.tool_calls.length > 0) {
        await this.handleToolCalls(llmResponse.tool_calls);
        return this.respond(); // Get another response after handling tool calls
    }

    const codeBlocks = this.extractCodeBlocks(llmResponse.content);
    if (codeBlocks.length > 0 && this.autoRun) {
        for (const block of codeBlocks) {
            const output = await this.computer.execute(block.language, block.code);
            this.messages.push({
                role: Role.Computer,
                messageType: MessageType.Console,
                content: output,
            });
            this.trimConversation();
        }
        return this.respond(); // Get another response after handling code execution
    }

    this.responding = false;
    logger.info("LLM response received.");
    this.streamOutput(llmResponse);
    return this.messages;
}

private async handleToolCalls(toolCalls: ToolCall[]) {
    logger.info(`Found ${toolCalls.length} tool calls. Executing...`);
    for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        logger.info(`Executing tool: ${toolName} with arguments: ${JSON.stringify(toolArgs)}`);

        const tool = this.tools.find(t => t.function.name === toolName);
        if (tool) {
            try {
                const toolOutput = await tool.execute(toolArgs);
                const toolMessage: Message = {
                    role: Role.Tool,
                    messageType: MessageType.Console,
                    content: toolOutput,
                };
                this.messages.push(toolMessage);
                this.trimConversation();
                this.streamOutput(toolMessage);
                logger.info(`Tool execution output: ${toolOutput}`);
            } catch (error: any) {
                const errorMessage = `Error executing tool ${toolName}: ${error.message}`;
                const errorToolMessage: Message = {
                    role: Role.Tool,
                    messageType: MessageType.Console,
                    content: errorMessage,
                };
                this.messages.push(errorToolMessage);
                this.trimConversation();
                this.streamOutput(errorToolMessage);
                logger.error(errorMessage);
            }
        } else {
            const errorMessage = `Tool not found: ${toolName}`;
            const errorToolMessage: Message = {
                role: Role.Tool,
                messageType: MessageType.Console,
                content: errorMessage,
            };
            this.messages.push(errorToolMessage);
            this.trimConversation();
            this.streamOutput(errorToolMessage);
            logger.error(errorMessage);
        }
    }
}

  private extractCodeBlocks(content: string): { language: string; code: string }[] {
    const codeBlocks: { language: string; code: string }[] = [];
    const regex = /```(\w+)?\n([\s\S]*?)\n```/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const language = match[1] || "unknown";
      const code = match[2];
      codeBlocks.push({ language, code });
    }
    return codeBlocks;
  }

  public registerTool(tool: Tool, executeFunction: (args: any) => Promise<string>) {
    this.tools.push({ ...tool, execute: executeFunction });
    this.systemMessage = this.getSystemMessage(); // Update system message
    this.messages[0].content = this.systemMessage; // Update in messages array
  }

  private getSystemMessage(): string {
    let systemMessage = AppConst.defaultSystemMessage;

    if (this.tools.length > 0) {
      systemMessage += "\n\nYou have access to the following tools:\n";
      this.tools.forEach(tool => {
        systemMessage += "\n### " + tool.function.name + "\n";
        systemMessage += tool.function.description + "\n";
        systemMessage += "\`\`\`json\n" + JSON.stringify(tool.function.parameters, null, 2) + "\n\`\`\`\n";
      });
    }
    return systemMessage;
  }

  public streamOutput(message: Message) {
    // In a real CLI, you would print this to the console.
    // For this environment, we'll just log it.
    console.log(`${message.role}: ${message.content}`);
    logger.info(`Stream output: ${JSON.stringify(message)}`);
  }

  public reset() {
    this.messages = [{ role: Role.System, messageType: MessageType.Message, content: this.systemMessage }];
    if (this.conversationHistory && this.conversationFilename) {
        const filePath = this.getConversationFilePath(this.conversationFilename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Deleted conversation history file: ${filePath}`);
        }
    }
    logger.info("Interpreter reset.");
  }
}