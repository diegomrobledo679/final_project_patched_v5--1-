"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visionTool = void 0;
exports.executeVisionTool = executeVisionTool;
exports.visionTool = {
    type: "function",
    function: {
        name: "process_image",
        description: "Processes an image from a given path and returns a description.",
        parameters: {
            type: "object",
            properties: {
                imagePath: {
                    type: "string",
                    description: "The path to the image to process.",
                },
            },
            required: ["imagePath"],
        },
    },
};
function executeVisionTool(args, computer, shrinkImages) {
    return __awaiter(this, void 0, void 0, function* () {
        return computer.vision(args.imagePath, shrinkImages);
    });
}
