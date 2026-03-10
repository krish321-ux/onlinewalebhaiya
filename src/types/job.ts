export type Job = {
    id: string;
    title: string;
    department: string;
    eligibility?: string;
    last_date?: string;
    apply_link?: string;
    notification_url?: string;
    state?: string;
    qualification?: string;
    stream?: string;
    category?: string;
    job_type?: string;
    no_of_vacancy?: number;
    apply_start_date?: string;
    detail_content?: string;
    is_active: boolean;
    created_at: string;
};
