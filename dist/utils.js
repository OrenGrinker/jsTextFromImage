"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBatchImages = exports.getImageData = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const axios_1 = __importDefault(require("axios"));
const p_limit_1 = __importDefault(require("p-limit"));
const VALID_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
function getValidMediaType(contentType) {
    const normalizedType = contentType.toLowerCase();
    if (VALID_MEDIA_TYPES.includes(normalizedType)) {
        return normalizedType;
    }
    if (normalizedType === 'image/jpg') {
        return 'image/jpeg';
    }
    return 'image/jpeg';
}
const getImageData = async (imagePath) => {
    const isUrl = (path) => {
        try {
            new URL(path);
            return true;
        }
        catch {
            return false;
        }
    };
    try {
        if (isUrl(imagePath)) {
            const response = await axios_1.default.get(imagePath, {
                responseType: 'arraybuffer'
            });
            if (response.status !== 200) {
                throw new Error('Could not retrieve image from URL');
            }
            return {
                encodedImage: Buffer.from(response.data).toString('base64'),
                contentType: getValidMediaType(response.headers['content-type'] || 'image/jpeg')
            };
        }
        else {
            const buffer = await promises_1.default.readFile(imagePath);
            const ext = imagePath.split('.').pop()?.toLowerCase() || 'jpg';
            const contentType = getValidMediaType({
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                gif: 'image/gif',
                webp: 'image/webp'
            }[ext] || 'image/jpeg');
            return {
                encodedImage: buffer.toString('base64'),
                contentType
            };
        }
    }
    catch (error) {
        if (isUrl(imagePath)) {
            throw new Error(`Failed to fetch image from URL: ${error.message}`);
        }
        else {
            throw new Error(`Failed to read local image: ${error.message}`);
        }
    }
};
exports.getImageData = getImageData;
const processBatchImages = async (imagePaths, processor, concurrentLimit = 3) => {
    if (imagePaths.length > 20) {
        throw new Error('Maximum of 20 images allowed per batch request');
    }
    const limit = (0, p_limit_1.default)(concurrentLimit);
    const tasks = imagePaths.map(imagePath => limit(async () => {
        try {
            const description = await processor(imagePath);
            return {
                success: true,
                description,
                imagePath
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                imagePath
            };
        }
    }));
    return Promise.all(tasks);
};
exports.processBatchImages = processBatchImages;
