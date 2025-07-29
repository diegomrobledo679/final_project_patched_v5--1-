import { jest } from '@jest/globals';
import { run } from '@/bin/cyrah';

test('help output includes conversation flags', async () => {
  const originalArgv = process.argv.slice();
  process.argv = ['node', 'cyrah.js', '--help'];
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await run();
  const output = logSpy.mock.calls.map(c => c[0]).join('\n');
  expect(output).toContain('--history-path');
  expect(output).toContain('--conversation-file');
  expect(output).toContain('--conversation-max');
  logSpy.mockRestore();
  process.argv = originalArgv;
});
