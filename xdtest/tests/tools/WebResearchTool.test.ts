import { jest } from '@jest/globals';
import { executeWebResearchTool } from '@/tools/WebResearchTool';
import axios from 'axios';

describe('WebResearchTool', () => {
  const originalGet = axios.get;

  afterEach(() => {
    (axios as any).get = originalGet;
  });

  it('returns summarized search results', async () => {
    const mockGet = jest.fn()
      .mockResolvedValueOnce({ data: "<div class='g'><a href='http://example.com'><h3>Example</h3></a></div>" })
      .mockResolvedValueOnce({ data: '<body>This is a test page with interesting information.</body>' });
    (axios as any).get = mockGet;

    const result = await executeWebResearchTool({ query: 'test', numResults: 1 });
    expect(result).toContain('Example: This is a test page');
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
