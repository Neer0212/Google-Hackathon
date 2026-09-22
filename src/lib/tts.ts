import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Central configuration mapping generic language codes to Google Cloud TTS language codes
export const LANGUAGE_CONFIG: Record<string, { languageCode: string, name?: string }> = {
  en: { languageCode: 'en-US' },
  hi: { languageCode: 'hi-IN' },
  gu: { languageCode: 'gu-IN' },
  mr: { languageCode: 'mr-IN' },
  bn: { languageCode: 'bn-IN' },
  ta: { languageCode: 'ta-IN' },
  te: { languageCode: 'te-IN' },
};

let ttsClient: TextToSpeechClient | null = null;

export const getTtsClient = () => {
  if (!ttsClient) {
    try {
      // It uses GOOGLE_APPLICATION_CREDENTIALS environment variable implicitly
      ttsClient = new TextToSpeechClient();
    } catch (error) {
      console.warn('Google Cloud TTS Client could not be initialized:', error);
      return null;
    }
  }
  return ttsClient;
};

export const getGoogleTtsLanguageCode = (languageCode: string): string => {
  const baseCode = languageCode.split('-')[0].toLowerCase();
  return LANGUAGE_CONFIG[baseCode]?.languageCode || languageCode;
};
