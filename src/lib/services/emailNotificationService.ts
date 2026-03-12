import nodemailer from 'nodemailer';

const ADMIN_EMAIL = 'ewm2798@gmail.com';

class EmailNotificationService {
    private transporter: nodemailer.Transporter | null = null;
    private initialized = false;

    private init() {
        if (this.initialized) return;

        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;

        if (!user || !pass) {
            console.warn('EMAIL_USER and/or EMAIL_PASS not fully configured in .env.local. Email notifications are disabled.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass,
            },
        });

        this.initialized = true;
    }

    async sendNewLeadEmail(name: string, phone: string, serviceMessage: string) {
        this.init();
        if (!this.transporter) return;

        const mailOptions = {
            from: `"Online Wale Bhaiya" <${process.env.EMAIL_USER}>`,
            to: ADMIN_EMAIL,
            subject: `🚨 NEW CHATBOT LEAD: ${name} (${phone})`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #E8652D; margin-top: 0;">🤖 New Chatbot Lead Captured</h2>
                    <p style="font-size: 16px; color: #333;">A user has submitted their contact details via the website chatbot regarding a service.</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                <a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service Requested:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; color: #b91c1c; font-weight: bold;">${serviceMessage}</td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 6px; text-align: center;">
                        <a href="https://wa.me/91${phone.replace(/[\+\s\-]/g, '')}" style="display: inline-block; padding: 10px 20px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Chat on WhatsApp</a>
                    </div>
                    
                    <p style="color: #64748b; font-size: 12px; margin-top: 20px; text-align: center;">This is an automated system notification from Online Wale Bhaiya.</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`[Email] New Chatbot Lead email sent to ${ADMIN_EMAIL}`);
        } catch (error) {
            console.error('[Email] Failed to send new chatbot lead email:', error);
        }
    }

    async sendNewServiceRequestEmail(name: string, phone: string, serviceType: string, state: string, caseId: string) {
        this.init();
        if (!this.transporter) return;

        const mailOptions = {
            from: `"Online Wale Bhaiya" <${process.env.EMAIL_USER}>`,
            to: ADMIN_EMAIL,
            subject: `📋 NEW CONTACT FORM SUBMISSION: ${name} - ${serviceType}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #2563eb; margin-top: 0;">📋 New Contact Page Submission</h2>
                    <p style="font-size: 16px; color: #333;">You have received a new service request from the contact form.</p>
                    
                    <div style="background-color: #f1f5f9; padding: 10px 15px; border-radius: 6px; margin-bottom: 20px; font-family: monospace; font-size: 16px;">
                        <strong>CASE ID:</strong> ${caseId}
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                <a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">State:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${state}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Category:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; color: #E8652D; font-weight: bold;">${serviceType}</td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 6px; text-align: center;">
                        <a href="https://wa.me/91${phone.replace(/[\+\s\-]/g, '')}" style="display: inline-block; padding: 10px 20px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Follow-up on WhatsApp</a>
                    </div>
                    
                    <p style="color: #64748b; font-size: 12px; margin-top: 20px; text-align: center;">This is an automated system notification from Online Wale Bhaiya.</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`[Email] New Contact Request email sent to ${ADMIN_EMAIL}`);
        } catch (error) {
            console.error('[Email] Failed to send new contact request email:', error);
        }
    }
}

export const emailNotification = new EmailNotificationService();
