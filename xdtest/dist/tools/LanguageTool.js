var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const listLanguagesTool = {
    type: "function",
    function: {
        name: "listLanguages",
        description: "Lists supported programming languages for code execution.",
        parameters: { type: "object", properties: {} }
    }
};
const LANGUAGES = [
    'python', 'javascript', 'shell', 'ruby', 'perl', 'php', 'powershell', 'java', 'go',
    'cpp', 'rust', 'swift', 'csharp', 'kotlin', 'r', 'typescript', 'groovy', 'scala',
    'c', 'fortran', 'lua', 'haskell', 'erlang', 'elixir'
];
export function executeListLanguagesTool() {
    return __awaiter(this, void 0, void 0, function* () {
        return LANGUAGES.join(', ');
    });
}
export function getSupportedLanguages() {
    return [...LANGUAGES];
}
