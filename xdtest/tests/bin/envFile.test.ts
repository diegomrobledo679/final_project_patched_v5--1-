import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from '@/bin/cyrah';

it('loads environment variables from file', async () => {
  const __dir = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.join(__dir, 'tmp.env');
  fs.writeFileSync(envPath, 'TEST_ENV_VAR=hello');
  const originalArgv = process.argv.slice();
  process.argv = ['node', 'cyrah.js', '--env-file', envPath, '--no-menu', '--help'];
  delete process.env.TEST_ENV_VAR;
  await run();
  expect(process.env.TEST_ENV_VAR).toBe('hello');
  process.argv = originalArgv;
  fs.unlinkSync(envPath);
});
