export declare class BatchProcessor {
    static processBatch<T>(items: T[], processor: (item: T) => Promise<any>, concurrency?: number): Promise<any[]>;
}
