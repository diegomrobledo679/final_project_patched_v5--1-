import { executeListEnvironmentVariablesTool } from '@/tools/EnvironmentTool';

describe('EnvironmentTool', () => {
  it('lists relevant environment variables', async () => {
    process.env.LLM_PROVIDER = 'test-provider';
    const result = await executeListEnvironmentVariablesTool();
    expect(result).toContain('LLM_PROVIDER=test-provider');
    delete process.env.LLM_PROVIDER;
  });
});
