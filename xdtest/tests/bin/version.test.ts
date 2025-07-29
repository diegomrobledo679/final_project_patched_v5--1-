import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';
import { run } from '@/bin/cyrah';

describe('version flag', () => {
  it('prints version number', async () => {
    const __dir = path.dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dir, '../../package.json'), 'utf8'));
    const originalArgv = process.argv.slice();
    process.argv = ['node', 'cyrah.js', '--version'];
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await run();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(pkg.version));
    logSpy.mockRestore();
    process.argv = originalArgv;
  });
});
