import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    
    if (!webhookUrl || webhookUrl === 'YOUR_N8N_WEBHOOK_URL') {
      return NextResponse.json(
        { error: 'Webhook URL not configured' }, 
        { status: 400 }
      );
    }

    console.log('Sending webhook to:', webhookUrl);
    console.log('Webhook payload:', body);

    // Forward the request to n8n webhook with timeout
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log('Webhook response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
    }

    const result = await response.text();
    console.log('Webhook success response:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook triggered successfully',
      response: result 
    });

  } catch (error) {
    console.error('Webhook proxy error:', error);
    
    // Return success even if webhook fails (don't break form submission)
    return NextResponse.json({
      success: false,
      error: 'Webhook failed but form submission was successful',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }); // Return 200 so form doesn't show error
  }
}
