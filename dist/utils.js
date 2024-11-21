"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageData = void 0;
// src/utils.ts
const axios_1 = __importDefault(require("axios"));
const mime_types_1 = __importDefault(require("mime-types"));
const getImageData = async (imageUrl) => {
    try {
        const response = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer' });
        if (response.status !== 200) {
            throw new Error(`Could not retrieve image from URL: ${imageUrl}`);
        }
        // Get content type
        let contentType = response.headers['content-type'];
        if (!contentType) {
            contentType = mime_types_1.default.lookup(imageUrl) || 'image/jpeg';
        }
        // Normalize content type
        contentType = contentType.toLowerCase();
        if (contentType === 'image/jpg') {
            contentType = 'image/jpeg';
        }
        // Encode image to base64
        const encodedImage = Buffer.from(response.data).toString('base64');
        return { encodedImage, contentType };
    }
    catch (error) {
        throw new Error(`Error fetching image data: ${error.message}`);
    }
};
exports.getImageData = getImageData;
