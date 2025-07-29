import { jest } from '@jest/globals';
import { run } from '@/bin/cyrah';

test('check-health flag runs diagnostics', async () => {
  const originalArgv = process.argv.slice();
  process.argv = ['node', 'cyrah.js', '--check-health'];
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await run();
  expect(logSpy).toHaveBeenCalled();
  logSpy.mockRestore();
  process.argv = originalArgv;
});
