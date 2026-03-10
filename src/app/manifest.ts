import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Online Wale Bhaiya',
        short_name: 'OWB',
        description: 'Your one-stop destination for Government Jobs, Scholarships, Form Filling, and Online Services across India.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#E8652D',
        icons: [
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
