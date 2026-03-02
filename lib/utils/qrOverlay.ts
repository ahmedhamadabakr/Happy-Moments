import sharp from 'sharp';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs/promises';

export interface QROverlayOptions {
  invitationImagePath: string;
  qrToken: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  outputDir: string;
  eventId: string;
  guestId: string;
}

/**
 * Generate QR code and overlay it on invitation image
 */
export async function generateQROverlay(options: QROverlayOptions): Promise<{
  qrImagePath: string;
  finalImagePath: string;
}> {
  const { invitationImagePath, qrToken, coordinates, outputDir, eventId, guestId } = options;

  // Create output directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });

  // Generate QR code URL (for RSVP page)
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${qrToken}`;

  // Generate QR code as buffer
  const qrBuffer = await QRCode.toBuffer(qrUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: coordinates.width,
    margin: 1,
  });

  // Save QR code separately
  const qrImagePath = path.join(outputDir, `qr-${eventId}-${guestId}.png`);
  await fs.writeFile(qrImagePath, qrBuffer);

  // Load invitation image
  const invitationBuffer = await fs.readFile(invitationImagePath);

  // Overlay QR code on invitation image
  const finalImageBuffer = await sharp(invitationBuffer)
    .composite([
      {
        input: qrBuffer,
        top: coordinates.y,
        left: coordinates.x,
      },
    ])
    .toBuffer();

  // Save final composed image
  const finalImagePath = path.join(outputDir, `invitation-${eventId}-${guestId}.png`);
  await fs.writeFile(finalImagePath, finalImageBuffer);

  return {
    qrImagePath,
    finalImagePath,
  };
}

/**
 * Generate QR code only (without overlay)
 */
export async function generateQRCode(
  qrToken: string,
  outputPath: string,
  size: number = 300
): Promise<string> {
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${qrToken}`;

  await QRCode.toFile(outputPath, qrUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: size,
    margin: 1,
  });

  return outputPath;
}

/**
 * Validate image file
 */
export async function validateImageFile(filePath: string): Promise<boolean> {
  try {
    const metadata = await sharp(filePath).metadata();
    return !!(metadata.width && metadata.height);
  } catch (error) {
    return false;
  }
}
