
import { Tool } from "../core/types.js";
import Jimp from 'jimp';
import * as path from 'path';
import * as fs from 'fs';
import OpenAI from 'openai';

// Helper function to ensure output directory exists
const ensureDirExists = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const resizeImageTool: Tool = {
  type: "function",
  function: {
    name: "resizeImage",
    description: "Resizes an image to the specified width and height. Saves the result to a new file.",
    parameters: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "The path to the input image file.",
        },
        outputPath: {
          type: "string",
          description: "The path where the resized image will be saved.",
        },
        width: {
          type: "number",
          description: "The desired width of the image.",
        },
        height: {
          type: "number",
          description: "The desired height of the image.",
        },
      },
      required: ["inputPath", "outputPath", "width", "height"],
    },
  },
};

export async function executeResizeImageTool(args: { inputPath: string; outputPath: string; width: number; height: number }): Promise<string> {
  try {
    const image = await Jimp.read(args.inputPath);
    image.resize(args.width, args.height);
    ensureDirExists(args.outputPath);
    await image.writeAsync(args.outputPath);
    return `Image resized and saved to ${args.outputPath}`;
  } catch (error: any) {
    return `Error resizing image: ${error.message}`;
  }
}

export const cropImageTool: Tool = {
  type: "function",
  function: {
    name: "cropImage",
    description: "Crops an image based on the specified coordinates and dimensions. Saves the result to a new file.",
    parameters: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "The path to the input image file.",
        },
        outputPath: {
          type: "string",
          description: "The path where the cropped image will be saved.",
        },
        x: {
          type: "number",
          description: "The x-coordinate of the top-left corner of the crop area.",
        },
        y: {
          type: "number",
          description: "The y-coordinate of the top-left corner of the crop area.",
        },
        width: {
          type: "number",
          description: "The width of the crop area.",
        },
        height: {
          type: "number",
          description: "The height of the crop area.",
        },
      },
      required: ["inputPath", "outputPath", "x", "y", "width", "height"],
    },
  },
};

export async function executeCropImageTool(args: { inputPath: string; outputPath: string; x: number; y: number; width: number; height: number }): Promise<string> {
  try {
    const image = await Jimp.read(args.inputPath);
    image.crop(args.x, args.y, args.width, args.height);
    ensureDirExists(args.outputPath);
    await image.writeAsync(args.outputPath);
    return `Image cropped and saved to ${args.outputPath}`;
  } catch (error: any) {
    return `Error cropping image: ${error.message}`;
  }
}

export const greyscaleImageTool: Tool = {
  type: "function",
  function: {
    name: "greyscaleImage",
    description: "Converts an image to greyscale. Saves the result to a new file.",
    parameters: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "The path to the input image file.",
        },
        outputPath: {
          type: "string",
          description: "The path where the greyscale image will be saved.",
        },
      },
      required: ["inputPath", "outputPath"],
    },
  },
};

export async function executeGreyscaleImageTool(args: { inputPath: string; outputPath: string }): Promise<string> {
  try {
    const image = await Jimp.read(args.inputPath);
    image.greyscale();
    ensureDirExists(args.outputPath);
    await image.writeAsync(args.outputPath);
    return `Image converted to greyscale and saved to ${args.outputPath}`;
  } catch (error: any) {
    return `Error converting image to greyscale: ${error.message}`;
  }
}

export const rotateImageTool: Tool = {
  type: "function",
  function: {
    name: "rotateImage",
    description: "Rotates an image by a specified angle (in degrees). Saves the result to a new file.",
    parameters: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "The path to the input image file.",
        },
        outputPath: {
          type: "string",
          description: "The path where the rotated image will be saved.",
        },
        angle: {
          type: "number",
          description: "The angle of rotation in degrees (e.g., 90, 180, 270).",
        },
      },
      required: ["inputPath", "outputPath", "angle"],
    },
  },
};

export async function executeRotateImageTool(args: { inputPath: string; outputPath: string; angle: number }): Promise<string> {
  try {
    const image = await Jimp.read(args.inputPath);
    image.rotate(args.angle);
    ensureDirExists(args.outputPath);
    await image.writeAsync(args.outputPath);
    return `Image rotated by ${args.angle} degrees and saved to ${args.outputPath}`;
  } catch (error: any) {
    return `Error rotating image: ${error.message}`;
  }
}

export const generateImageTool: Tool = {
  type: "function",
  function: {
    name: "generateImage",
    description: "Generates an image based on a text prompt. If an OpenAI API key is configured, it will use the OpenAI image generation endpoint. Otherwise it falls back to generating a placeholder image with the prompt text.",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "The text prompt to generate the image from.",
        },
        outputPath: {
          type: "string",
          description: "The path where the generated image will be saved. The actual image file will only be created if an external API is successfully integrated.",
        },
      },
      required: ["prompt", "outputPath"],
    },
  },
};

export async function executeGenerateImageTool(args: { prompt: string; outputPath: string }): Promise<string> {
  if (process.env.OPENAI_API_KEY) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
    try {
      const response = await openai.images.generate({
        prompt: args.prompt,
        n: 1,
        size: '512x512',
        response_format: 'b64_json',
      });
      const imageData = response.data?.[0]?.b64_json;
      if (!imageData) {
        throw new Error('No image data returned');
      }
      const buffer = Buffer.from(imageData, 'base64');
      ensureDirExists(args.outputPath);
      fs.writeFileSync(args.outputPath, buffer);
      return `Image generated using OpenAI and saved to ${args.outputPath}`;
    } catch (error: any) {
      return `Error generating image via OpenAI: ${error.message}`;
    }
  }

  // Fallback to placeholder image if no API key is configured
  try {
    const image = await new Jimp(512, 512, 0xffffffff);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    image.print(
      font,
      10,
      10,
      {
        text: args.prompt,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      492,
      492,
    );
    ensureDirExists(args.outputPath);
    await image.writeAsync(args.outputPath);
    return `Placeholder image created for prompt "${args.prompt}" and saved to ${args.outputPath}`;
  } catch (error: any) {
    return `Error generating placeholder image: ${error.message}`;
  }
}
