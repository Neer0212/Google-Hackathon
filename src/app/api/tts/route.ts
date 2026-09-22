import { NextRequest, NextResponse } from 'next/server';
import { getTtsClient, getGoogleTtsLanguageCode } from '@/lib/tts';

const MAX_TTS_LENGTH = 5000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, languageCode } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Valid text is required' }, { status: 400 });
    }

    if (text.length > MAX_TTS_LENGTH) {
      return NextResponse.json({ error: 'Text exceeds maximum length' }, { status: 400 });
    }

    if (!languageCode || typeof languageCode !== 'string') {
      return NextResponse.json({ error: 'Valid languageCode is required' }, { status: 400 });
    }

    const client = getTtsClient();
    if (!client) {
      return NextResponse.json({ error: 'TTS Service is currently unavailable.' }, { status: 503 });
    }

    const googleCloudLanguageCode = getGoogleTtsLanguageCode(languageCode);

    const request = {
      input: { text },
      voice: { languageCode: googleCloudLanguageCode },
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    const [response] = await client.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No audio content returned from Google Cloud TTS');
    }

    // Return the audio as a response
    const audioData = response.audioContent;
    
    return new NextResponse(audioData as any, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error: any) {
    // 2. console.error the complete server-side error
    console.error('API TTS Error Details:', error);
    
    // 3. Return a safe JSON response without exposing credentials/stack traces
    return NextResponse.json(
      { error: 'Cloud TTS request failed' },
      { status: 500 }
    );
  }
}
