import { jest } from '@jest/globals';

let executeSendEmailTool;
beforeAll(async () => {
  ({ executeSendEmailTool } = await import('@/tools/EmailTool'));
});

test('sends an email', async () => {
  process.env.EMAIL_HOST = 'smtp.example.com';
  process.env.EMAIL_USER = 'user';
  process.env.EMAIL_PASS = 'pass';
  const msg = await executeSendEmailTool({ to: 'a@b.c', subject: 'Hi', text: 'Test' });
  expect(msg).toContain('Email sent');
});

test('throws when configuration missing', async () => {
  const orig = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  delete process.env.EMAIL_HOST;
  delete process.env.EMAIL_USER;
  delete process.env.EMAIL_PASS;
  await expect(executeSendEmailTool({ to: 'a@b.c', subject: 'Hi', text: 'Test' })).rejects.toThrow('Missing email configuration');
  process.env.NODE_ENV = orig;
});
