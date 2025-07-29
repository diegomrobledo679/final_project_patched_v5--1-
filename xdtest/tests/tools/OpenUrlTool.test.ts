import { jest } from '@jest/globals';
import { executeOpenUrlTool } from '@/tools/OpenUrlTool';
import { exec } from 'child_process';

jest.mock('child_process', () => ({
  exec: jest.fn((cmd: string, cb: (err?: any) => void) => cb(null)),
}));

describe('OpenUrlTool', () => {
  it('opens url with exec', async () => {
    const msg = await executeOpenUrlTool({ url: 'http://example.com' });
    expect(msg).toContain('Opened');
  });
});
