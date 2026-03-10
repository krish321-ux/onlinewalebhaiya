class WhatsAppNotificationService {
    get accessToken() { return process.env.WHATSAPP_ACCESS_TOKEN; }
    get phoneNumberId() { return process.env.WHATSAPP_PHONE_NUMBER_ID; }
    get adminPhone() { return process.env.WHATSAPP_ADMIN_PHONE; }

    get isConfigured() {
        return (
            this.accessToken &&
            this.accessToken !== 'your_meta_access_token' &&
            this.phoneNumberId &&
            this.phoneNumberId !== 'your_phone_number_id' &&
            this.adminPhone
        );
    }

    async sendMessage(to: string, message: string) {
        if (!this.isConfigured) {
            console.log(`[WhatsApp Notification - MOCK] to ${to}:\n${message}`);
            return { success: false, mock: true };
        }

        try {
            const response = await fetch(
                `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to,
                        type: 'text',
                        text: { body: message },
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error('[WhatsApp Notification] API Error:', data);
                return { success: false, error: data.error?.message || 'WhatsApp API Error' };
            }

            console.log(`[WhatsApp Notification] Sent to ${to} successfully`);
            return { success: true, data };
        } catch (error: any) {
            console.error('[WhatsApp Notification] Send error:', error);
            return { success: false, error: error.message };
        }
    }

    async sendNewLeadNotification(name: string, phone: string, serviceMessage: string) {
        const message = `🔔 *New Lead via Chat*\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📝 Service: ${serviceMessage}\n📍 Source: Website Chat\n\n_Please follow up with the customer._`;
        return this.sendMessage(this.adminPhone!, message);
    }

    async sendNewServiceRequestNotification(name: string, phone: string, serviceType: string, state: string, caseId: string) {
        const message = `📋 *New Service Form Submitted*\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n🛠️ Service: ${serviceType}\n📍 State: ${state || 'N/A'}\n🆔 Case ID: ${caseId}\n\n_Login to admin panel to review the request._`;
        return this.sendMessage(this.adminPhone!, message);
    }

    async sendDocumentUploadNotification(name: string, phone: string, fileCount: number) {
        const message = `📎 *Customer Uploaded Documents*\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📁 Files: ${fileCount}\n\n_Check the admin dashboard to download files._`;
        return this.sendMessage(this.adminPhone!, message);
    }
}

export const whatsappNotification = new WhatsAppNotificationService();
