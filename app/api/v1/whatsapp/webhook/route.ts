import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WhatsAppMessage } from '@/lib/models/WhatsAppMessage';
import { createSuccessResponse } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate webhook signature (implement based on your WhatsApp provider)
    // const signature = request.headers.get('x-webhook-signature');
    // if (!validateSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    await connectDB();

    const { messageId, status, timestamp, error } = body;

    if (!messageId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update message status
    const message = await WhatsAppMessage.findOne({ externalId: messageId });

    if (message) {
      message.status = status;
      
      if (status === 'delivered') {
        message.deliveredAt = timestamp ? new Date(timestamp) : new Date();
      } else if (status === 'read') {
        message.readAt = timestamp ? new Date(timestamp) : new Date();
      } else if (status === 'failed') {
        message.error = error || 'Delivery failed';
      }

      await message.save();
    }

    return NextResponse.json(
      createSuccessResponse({ updated: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      createSuccessResponse({ updated: false }),
      { status: 200 }
    );
  }
}

// GET for webhook verification (some providers require this)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your-verify-token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}
