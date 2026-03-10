import { supabase, supabaseAdmin } from '../db';
import { conversationService } from './conversationService';
import { whatsappNotification } from './whatsappNotificationService';
import { generateEmbedding } from '../embeddingModel';
import { searchFAQsAndPages, SearchableItem } from '../vectorSearch';
import { normalizeQuery, prepareForEmbedding } from '../queryNormalizer';

const SERVICE_KEYWORDS = [
    'apply for', 'fill form', 'form fill', 'book ticket', 'book a',
    'online form', 'government form',
    'banwana', 'banwao', 'banana hai', 'karwana', 'dilwana', 'dilao',
    'karna hai', 'karwa do', 'karwa dena', 'bana do', 'bana dena',
    'chahiye form', 'form chahiye',
    'i want to apply', 'i need to apply', 'help me apply',
    'i want to book', 'i want to fill',
];

const sessions = new Map();

// In-memory cache for FAQ and page embeddings
let faqCache: SearchableItem[] | null = null;
let pageCache: SearchableItem[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class ChatbotService {
    getSession(sessionId: string) {
        if (!sessions.has(sessionId)) {
            sessions.set(sessionId, {
                state: 'idle',
                serviceMessage: null,
                name: null,
                phone: null,
                conversationId: null,
            });
        }
        return sessions.get(sessionId);
    }

    // --- Cache Management ---
    async getFAQsWithEmbeddings(): Promise<SearchableItem[]> {
        const now = Date.now();
        if (faqCache && now - cacheTimestamp < CACHE_TTL) return faqCache;

        const { data, error } = await supabase
            .from('chatbot_faq')
            .select('id, question, answer, category, keywords, embedding');
        if (error) {
            console.warn('Failed to fetch FAQs:', error.message);
            return faqCache || [];
        }
        faqCache = (data || []) as SearchableItem[];
        cacheTimestamp = now;
        return faqCache;
    }

    async getPagesWithEmbeddings(): Promise<SearchableItem[]> {
        const now = Date.now();
        if (pageCache && now - cacheTimestamp < CACHE_TTL) return pageCache;

        const { data, error } = await supabase
            .from('website_pages')
            .select('id, title, content, keywords, embedding');
        if (error) {
            console.warn('Failed to fetch pages:', error.message);
            return pageCache || [];
        }
        pageCache = (data || []) as SearchableItem[];
        return pageCache;
    }

    invalidateCache() {
        faqCache = null;
        pageCache = null;
        cacheTimestamp = 0;
    }

    // --- Main Message Handler ---
    async processMessage(sessionId: string, message: string) {
        const session = this.getSession(sessionId);
        const trimmed = message.trim();

        if (session.conversationId) {
            conversationService.addMessage(session.conversationId, 'user', trimmed).catch(() => { });
        }

        let response;
        switch (session.state) {
            case 'awaiting_name':
                response = await this.handleNameCapture(session, trimmed);
                break;
            case 'awaiting_phone':
                response = await this.handlePhoneCapture(session, trimmed);
                break;
            case 'lead_created':
            case 'idle':
            default:
                response = await this.handleFAQOrIntent(session, trimmed);
                break;
        }

        if (session.conversationId) {
            conversationService.addMessage(session.conversationId, 'bot', response.answer).catch(() => { });
        }

        return {
            answer: response.answer,
            source: response.source,
            state: session.state,
            conversationId: session.conversationId,
        };
    }

    isQuestionMessage(normalizedMessage: string) {
        const QUESTION_SIGNALS = [
            '?', 'what', 'how', 'when', 'where', 'why', 'which', 'who',
            'kya', 'kaise', 'kab', 'kahan', 'kyun', 'kaun',
            'kitna', 'kitni', 'kitne', 'bata', 'batao', 'tell',
            'fee', 'cost', 'charge', 'price', 'time', 'duration',
            'document', 'documents', 'required', 'requirement', 'requirements',
            'need', 'eligible', 'eligibility',
            'info', 'information', 'detail', 'details',
            'process', 'procedure', 'steps', 'step', 'list',
            'kya hai', 'kya hota', 'meaning', 'kitne din', 'kitna time',
            'difference', 'benefit', 'advantage',
        ];
        return QUESTION_SIGNALS.some(q => normalizedMessage.includes(q));
    }

    // --- Core FAQ/Intent Handler with Semantic Search ---
    async handleFAQOrIntent(session: any, message: string) {
        const normalized = message.toLowerCase();
        const isQuestion = this.isQuestionMessage(normalized);
        const isServiceRequest = this.detectServiceIntent(normalized);

        // Step 1: If it's clearly a service request (not a question), start lead capture
        if (isServiceRequest && !isQuestion) {
            session.state = 'awaiting_name';
            session.serviceMessage = message;
            return {
                answer: "I can help you with that! 🎯\n\nTo connect you with our team, I'll need a few details.\n\n👤 Please provide your **Name**:",
                source: 'service_intent',
            };
        }

        // Step 2: Try semantic search first
        try {
            const normalizedQuery = normalizeQuery(message);
            const queryText = prepareForEmbedding(message);
            const queryEmbedding = await generateEmbedding(queryText);

            const faqs = await this.getFAQsWithEmbeddings();
            const pages = await this.getPagesWithEmbeddings();
            const { match, source } = searchFAQsAndPages(queryEmbedding, faqs, pages, 0.55);

            if (match) {
                const answer = source === 'faq'
                    ? match.item.answer
                    : `📄 **${match.item.title}**\n\n${match.item.content}`;
                const confidence = Math.round(match.score * 100);
                console.log(`✅ Semantic match (${source}): score=${confidence}% for "${normalizedQuery}"`);
                this.logChat('website', null, message, answer);
                return { answer, source: `semantic_${source}` };
            }
        } catch (embeddingError: any) {
            console.warn('Semantic search failed (falling back to keyword search):', embeddingError.message);
        }

        // Step 3: Fallback to keyword search
        const faqByKeywords = await this.searchFAQByKeywords(normalized);
        if (faqByKeywords) {
            this.logChat('website', null, message, faqByKeywords.answer);
            return { answer: faqByKeywords.answer, source: 'database' };
        }

        // Step 4: Fallback to ilike question search
        const faqByQuestion = await this.searchFAQByQuestion(normalized);
        if (faqByQuestion) {
            this.logChat('website', null, message, faqByQuestion.answer);
            return { answer: faqByQuestion.answer, source: 'database' };
        }

        // Step 5: Full-text search
        const wordCount = normalized.trim().split(/\s+/).length;
        if (wordCount >= 2) {
            try {
                const { data: faqs, error } = await supabase
                    .from('chatbot_faq')
                    .select('*')
                    .textSearch('question', normalized, { type: 'websearch', config: 'english' });

                if (!error && faqs && faqs.length > 0) {
                    this.logChat('website', null, message, faqs[0].answer);
                    return { answer: faqs[0].answer, source: 'database' };
                }
            } catch (ftsErr: any) {
                console.warn('FTS search skipped:', ftsErr.message);
            }
        }

        // Step 6: If it was a service request after all, start lead capture
        if (isServiceRequest) {
            session.state = 'awaiting_name';
            session.serviceMessage = message;
            return {
                answer: "I can help you with that! 🎯\n\nTo connect you with our team, I'll need a few details.\n\n👤 Please provide your **Name**:",
                source: 'service_intent',
            };
        }

        // Step 7: Fallback message
        const fallbackResponse = "I'm sorry, I couldn't find an exact answer for that question. 🤔\n\nPlease contact **OnlinewaleBhaiya Cyber Cafe** for more details.\n\n📞 Or type something like **\"I want to apply for PAN card\"** and I'll connect you with our team.\n\n💬 You can also message us on WhatsApp for quick help!";
        this.logChat('website', null, message, fallbackResponse);
        return { answer: fallbackResponse, source: 'fallback' };
    }

    detectServiceIntent(normalizedMessage: string) {
        return SERVICE_KEYWORDS.some(keyword => normalizedMessage.includes(keyword));
    }

    async searchFAQByKeywords(normalizedMessage: string) {
        try {
            const words = normalizedMessage.split(/\s+/).filter(w => w.length > 2);
            if (words.length === 0) return null;

            const { data, error } = await supabase
                .from('chatbot_faq')
                .select('*')
                .overlaps('keywords', words);

            if (error || !data || data.length === 0) return null;
            return data[0];
        } catch (err: any) {
            console.warn('Keyword search failed:', err.message);
            return null;
        }
    }

    async searchFAQByQuestion(normalizedMessage: string) {
        try {
            const ACTION_WORDS = new Set([
                'apply', 'fill', 'book', 'ticket', 'correction', 'service',
                'form', 'online', 'registration', 'register', 'get', 'make',
                'want', 'need', 'help', 'chahiye', 'karna', 'karwa', 'banwana',
                'banwao', 'dilao', 'lagao',
            ]);
            const STOP_WORDS = new Set([
                'the', 'is', 'it', 'in', 'on', 'at', 'to', 'a', 'an', 'and', 'or',
                'for', 'of', 'do', 'i', 'me', 'my', 'we', 'you', 'how', 'what',
                'when', 'why', 'where', 'which', 'will', 'can', 'are', 'was', 'be',
                'by', 'with', 'from', 'that', 'this', 'are', 'has', 'have',
            ]);

            const words = normalizedMessage
                .split(/\s+/)
                .filter(w => w.length >= 3 && !STOP_WORDS.has(w) && !ACTION_WORDS.has(w));

            if (words.length === 0) return null;

            for (const word of words) {
                const { data, error } = await supabase
                    .from('chatbot_faq')
                    .select('*')
                    .ilike('question', `%${word}%`)
                    .limit(1);

                if (!error && data && data.length > 0) {
                    return data[0];
                }
            }
            return null;
        } catch (err: any) {
            console.warn('Question ilike search failed:', err.message);
            return null;
        }
    }

    // --- Lead Capture Flow (unchanged) ---
    async handleNameCapture(session: any, message: string) {
        if (message.length < 2 || message.length > 100) {
            return {
                answer: "That doesn't look like a valid name. Please enter your full name:",
                source: 'validation',
            };
        }

        session.name = message;
        session.state = 'awaiting_phone';

        return {
            answer: `Thanks, ${message}! 👋\n\n📞 Now please share your **Phone Number**:`,
            source: 'lead_capture',
        };
    }

    async handlePhoneCapture(session: any, message: string) {
        const phoneClean = message.replace(/[\s\-\(\)]/g, '');
        const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;

        if (!phoneRegex.test(phoneClean)) {
            return {
                answer: "Please enter a valid 10-digit Indian phone number:",
                source: 'validation',
            };
        }

        session.phone = phoneClean;
        session.state = 'lead_created';

        try {
            const conversation = await conversationService.create(
                session.name,
                session.phone,
                session.serviceMessage
            );
            session.conversationId = conversation.id;

            await conversationService.addMessage(conversation.id, 'user', session.serviceMessage);
            await conversationService.addMessage(conversation.id, 'bot', `Lead captured — Name: ${session.name}, Phone: ${session.phone}`);

            whatsappNotification.sendNewLeadNotification(
                session.name, session.phone, session.serviceMessage
            ).catch(err => console.error('WhatsApp notification failed:', err));

        } catch (error) {
            console.error('Error creating conversation:', error);
        }

        return {
            answer: `✅ Thank you, ${session.name}!\n\nYour request has been submitted:\n📝 Service: ${session.serviceMessage}\n📞 Phone: ${session.phone}\n\nOur team will contact you shortly! 🙏\n\n📎 You can also **upload documents** (photo, signature, PDF) using the upload button below if needed.`,
            source: 'lead_created',
        };
    }

    // --- File Upload (unchanged) ---
    async handleFileUpload(sessionId: string, fileUrl: string, fileType: string, providedConversationId?: string | null) {
        const session = this.getSession(sessionId);

        const activeConversationId = session.conversationId || providedConversationId;
        if (providedConversationId && !session.conversationId) {
            session.conversationId = providedConversationId;
        }

        try {
            if (!activeConversationId) {
                return {
                    success: false,
                    message: '⚠️ Please request a service first (e.g. "I want to apply for PAN card"), then upload your documents after providing your name and phone number.',
                    skipAutoDelete: true,
                };
            }

            await conversationService.addFile(activeConversationId, fileUrl, fileType);
            const conv = await conversationService.getById(activeConversationId);
            const fileCount = conv.files.length;

            await conversationService.addMessage(
                activeConversationId, 'user', `📎 Uploaded document: ${fileType}`
            );
            await conversationService.addMessage(
                activeConversationId, 'bot', '✅ Document received! Our team will review it shortly.'
            );

            whatsappNotification.sendDocumentUploadNotification(
                session.name || 'Customer',
                session.phone || 'N/A',
                fileCount
            ).catch(err => console.error('WhatsApp notification failed:', err));

            return {
                success: true,
                message: '✅ Document uploaded successfully! Our team will review it shortly.',
            };
        } catch (error) {
            console.error('File upload handling error:', error);
            return { success: false, message: 'Failed to process the upload. Please try again.' };
        }
    }

    // --- Logging ---
    async logChat(source: string, userId: string | null, message: string, response: string) {
        try {
            const { error } = await supabaseAdmin.from('chat_logs').insert([{
                source,
                user_id: userId,
                message,
                response,
            }]);
            if (error) console.warn('chat_logs insert error:', error.message);
        } catch (err: any) {
            console.warn('chat_logs insert exception:', err.message);
        }
    }

    async getChatLogs() {
        const { data, error } = await supabase
            .from('chat_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);
        if (error) throw error;
        return data;
    }

    // --- FAQ CRUD with Embedding Auto-Generation ---
    async getAllFAQs() {
        const { data, error } = await supabase
            .from('chatbot_faq')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    async addFAQ(question: string, answer: string, category: string, keywords: string[] = []) {
        // Generate embedding for the question
        let embedding: number[] | null = null;
        try {
            const embeddingText = prepareForEmbedding(question);
            embedding = await generateEmbedding(embeddingText);
        } catch (err: any) {
            console.warn('Embedding generation failed for FAQ, saving without:', err.message);
        }

        const { data, error } = await supabaseAdmin
            .from('chatbot_faq')
            .insert([{ question, answer, category, keywords, embedding }])
            .select();
        if (error) throw error;
        this.invalidateCache();
        return data[0];
    }

    async updateFAQ(id: string, updates: any) {
        // If question is being updated, regenerate the embedding
        if (updates.question) {
            try {
                const embeddingText = prepareForEmbedding(updates.question);
                updates.embedding = await generateEmbedding(embeddingText);
            } catch (err: any) {
                console.warn('Embedding regeneration failed:', err.message);
            }
        }

        const { data, error } = await supabaseAdmin
            .from('chatbot_faq')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw error;
        this.invalidateCache();
        return data[0];
    }

    async deleteFAQ(id: string) {
        const { error } = await supabaseAdmin.from('chatbot_faq').delete().eq('id', id);
        if (error) throw error;
        this.invalidateCache();
        return true;
    }

    async deleteFAQsByCategory(category: string) {
        const { error, count } = await supabaseAdmin
            .from('chatbot_faq')
            .delete()
            .eq('category', category);
        if (error) throw error;
        this.invalidateCache();
        return { deleted: count || 0 };
    }

    async bulkAddFAQs(items: { question: string; answer: string; category: string; keywords?: string[] }[]) {
        const BATCH_SIZE = 3;
        const BATCH_DELAY = 200; // ms between batches to avoid overwhelming the model
        const results: any[] = [];

        // Process embeddings in small batches to prevent timeouts with large pastes
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batch = items.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.allSettled(
                batch.map(async (item) => {
                    let embedding: number[] | null = null;
                    try {
                        const embeddingText = prepareForEmbedding(item.question);
                        embedding = await generateEmbedding(embeddingText);
                    } catch (err: any) {
                        console.warn('Embedding generation failed for bulk FAQ item:', err.message);
                    }
                    return {
                        question: item.question,
                        answer: item.answer,
                        category: item.category,
                        keywords: item.keywords || [],
                        embedding,
                    };
                })
            );

            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    // Even if Promise.allSettled rejects, still save the FAQ without embedding
                    const idx = batchResults.indexOf(result);
                    const item = batch[idx];
                    console.warn('Bulk FAQ batch item failed entirely:', result.reason);
                    results.push({
                        question: item.question,
                        answer: item.answer,
                        category: item.category,
                        keywords: item.keywords || [],
                        embedding: null,
                    });
                }
            }

            // Small delay between batches to let the model breathe
            if (i + BATCH_SIZE < items.length) {
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
            }
        }

        const { data, error } = await supabaseAdmin
            .from('chatbot_faq')
            .insert(results)
            .select();
        if (error) throw error;
        this.invalidateCache();
        return data;
    }

    // --- Website Pages CRUD ---
    async getAllPages() {
        const { data, error } = await supabase
            .from('website_pages')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    async addPage(title: string, content: string, keywords: string[] = []) {
        let embedding: number[] | null = null;
        try {
            const embeddingText = prepareForEmbedding(`${title} ${content}`);
            embedding = await generateEmbedding(embeddingText);
        } catch (err: any) {
            console.warn('Embedding generation failed for page:', err.message);
        }

        const { data, error } = await supabaseAdmin
            .from('website_pages')
            .insert([{ title, content, keywords, embedding }])
            .select();
        if (error) throw error;
        this.invalidateCache();
        return data[0];
    }

    async updatePage(id: string, updates: any) {
        if (updates.title || updates.content) {
            try {
                const current = updates;
                const embeddingText = prepareForEmbedding(
                    `${current.title || ''} ${current.content || ''}`
                );
                updates.embedding = await generateEmbedding(embeddingText);
                updates.updated_at = new Date().toISOString();
            } catch (err: any) {
                console.warn('Embedding regeneration failed for page:', err.message);
            }
        }

        const { data, error } = await supabaseAdmin
            .from('website_pages')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw error;
        this.invalidateCache();
        return data[0];
    }

    async deletePage(id: string) {
        const { error } = await supabaseAdmin.from('website_pages').delete().eq('id', id);
        if (error) throw error;
        this.invalidateCache();
        return true;
    }
}

export const chatbotService = new ChatbotService();
