import { supabase, supabaseAdmin } from '../db';

export const filterService = {
    async getStates() {
        const { data, error } = await supabase.from('filter_states').select('*').order('name');
        if (error) throw error;
        return data;
    },

    async getQualifications() {
        const { data, error } = await supabase.from('filter_qualifications').select('*').order('name');
        if (error) throw error;
        return data;
    },

    async getStreams() {
        const { data, error } = await supabase.from('filter_streams').select('*').order('name');
        if (error) throw error;
        return data;
    },

    async addState(name: string) {
        const { data, error } = await supabaseAdmin.from('filter_states').insert([{ name }]).select();
        if (error) throw error;
        return data[0];
    },

    async addQualification(name: string) {
        const { data, error } = await supabaseAdmin.from('filter_qualifications').insert([{ name }]).select();
        if (error) throw error;
        return data[0];
    },

    async addStream(name: string) {
        const { data, error } = await supabaseAdmin.from('filter_streams').insert([{ name }]).select();
        if (error) throw error;
        return data[0];
    },

    async deleteState(id: string) {
        const { error } = await supabaseAdmin.from('filter_states').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async deleteQualification(id: string) {
        const { error } = await supabaseAdmin.from('filter_qualifications').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async deleteStream(id: string) {
        const { error } = await supabaseAdmin.from('filter_streams').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};
