let executeListLanguagesTool;

beforeAll(async () => {
  ({ executeListLanguagesTool } = await import('@/tools/LanguageTool'));
});

test('lists supported languages', async () => {
  const result = await executeListLanguagesTool();
  expect(result).toContain('python');
  expect(result).toContain('javascript');
});
