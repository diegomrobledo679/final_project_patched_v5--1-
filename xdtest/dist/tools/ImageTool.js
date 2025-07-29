var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Jimp from 'jimp';
import * as path from 'path';
import * as fs from 'fs';
import OpenAI from 'openai';
// Helper function to ensure output directory exists
const ensureDirExists = (filePath) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};
export const resizeImageTool = {
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
export function executeResizeImageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const image = yield Jimp.read(args.inputPath);
            image.resize(args.width, args.height);
            ensureDirExists(args.outputPath);
            yield image.writeAsync(args.outputPath);
            return `Image resized and saved to ${args.outputPath}`;
        }
        catch (error) {
            return `Error resizing image: ${error.message}`;
        }
    });
}
export const cropImageTool = {
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
export function executeCropImageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const image = yield Jimp.read(args.inputPath);
            image.crop(args.x, args.y, args.width, args.height);
            ensureDirExists(args.outputPath);
            yield image.writeAsync(args.outputPath);
            return `Image cropped and saved to ${args.outputPath}`;
        }
        catch (error) {
            return `Error cropping image: ${error.message}`;
        }
    });
}
export const greyscaleImageTool = {
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
export function executeGreyscaleImageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const image = yield Jimp.read(args.inputPath);
            image.greyscale();
            ensureDirExists(args.outputPath);
            yield image.writeAsync(args.outputPath);
            return `Image converted to greyscale and saved to ${args.outputPath}`;
        }
        catch (error) {
            return `Error converting image to greyscale: ${error.message}`;
        }
    });
}
export const rotateImageTool = {
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
export function executeRotateImageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const image = yield Jimp.read(args.inputPath);
            image.rotate(args.angle);
            ensureDirExists(args.outputPath);
            yield image.writeAsync(args.outputPath);
            return `Image rotated by ${args.angle} degrees and saved to ${args.outputPath}`;
        }
        catch (error) {
            return `Error rotating image: ${error.message}`;
        }
    });
}
export const generateImageTool = {
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
export function executeGenerateImageTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (process.env.OPENAI_API_KEY) {
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                baseURL: process.env.OPENAI_BASE_URL,
            });
            try {
                const response = yield openai.images.generate({
                    prompt: args.prompt,
                    n: 1,
                    size: '512x512',
                    response_format: 'b64_json',
                });
                const imageData = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.b64_json;
                if (!imageData) {
                    throw new Error('No image data returned');
                }
                const buffer = Buffer.from(imageData, 'base64');
                ensureDirExists(args.outputPath);
                fs.writeFileSync(args.outputPath, buffer);
                return `Image generated using OpenAI and saved to ${args.outputPath}`;
            }
            catch (error) {
                return `Error generating image via OpenAI: ${error.message}`;
            }
        }
        // Fallback to placeholder image if no API key is configured
        try {
            const image = yield new Jimp(512, 512, 0xffffffff);
            const font = yield Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
            image.print(font, 10, 10, {
                text: args.prompt,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            }, 492, 492);
            ensureDirExists(args.outputPath);
            yield image.writeAsync(args.outputPath);
            return `Placeholder image created for prompt "${args.prompt}" and saved to ${args.outputPath}`;
        }
        catch (error) {
            return `Error generating placeholder image: ${error.message}`;
        }
    });
}
