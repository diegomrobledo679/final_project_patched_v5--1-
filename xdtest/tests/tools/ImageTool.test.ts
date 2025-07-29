import { jest } from '@jest/globals';
import { executeGenerateImageTool } from '@/tools/ImageTool';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    images: {
      generate: jest
        .fn()
        .mockResolvedValue({ data: [{ b64_json: Buffer.from('mock').toString('base64') }] }),
    },
  })),
}));

describe('ImageTool', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const tmpDir = path.join(__dirname, 'tmp_images');
  const outputPath = path.join(tmpDir, 'output.png');

  beforeAll(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_BASE_URL;
  });

  afterAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('generates a placeholder image when no OPENAI_API_KEY is set', async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await executeGenerateImageTool({ prompt: 'hello', outputPath });
    expect(result).toContain('Placeholder image created');
    expect(fs.existsSync(outputPath)).toBe(true);
  });

  it('generates an image via OpenAI when OPENAI_API_KEY is set', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const result = await executeGenerateImageTool({ prompt: 'hi', outputPath });
    expect(result).toContain('OpenAI');
  });
});
