import { supabase, supabaseAdmin } from '../db';

export const galleryService = {
    async getActiveImages() {
        const { data, error } = await supabase
            .from('gallery_images')
            .select('id, image_url, title, sort_order')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    async getAllImages() {
        const { data, error } = await supabaseAdmin
            .from('gallery_images')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    async addImage(imageUrl: string, title = '', sortOrder = 0) {
        const { data, error } = await supabaseAdmin
            .from('gallery_images')
            .insert([{ image_url: imageUrl, title, sort_order: sortOrder }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async updateImage(id: string, updates: any) {
        const { data, error } = await supabaseAdmin
            .from('gallery_images')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async deleteImage(id: string) {
        const { data: img } = await supabaseAdmin
            .from('gallery_images')
            .select('image_url')
            .eq('id', id)
            .single();

        if (img?.image_url) {
            const parts = img.image_url.split('/');
            const fileName = parts[parts.length - 1];
            await supabaseAdmin.storage.from('gallery').remove([fileName]);
        }

        const { error } = await supabaseAdmin.from('gallery_images').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};
