import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    return qrCodeDataUrl
  } catch (error) {
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
    })

    return buffer
  } catch (error) {
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
