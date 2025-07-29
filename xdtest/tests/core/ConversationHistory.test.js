process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';
import { Interpreter } from '@/core/Interpreter';
import { Role, MessageType } from '@/core/types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

describe('Conversation History', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const tempDir = path.join(__dirname, 'conv_tmp');
  const file = 'session.json';

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('saves conversation to custom path', () => {
    const interpreter = new Interpreter({
      conversationFilename: file,
      conversationHistoryPath: tempDir,
    });
    interpreter.messages.push({ role: Role.User, messageType: MessageType.Message, content: 'hello' });
    interpreter.saveConversation(file);
    const savedPath = path.join(tempDir, file);
    expect(fs.existsSync(savedPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(savedPath, 'utf-8'));
    expect(data[data.length - 1].content).toBe('hello');
  });
});
