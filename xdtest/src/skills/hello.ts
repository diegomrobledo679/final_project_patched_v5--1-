import { Interpreter } from "../core/Interpreter.js";

export default async function hello(interpreter: Interpreter, message: string): Promise<string> {
  console.log(`Hello from the hello skill! You said: ${message}`);
  return `The hello skill was executed with the message: ${message}`;
}
