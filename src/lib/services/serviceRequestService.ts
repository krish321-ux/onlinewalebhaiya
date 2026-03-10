import { supabase, supabaseAdmin } from '../db';

export const serviceRequestService = {
    async createRequest(requestData: any) {
        const caseId = `CASE-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        const newRequest = {
            ...requestData,
            case_id: caseId,
            status: 'Received',
            document_expires_at: requestData.document_url
                ? new Date(Date.now() + 60 * 1000).toISOString() // Expires in 60s
                : null
        };

        const { data, error } = await supabaseAdmin.from('service_requests').insert([newRequest]).select();
        if (error) throw error;
        return data[0];
    },

    async getStatusByCaseId(caseId: string) {
        const { data, error } = await supabase
            .from('service_requests')
            .select('case_id, status, service_type, name, phone, created_at, updated_at')
            .eq('case_id', caseId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async getAllRequests() {
        const { data, error } = await supabase
            .from('service_requests')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async updateStatus(id: string, status: string) {
        const { data, error } = await supabaseAdmin
            .from('service_requests')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async getRequestCount(status?: string) {
        let query = supabase.from('service_requests').select('*', { count: 'exact', head: true });
        if (status) query = query.eq('status', status);
        const { count, error } = await query;
        if (error) throw error;
        return count;
    },

    async getLeads() {
        const { data, error } = await supabase
            .from('service_requests')
            .select('id, name, phone, state, service_type, status, created_at')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async deleteRequest(id: string) {
        const { error } = await supabaseAdmin
            .from('service_requests')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
