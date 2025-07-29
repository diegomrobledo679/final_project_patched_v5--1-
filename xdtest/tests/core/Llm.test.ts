import { Llm } from '@/core/llm/Llm';
import { Interpreter } from '@/core/Interpreter';

describe('Llm', () => {
  it('initializes without API key when using ollama provider', () => {
    const interpreter = new Interpreter({ llmProvider: 'ollama' });
    expect(interpreter.llm).toBeInstanceOf(Llm);
  });

  it('initializes with g4f provider without API key', () => {
    const interpreter = new Interpreter({ llmProvider: 'g4f' });
    expect(interpreter.llm).toBeInstanceOf(Llm);
  });

  it('throws when provider is openai and no API key provided', () => {
    const original = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const interpreter = { maxOutput: 1000 } as Interpreter;
    expect(() => new Llm(interpreter, { llmProvider: 'openai' } as any)).toThrow();
    if (original) process.env.OPENAI_API_KEY = original;
  });
});
