process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';

import { Interpreter } from '@/core/Interpreter';
import { Role, MessageType } from '@/core/types';
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
});
