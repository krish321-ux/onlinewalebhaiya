// Singleton model loader for Xenova/all-MiniLM-L6-v2
// Loads once on server and stays in memory for fast subsequent requests

let pipeline: any = null;
let modelLoading: Promise<any> | null = null;

async function getModel() {
    if (pipeline) return pipeline;

    if (modelLoading) return modelLoading;

    modelLoading = (async () => {
        try {
            // Dynamic import to avoid bundling issues
            const { pipeline: transformersPipeline } = await import('@xenova/transformers');
            pipeline = await transformersPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                // Ensure we use WASM backend (works in Node.js and serverless)
                quantized: true,
            });
            console.log('✅ Embedding model loaded successfully');
            return pipeline;
        } catch (error) {
            modelLoading = null;
            console.error('❌ Failed to load embedding model:', error);
            throw error;
        }
    })();

    return modelLoading;
}

/**
 * Generate a semantic embedding vector for the given text.
 * Returns a number[] of 384 dimensions (MiniLM-L6-v2 output size).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const model = await getModel();
    const output = await model(text, { pooling: 'mean', normalize: true });
    // Convert tensor to plain array
    return Array.from(output.data as Float32Array);
}

/**
 * Generate embeddings for multiple texts.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
        results.push(await generateEmbedding(text));
    }
    return results;
}
