"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageData = void 0;
// src/utils.ts
const axios_1 = __importDefault(require("axios"));
const mime_types_1 = __importDefault(require("mime-types"));
const promises_1 = __importDefault(require("fs/promises"));
const getImageData = async (imagePath) => {
    try {
        // Check if the path is a URL or local file
        const isUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');
        if (isUrl) {
            // Handle URL
            const response = await axios_1.default.get(imagePath, { responseType: 'arraybuffer' });
            if (response.status !== 200) {
                throw new Error(`Could not retrieve image from URL: ${imagePath}`);
            }
            let contentType = response.headers['content-type'];
            if (!contentType) {
                contentType = mime_types_1.default.lookup(imagePath) || 'image/jpeg';
            }
            const encodedImage = Buffer.from(response.data).toString('base64');
            return {
                encodedImage,
                contentType: normalizeContentType(contentType)
            };
        }
        else {
            // Handle local file
            try {
                const fileData = await promises_1.default.readFile(imagePath);
                const contentType = mime_types_1.default.lookup(imagePath) || 'image/jpeg';
                const encodedImage = fileData.toString('base64');
                return {
                    encodedImage,
                    contentType: normalizeContentType(contentType)
                };
            }
            catch (error) {
                throw new Error(`Could not read local file: ${imagePath}. Error: ${error.message}`);
            }
        }
    }
    catch (error) {
        throw new Error(`Error processing image: ${error.message}`);
    }
};
exports.getImageData = getImageData;
const normalizeContentType = (contentType) => {
    const type = contentType.toLowerCase();
    if (type === 'image/jpg') {
        return 'image/jpeg';
    }
    return type;
};
