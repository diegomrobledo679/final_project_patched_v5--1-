import { jest } from '@jest/globals';
import { run } from '@/bin/cyrah';

test('list-env flag prints env vars', async () => {
  const originalArgv = process.argv.slice();
  process.argv = ['node', 'cyrah.js', '--list-env'];
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await run();
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('LLM_PROVIDER'));
  logSpy.mockRestore();
  process.argv = originalArgv;
});
