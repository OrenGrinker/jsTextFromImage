import { ImageData, BatchImageResult } from './types';
export declare const getImageData: (imagePath: string) => Promise<ImageData>;
export declare const processBatchImages: (imagePaths: string[], processor: (imagePath: string) => Promise<string>, concurrentLimit?: number) => Promise<BatchImageResult[]>;
