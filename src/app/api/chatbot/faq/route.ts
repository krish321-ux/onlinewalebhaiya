import { NextResponse } from 'next/server';
import { chatbotService } from '@/lib/services/chatbotService';
import { checkAdmin } from '@/lib/auth-server';

export async function GET() {
    try {
        const faqs = await chatbotService.getAllFAQs();
        return NextResponse.json(faqs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const body = await request.json();

        // Bulk mode: { bulk: true, items: [{question, answer, category, keywords}] }
        if (body.bulk && Array.isArray(body.items)) {
            const results = await chatbotService.bulkAddFAQs(body.items);
            return NextResponse.json(results, { status: 201 });
        }

        // Single FAQ mode
        const { question, answer, category, keywords } = body;
        const newFAQ = await chatbotService.addFAQ(question, answer, category, keywords || []);

        return NextResponse.json(newFAQ, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const { category } = await request.json();
        if (!category) return NextResponse.json({ error: 'Category is required' }, { status: 400 });

        const result = await chatbotService.deleteFAQsByCategory(category);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
