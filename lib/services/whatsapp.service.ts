/**
 * خدمة WhatsApp Business API
 * يجب تكوين المتغيرات البيئية:
 * - WHATSAPP_API_URL
 * - WHATSAPP_API_TOKEN
 * - WHATSAPP_PHONE_NUMBER_ID
 */

export interface WhatsAppMessagePayload {
  to: string; // رقم الهاتف
  type: 'text' | 'image' | 'template';
  text?: {
    body: string;
  };
  image?: {
    link: string;
    caption?: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components: any[];
  };
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppInvitationData {
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  locationUrl: string;
  invitationImageUrl: string;
  acceptUrl: string;
  declineUrl: string;
}

class WhatsAppService {
  private apiUrl: string;
  private apiToken: string;
  private phoneNumberId: string;
  private baseUrl: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    this.apiToken = process.env.WHATSAPP_API_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  /**
   * إرسال رسالة WhatsApp
   */
  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    try {
      if (!this.apiToken || !this.phoneNumberId) {
        console.warn('WhatsApp API not configured');
        return {
          success: false,
          error: 'WhatsApp API غير مكون',
        };
      }

      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: payload.to,
          ...payload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API error:', errorData);
        return {
          success: false,
          error: errorData.error?.message || 'فشل في إرسال الرسالة',
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error.message || 'خطأ في إرسال الرسالة',
      };
    }
  }

  /**
   * إرسال دعوة عبر WhatsApp
   */
  async sendInvitation(
    phoneNumber: string,
    invitationData: WhatsAppInvitationData
  ): Promise<WhatsAppSendResult> {
    try {
      // إرسال صورة الدعوة
      const imageResult = await this.sendMessage({
        to: phoneNumber,
        type: 'image',
        image: {
          link: `${this.baseUrl}${invitationData.invitationImageUrl}`,
          caption: `🎉 دعوة: ${invitationData.eventTitle}`,
        },
      });

      if (!imageResult.success) {
        return imageResult;
      }

      // إرسال رسالة نصية مع التفاصيل والأزرار
      const messageText = `
مرحباً ${invitationData.guestName}! 👋

يسعدنا دعوتك لحضور:
📅 ${invitationData.eventTitle}

🗓 التاريخ: ${invitationData.eventDate}
🕐 الوقت: ${invitationData.eventTime}
📍 المكان: ${invitationData.location}

🗺 رابط الموقع:
${invitationData.locationUrl}

يرجى تأكيد حضورك:
✅ قبول: ${invitationData.acceptUrl}
❌ اعتذار: ${invitationData.declineUrl}

نتطلع لرؤيتك! 🎊
      `.trim();

      const textResult = await this.sendMessage({
        to: phoneNumber,
        type: 'text',
        text: {
          body: messageText,
        },
      });

      return textResult;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      return {
        success: false,
        error: error.message || 'فشل في إرسال الدعوة',
      };
    }
  }

  /**
   * معالجة Webhook من WhatsApp
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      // معالجة حالة التسليم
      if (payload.entry?.[0]?.changes?.[0]?.value?.statuses) {
        const statuses = payload.entry[0].changes[0].value.statuses;
        
        for (const status of statuses) {
          const messageId = status.id;
          const statusType = status.status; // sent, delivered, read, failed
          
          console.log(`WhatsApp message ${messageId} status: ${statusType}`);
          
          // هنا يمكن تحديث حالة الرسالة في قاعدة البيانات
          // await updateMessageStatus(messageId, statusType);
        }
      }

      // معالجة الرسائل الواردة
      if (payload.entry?.[0]?.changes?.[0]?.value?.messages) {
        const messages = payload.entry[0].changes[0].value.messages;
        
        for (const message of messages) {
          const from = message.from;
          const text = message.text?.body;
          
          console.log(`Received message from ${from}: ${text}`);
          
          // هنا يمكن معالجة الرسائل الواردة من الضيوف
          // await handleGuestMessage(from, text);
        }
      }
    } catch (error) {
      console.error('Error handling WhatsApp webhook:', error);
    }
  }

  /**
   * التحقق من Webhook Verification
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'your-verify-token';
    
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    
    return null;
  }
}

export const whatsappService = new WhatsAppService();
