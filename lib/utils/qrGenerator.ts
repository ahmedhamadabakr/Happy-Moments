import QRCode from 'qrcode';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// ==============================================
// تهيئة Cloudinary
// ==============================================
// استخدم متغيرات البيئة لتهيئة الخدمة
// ستبحث المكتبة تلقائياً عن هذه المتغيرات
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * دالة لرفع Buffer إلى Cloudinary
 * @param buffer - محتوى الملف
 * @param options - خيارات الرفع (مثل public_id, folder)
 */
const uploadToCloudinary = (
  buffer: Buffer,
  options: object
): Promise<cloudinary.UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * توليد Token فريد وآمن
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * توليد QR Code كصورة Buffer
 */
export async function generateQRCode(data: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('فشل في توليد رمز QR');
  }
}

/**
 * توليد دعوة الضيف النهائية باستخدام Cloudinary
 * @param eventId - معرف الفعالية
 * @param guestId - معرف الضيف
 * @param invitationPublicId - الـ Public ID الخاص بقالب الدعوة على Cloudinary
 * @param qrCoordinates - إحداثيات وأبعاد الـ QR على الصورة
 * @param baseUrl - الرابط الأساسي للتطبيق
 */
export async function generateGuestInvitationWithQR(
  eventId: string,
  guestId: string,
  invitationPublicId: string,
  qrCoordinates: { x: number; y: number; width: number; height: number },
  baseUrl: string
): Promise<{
  qrToken: string;
  finalInvitationUrl: string;
}> {
  try {
    // 1. توليد Token فريد للتحقق
    const qrToken = generateSecureToken();
    
    // 2. إعداد بيانات QR (يمكن أن تكون رابط أو JSON)
    const qrData = `${baseUrl}/rsvp/${qrToken}`;

    // 3. توليد QR Code كـ Buffer
    const qrBuffer = await generateQRCode(qrData);

    // 4. رفع QR Code إلى Cloudinary
    const qrPublicId = `events/${eventId}/qrcodes/${guestId}_${Date.now()}`;
    await uploadToCloudinary(qrBuffer, {
      public_id: qrPublicId,
      folder: `events/${eventId}/qrcodes`,
      transformation: [{ width: qrCoordinates.width, height: qrCoordinates.height }]
    });

    // 5. إنشاء رابط الصورة النهائية مع دمج QR Code عبر Transformation
    // يتم وضع الـ QR Code كطبقة (overlay) فوق صورة الدعوة الأساسية
    const finalInvitationUrl = cloudinary.url(invitationPublicId, {
      transformation: [
        {
          overlay: {
            public_id: qrPublicId,
          },
          // تحديد أبعاد وموقع الـ QR
          width: qrCoordinates.width,
          height: qrCoordinates.height,
          // تحديد موقع الـ QR. يمكن استخدام g_north_west مع x,y
          gravity: 'north_west',
          x: qrCoordinates.x,
          y: qrCoordinates.y,
          crop: 'fill',
        },
      ],
    });

    return {
      qrToken,
      finalInvitationUrl,
    };
  } catch (error) {
    console.error('Error generating guest invitation with Cloudinary QR:', error);
    throw new Error('فشل في إنشاء دعوة الضيف باستخدام Cloudinary');
  }
}

/**
 * التحقق من صحة QR Token (يمكن تطويرها لاحقًا)
 */
export function verifyQRToken(token: string): boolean {
  // التحقق من أن Token بالطول الصحيح ويحتوي على أحرف وأرقام hexadecimal
  return token.length === 64 && /^[a-f0-9]+$/.test(token);
}
