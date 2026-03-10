import { supabase, supabaseAdmin } from '../db';

export const userProfileService = {
    async saveProfile(profileData: any) {
        const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('phone', profileData.phone)
            .single();

        if (existing) {
            const { data, error } = await supabaseAdmin
                .from('user_profiles')
                .update({
                    state: profileData.state,
                    qualification: profileData.qualification,
                    stream: profileData.stream,
                    interests: profileData.interests || [],
                    updated_at: new Date().toISOString()
                })
                .eq('phone', profileData.phone)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const { data, error } = await supabaseAdmin
                .from('user_profiles')
                .insert([{
                    phone: profileData.phone,
                    state: profileData.state,
                    qualification: profileData.qualification,
                    stream: profileData.stream,
                    interests: profileData.interests || []
                }])
                .select();
            if (error) throw error;
            return data[0];
        }
    },

    async getProfile(phone: string) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('phone', phone)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async getRecommendations(profileData: any) {
        let query = supabase.from('jobs').select('*').eq('is_active', true);

        if (profileData.state) {
            query = query.or(`state.eq.${profileData.state},state.is.null`);
        }
        if (profileData.qualification) {
            query = query.or(`qualification.eq.${profileData.qualification},qualification.is.null`);
        }
        if (profileData.stream) {
            query = query.or(`stream.eq.${profileData.stream},stream.is.null`);
        }

        query = query.order('created_at', { ascending: false }).limit(20);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getProfileCount() {
        const { count, error } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
        if (error) throw error;
        return count;
    }
};
