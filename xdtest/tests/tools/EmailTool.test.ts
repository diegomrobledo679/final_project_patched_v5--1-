import { jest } from '@jest/globals';

describe('EmailTool', () => {
  it('sends an email', async () => {
    const { executeSendEmailTool } = await import('@/tools/EmailTool');
    process.env.EMAIL_HOST = 'smtp.example.com';
    process.env.EMAIL_USER = 'user';
    process.env.EMAIL_PASS = 'pass';
    const msg = await executeSendEmailTool({ to: 'a@b.c', subject: 'Hi', text: 'Test' });
    expect(msg).toContain('Email sent');
  });

  it('throws when configuration missing', async () => {
    const { executeSendEmailTool } = await import('@/tools/EmailTool');
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
    await expect(executeSendEmailTool({ to: 'a@b.c', subject: 'Hi', text: 'Test' })).rejects.toThrow('Missing email configuration');
    process.env.NODE_ENV = orig;
  });
});
