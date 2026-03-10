import { supabase, supabaseAdmin } from '../db';

export const scholarshipService = {
    async getAllScholarships(filters: any = {}) {
        let query = supabase.from('scholarships').select('*', { count: 'exact' }).eq('is_active', true);

        if (filters.state) query = query.eq('state', filters.state);
        if (filters.qualification) query = query.eq('qualification', filters.qualification);
        if (filters.stream) query = query.eq('stream', filters.stream);

        query = query.order('created_at', { ascending: false });

        if (filters.limit) {
            const limit = parseInt(filters.limit, 10);
            const offset = parseInt(filters.offset || '0', 10);
            query = query.range(offset, offset + limit - 1);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return filters.limit ? { data, total: count } : data;
    },

    async getScholarshipById(id: string) {
        const { data, error } = await supabase.from('scholarships').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    },

    async createScholarship(scholarshipData: any) {
        const { data, error } = await supabaseAdmin.from('scholarships').insert([scholarshipData]).select();
        if (error) throw error;
        return data[0];
    },

    async updateScholarship(id: string, updates: any) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabaseAdmin.from('scholarships').update(updates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async deleteScholarship(id: string) {
        const { error } = await supabaseAdmin.from('scholarships').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async getScholarshipCount() {
        const { count, error } = await supabase.from('scholarships').select('*', { count: 'exact', head: true });
        if (error) throw error;
        return count;
    }
};
