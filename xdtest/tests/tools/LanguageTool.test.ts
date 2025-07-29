import { executeListLanguagesTool } from '@/tools/LanguageTool';

describe('LanguageTool', () => {
  it('lists supported languages', async () => {
    const result = await executeListLanguagesTool();
    expect(result).toContain('python');
    expect(result).toContain('javascript');
  });
});
