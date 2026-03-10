import { NextResponse } from 'next/server';
import { jobService } from '@/lib/services/jobService';
import { scholarshipService } from '@/lib/services/scholarshipService';
import { serviceRequestService } from '@/lib/services/serviceRequestService';
import { userProfileService } from '@/lib/services/userProfileService';
import { conversationService } from '@/lib/services/conversationService';
import { checkAdmin } from '@/lib/auth-server';

export async function GET(request: Request) {
    try {
        const admin = await checkAdmin(request);
        if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

        const [jobCount, scholarshipCount, requestCount, pendingCount, userCount, convStats] = await Promise.all([
            jobService.getJobCount(),
            scholarshipService.getScholarshipCount(),
            serviceRequestService.getRequestCount(),
            serviceRequestService.getRequestCount('Received'),
            userProfileService.getProfileCount(),
            conversationService.getStats(),
        ]);

        return NextResponse.json({
            totalJobs: jobCount || 0,
            totalScholarships: scholarshipCount || 0,
            totalRequests: requestCount || 0,
            pendingRequests: pendingCount || 0,
            totalUsers: userCount || 0,
            conversations: convStats,
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}
