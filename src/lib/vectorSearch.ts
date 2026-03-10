/**
 * Vector similarity search utilities.
 * Uses cosine similarity to compare embedding vectors.
 */

export interface SearchableItem {
    id: string;
    embedding: number[] | null;
    [key: string]: any;
}

/**
 * Calculate cosine similarity between two vectors.
 * Returns a value between -1 and 1, where 1 means identical.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
}

export interface SearchResult {
    item: SearchableItem;
    score: number;
}

/**
 * Find the best matching item from a list using cosine similarity.
 * Returns null if no item meets the threshold.
 */
export function findBestMatch(
    queryEmbedding: number[],
    items: SearchableItem[],
    threshold: number = 0.65
): SearchResult | null {
    let bestMatch: SearchResult | null = null;

    for (const item of items) {
        if (!item.embedding || item.embedding.length === 0) continue;

        const score = cosineSimilarity(queryEmbedding, item.embedding);
        if (score >= threshold && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { item, score };
        }
    }

    return bestMatch;
}

/**
 * Get top N matches sorted by similarity score.
 */
export function findTopMatches(
    queryEmbedding: number[],
    items: SearchableItem[],
    topN: number = 3,
    threshold: number = 0.5
): SearchResult[] {
    const results: SearchResult[] = [];

    for (const item of items) {
        if (!item.embedding || item.embedding.length === 0) continue;

        const score = cosineSimilarity(queryEmbedding, item.embedding);
        if (score >= threshold) {
            results.push({ item, score });
        }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topN);
}

/**
 * Search both FAQs and website pages, return the single best match.
 */
export function searchFAQsAndPages(
    queryEmbedding: number[],
    faqs: SearchableItem[],
    pages: SearchableItem[],
    threshold: number = 0.65
): { match: SearchResult | null; source: 'faq' | 'page' | null } {
    const faqMatch = findBestMatch(queryEmbedding, faqs, threshold);
    const pageMatch = findBestMatch(queryEmbedding, pages, threshold);

    if (!faqMatch && !pageMatch) {
        return { match: null, source: null };
    }

    if (!faqMatch) return { match: pageMatch, source: 'page' };
    if (!pageMatch) return { match: faqMatch, source: 'faq' };

    // Return whichever has a higher score
    if (faqMatch.score >= pageMatch.score) {
        return { match: faqMatch, source: 'faq' };
    }
    return { match: pageMatch, source: 'page' };
}
