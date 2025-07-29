import { jest } from '@jest/globals';
import { executeLaunchUITool } from '@/tools/SystemIntegrationTool';
import { exec } from 'child_process';

jest.mock('child_process', () => ({
  exec: jest.fn((cmd: string, cb: (err: any) => void) => cb(null)),
  spawn: jest.fn(() => {
    const listeners: Record<string, () => void> = {};
    return {
      stdin: { write: jest.fn() },
      on: jest.fn((event: string, cb: () => void) => {
        listeners[event] = cb;
        if (event === 'exit') process.nextTick(cb);
      }),
    } as any;
  }),
}));

describe('SystemIntegrationTool', () => {
  it('uses UI_BASE_URL environment variable', async () => {
    process.env.UI_BASE_URL = 'http://example.com';
    const msg = await executeLaunchUITool({ uiName: 'cyrah' });
    expect(msg).toContain('http://example.com/cyrah');
    delete process.env.UI_BASE_URL;
  });

  it('falls back to spawn when node-pty fails', async () => {
    jest.isolateModules(async () => {
      jest.doMock('node-pty', () => ({
        __esModule: true,
        default: { spawn: jest.fn(() => { throw new Error('pty failed'); }) },
      }));
      const { executeLaunchVirtualTerminalTool } = await import('@/tools/SystemIntegrationTool');
      const result = await executeLaunchVirtualTerminalTool({ terminalName: 'test' });
      expect(result).toContain('session ended');
    });
    jest.dontMock('node-pty');
  });
});
