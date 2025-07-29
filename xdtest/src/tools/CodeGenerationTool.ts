import { Tool } from "../core/types.js";

export const generateBoilerplateCodeTool: Tool = {
  type: "function",
  function: {
    name: "generateBoilerplateCode",
    description: "Generates boilerplate code for common programming constructs (e.g., a basic function, class, or file structure).",
    parameters: {
      type: "object",
      properties: {
        language: {
          type: "string",
          description: "The programming language for the boilerplate code (e.g., 'python', 'javascript', 'typescript', 'java').",
        },
        type: {
          type: "string",
          description: "The type of boilerplate to generate (e.g., 'function', 'class', 'hello_world', 'web_server').",
        },
        name: {
          type: "string",
          description: "Optional: A name for the generated construct (e.g., function name, class name).",
          nullable: true,
        },
      },
      required: ["language", "type"],
    },
  },
};

export async function executeGenerateBoilerplateCodeTool(args: { language: string; type: string; name?: string }): Promise<string> {
  const { language, type, name } = args;
  let generatedCode = '';

  switch (language.toLowerCase()) {
    case 'python':
      if (type === 'function') {
        generatedCode = `def ${name || 'my_function'}():\n    # Your code here\n    pass`;
      } else if (type === 'class') {
        generatedCode = `class ${name || 'MyClass'}:\n    def __init__(self):\n        pass\n\n    def my_method(self):\n        pass`;
      } else if (type === 'hello_world') {
        generatedCode = `print("Hello, World!")`;
      } else {
        generatedCode = `Unsupported boilerplate type for Python: ${type}`;
      }
      break;
    case 'javascript':
    case 'typescript':
      if (type === 'function') {
        generatedCode = `function ${name || 'myFunction'}() {\n  // Your code here\n}`; // No newline at end
      } else if (type === 'class') {
        generatedCode = `class ${name || 'MyClass'} {\n  constructor() {}\n\n  myMethod() {}\n}`; // No newline at end
      } else if (type === 'hello_world') {
        generatedCode = `console.log("Hello, World!");`;
      } else {
        generatedCode = `Unsupported boilerplate type for ${language}: ${type}`;
      }
      break;
    case 'java':
      if (type === 'class') {
        generatedCode = `public class ${name || 'MyClass'} {\n  public static void main(String[] args) {\n    // Your code here\n  }\n}`; // No newline at end
      } else if (type === 'hello_world') {
        generatedCode = `public class HelloWorld {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`; // No newline at end
      } else {
        generatedCode = `Unsupported boilerplate type for Java: ${type}`;
      }
      break;
    default:
      generatedCode = `Unsupported language: ${language}`;
  }

  return `Generated ${language} ${type} code:\n\n\`\`\`${language}\n${generatedCode}\n\`\`\``;
}