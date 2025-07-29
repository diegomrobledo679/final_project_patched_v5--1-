import { Message } from "./types.js";

interface InterpreterOptions {
  autoRun?: boolean;
  loop?: boolean;
  messages?: Message[];
  offline?: boolean;
  verbose?: boolean;
  debug?: boolean;
  maxOutput?: number;
  safeMode?: string;
  shrinkImages?: boolean;
  loopMessage?: string;
  loopBreakers?: string[];
  disableTelemetry?: boolean;
  inTerminalInterface?: boolean;
  conversationHistory?: boolean;
  conversationFilename?: string | null;
  conversationHistoryPath?: string;
  speakMessage?: boolean;
  llm?: any | null;
  customerInstructions?: string;
  userMessageTemplate?: string;
  alwaysApplyMessageTemplate?: boolean;
  codeOutputTemplate?: string;
  emptyCodeOutputTemplate?: string;
  codeOutputSender?: string;
  computer?: any;
  syncComputer?: boolean;
  importComputerApi?: boolean;
  skillsPath?: string | null;
  importSkills?: boolean;
  multiLine?: boolean;
  contributeConversation?: boolean;
  plainTextDisplay?: boolean;
  highlightActiveLine?: boolean;
  inputEventHandler?: ((event: any) => void) | null;
  
  autoFixCode?: boolean;
  displayMode?: 'cli' | 'gui';
  google_web_search_function?: (query: string) => Promise<any>;
  llmProvider?: string;
  llmModel?: string;
  llmApiKey?: string;
  llmBaseUrl?: string;
  llmTemperature?: number;
  llmMaxTokens?: number;
  conversationMaxLength?: number;
}

export type { InterpreterOptions };