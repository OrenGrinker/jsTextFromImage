// src/batch-processor.ts
export class BatchProcessor {
  static async processBatch<T>(
    items: T[],
    processor: (item: T) => Promise<any>,
    concurrency: number = 3
  ): Promise<any[]> {
    const results: any[] = [];
    const chunks = [];
    
    for (let i = 0; i < items.length; i += concurrency) {
      chunks.push(items.slice(i, i + concurrency));
    }
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(item => processor(item))
      );
      
      results.push(...chunkResults.map(result => 
        result.status === 'fulfilled' ? result.value : result.reason
      ));
    }
    
    return results;
  }
}