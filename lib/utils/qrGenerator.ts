import QRCode from 'qrcode';
import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

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
    const qrBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return qrBuffer;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('فشل في توليد رمز QR');
  }
}

/**
 * دمج QR Code مع صورة الدعوة
 */
export async function overlayQROnInvitation(
  invitationImagePath: string,
  qrBuffer: Buffer,
  coordinates: { x: number; y: number; width: number; height: number }
): Promise<Buffer> {
  try {
    // قراءة صورة الدعوة
    const invitationBuffer = await fs.readFile(invitationImagePath);
    
    // تغيير حجم QR Code
    const resizedQR = await sharp(qrBuffer)
      .resize(coordinates.width, coordinates.height)
      .toBuffer();
    
    // دمج QR مع صورة الدعوة
    const finalImage = await sharp(invitationBuffer)
      .composite([
        {
          input: resizedQR,
          top: coordinates.y,
          left: coordinates.x,
        },
      ])
      .toBuffer();
    
    return finalImage;
  } catch (error) {
    console.error('Error overlaying QR on invitation:', error);
    throw new Error('فشل في دمج رمز QR مع صورة الدعوة');
  }
}

/**
 * حفظ صورة في المسار المحدد
 */
export async function saveImage(
  buffer: Buffer,
  directory: string,
  filename: string
): Promise<string> {
  try {
    // التأكد من وجود المجلد
    await fs.mkdir(directory, { recursive: true });
    
    const filePath = path.join(directory, filename);
    await fs.writeFile(filePath, buffer);
    
    return filePath;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('فشل في حفظ الصورة');
  }
}

/**
 * توليد QR Token وإنشاء الصورة النهائية
 */
export async function generateGuestInvitationWithQR(
  eventId: string,
  guestId: string,
  invitationImagePath: string,
  qrCoordinates: { x: number; y: number; width: number; height: number },
  baseUrl: string
): Promise<{
  qrToken: string;
  qrImagePath: string;
  finalInvitationImagePath: string;
}> {
  try {
    // توليد Token فريد
    const qrToken = generateSecureToken();
    
    // بيانات QR (رابط للتحقق)
    const qrData = JSON.stringify({
      eventId,
      guestId,
      token: qrToken,
      url: `${baseUrl}/api/v1/check-in/verify/${qrToken}`,
    });
    
    // توليد QR Code
    const qrBuffer = await generateQRCode(qrData);
    
    // حفظ QR Code
    const qrDirectory = path.join(process.cwd(), 'public', 'qr-codes', eventId);
    const qrFilename = `${guestId}-qr.png`;
    const qrImagePath = await saveImage(qrBuffer, qrDirectory, qrFilename);
    
    // دمج QR مع صورة الدعوة
    const finalImageBuffer = await overlayQROnInvitation(
      invitationImagePath,
      qrBuffer,
      qrCoordinates
    );
    
    // حفظ الصورة النهائية
    const invitationDirectory = path.join(process.cwd(), 'public', 'invitations', eventId);
    const invitationFilename = `${guestId}-invitation.png`;
    const finalInvitationImagePath = await saveImage(
      finalImageBuffer,
      invitationDirectory,
      invitationFilename
    );
    
    return {
      qrToken,
      qrImagePath: `/qr-codes/${eventId}/${qrFilename}`,
      finalInvitationImagePath: `/invitations/${eventId}/${invitationFilename}`,
    };
  } catch (error) {
    console.error('Error generating guest invitation with QR:', error);
    throw new Error('فشل في إنشاء دعوة الضيف');
  }
}

/**
 * التحقق من صحة QR Token
 */
export function verifyQRToken(token: string): boolean {
  // التحقق من أن Token بالطول الصحيح
  return token.length === 64 && /^[a-f0-9]+$/.test(token);
}
