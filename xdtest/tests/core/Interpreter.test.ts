process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';

import { Interpreter } from '@/core/Interpreter';
import { Role, MessageType } from '@/core/types';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

describe('Interpreter', () => {
  it('should initialize with default options', () => {
    const interpreter = new Interpreter();
    expect(interpreter).toBeInstanceOf(Interpreter);
    expect(interpreter.autoRun).toBe(true);
  });

  it('should reset the conversation', () => {
    const interpreter = new Interpreter();
    interpreter.messages.push({ role: Role.User, messageType: MessageType.Message, content: 'test' });
    interpreter.reset();
    expect(interpreter.messages.length).toBe(1); // Only system message
  });

  it('loads skills from custom path when importSkills is true', async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const skillsDir = path.join(__dirname, 'skills_tmp');
    const skillFile = path.join(skillsDir, 'hello.js');
    if (!fs.existsSync(skillsDir)) fs.mkdirSync(skillsDir, { recursive: true });
    fs.writeFileSync(skillFile, 'export default () => \"hi\";');
    const interpreter = new Interpreter({ skillsPath: skillsDir, importSkills: true });
    await new Promise(r => setTimeout(r, 20));
    expect(interpreter.computer.skills.path).toBe(skillsDir);
    expect(typeof interpreter.computer.skills.hello).toBe('function');
    fs.rmSync(skillsDir, { recursive: true, force: true });
  });

  it('reads boolean options from environment variables', () => {
    process.env.OFFLINE = 'true';
    process.env.VERBOSE = 'true';
    process.env.DEBUG = 'true';
    const interpreter = new Interpreter();
    expect(interpreter.offline).toBe(true);
    expect(interpreter.verbose).toBe(true);
    expect(interpreter.debug).toBe(true);
    delete process.env.OFFLINE;
    delete process.env.VERBOSE;
    delete process.env.DEBUG;
  });
});