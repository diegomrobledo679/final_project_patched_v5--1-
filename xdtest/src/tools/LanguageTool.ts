import { Tool } from "../core/types.js";

export const listLanguagesTool: Tool = {
  type: "function",
  function: {
    name: "listLanguages",
    description: "Lists supported programming languages for code execution.",
    parameters: { type: "object", properties: {} }
  }
};

const LANGUAGES = [
  'python','javascript','shell','ruby','perl','php','powershell','java','go',
  'cpp','rust','swift','csharp','kotlin','r','typescript','groovy','scala',
  'c','fortran','lua','haskell','erlang','elixir'
];

export async function executeListLanguagesTool(): Promise<string> {
  return LANGUAGES.join(', ');
}

export function getSupportedLanguages(): string[] {
  return [...LANGUAGES];
}
