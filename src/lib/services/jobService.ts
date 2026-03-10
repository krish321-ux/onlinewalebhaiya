import { supabase, supabaseAdmin } from '../db';

export const jobService = {
    async getAllJobs(filters: any = {}) {
        let query = supabase.from('jobs').select('*', { count: 'exact' }).eq('is_active', true);

        if (filters.state) query = query.eq('state', filters.state);
        if (filters.qualification) query = query.eq('qualification', filters.qualification);
        if (filters.stream) query = query.eq('stream', filters.stream);
        if (filters.job_type) query = query.eq('job_type', filters.job_type);
        if (filters.category) query = query.eq('category', filters.category);

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

    async getJobById(id: string) {
        const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    },

    async createJob(jobData: any) {
        const { data, error } = await supabaseAdmin.from('jobs').insert([jobData]).select();
        if (error) throw error;
        return data[0];
    },

    async updateJob(id: string, updates: any) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabaseAdmin.from('jobs').update(updates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async deleteJob(id: string) {
        const { error } = await supabaseAdmin.from('jobs').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async getJobCount() {
        const { count, error } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
        if (error) throw error;
        return count;
    }
};
