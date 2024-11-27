"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessor = void 0;
// src/batch-processor.ts
class BatchProcessor {
    static async processBatch(items, processor, concurrency = 3) {
        const results = [];
        const chunks = [];
        for (let i = 0; i < items.length; i += concurrency) {
            chunks.push(items.slice(i, i + concurrency));
        }
        for (const chunk of chunks) {
            const chunkResults = await Promise.allSettled(chunk.map(item => processor(item)));
            results.push(...chunkResults.map(result => result.status === 'fulfilled' ? result.value : result.reason));
        }
        return results;
    }
}
exports.BatchProcessor = BatchProcessor;
