import { supabase, supabaseAdmin } from '../db';

export const conversationService = {
    async create(name: string, phone: string, serviceMessage: string) {
        const { data, error } = await supabaseAdmin
            .from('conversations')
            .insert([{ name, phone, service_message: serviceMessage, status: 'NEW' }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async getAll({ search, status, dateFrom, dateTo, page = 1, limit = 50 }: any = {}) {
        let query = supabase
            .from('conversations')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(`phone.ilike.%${search}%,name.ilike.%${search}%`);
        }
        if (status) query = query.eq('status', status);
        if (dateFrom) query = query.gte('created_at', dateFrom);
        if (dateTo) query = query.lte('created_at', dateTo);

        const from = (page - 1) * limit;
        query = query.range(from, from + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, total: count };
    },

    async getById(id: string) {
        const [convResult, msgResult, fileResult] = await Promise.all([
            supabase.from('conversations').select('*').eq('id', id).single(),
            supabase.from('messages').select('*').eq('conversation_id', id).order('timestamp', { ascending: true }),
            supabase.from('files').select('*').eq('conversation_id', id).order('uploaded_at', { ascending: true }),
        ]);

        if (convResult.error) throw convResult.error;

        return {
            ...convResult.data,
            messages: msgResult.data || [],
            files: fileResult.data || [],
        };
    },

    async updateStatus(id: string, status: string) {
        const { data, error } = await supabaseAdmin
            .from('conversations')
            .update({ status })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async addMessage(conversationId: string, sender: string, message: string) {
        const { data, error } = await supabaseAdmin
            .from('messages')
            .insert([{ conversation_id: conversationId, sender, message }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async addFile(conversationId: string, fileUrl: string, fileType: string) {
        const { data, error } = await supabaseAdmin
            .from('files')
            .insert([{ conversation_id: conversationId, file_url: fileUrl, file_type: fileType }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async getStats() {
        const [newCount, contactedCount, completedCount] = await Promise.all([
            supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'NEW'),
            supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'CONTACTED'),
            supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
        ]);

        return {
            new: newCount.count || 0,
            contacted: contactedCount.count || 0,
            completed: completedCount.count || 0,
            total: (newCount.count || 0) + (contactedCount.count || 0) + (completedCount.count || 0),
        };
    },

    async delete(id: string) {
        const { error } = await supabaseAdmin
            .from('conversations')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
