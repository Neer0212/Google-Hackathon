'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Square, Loader2, Cloud } from 'lucide-react';

interface AudioButtonProps {
  text: string;
  languageCode: string;
}

type AudioState = 'idle' | 'loading' | 'playing' | 'error';

// Keep track of globally playing HTML5 Audio to prevent overlapping
let currentGlobalAudio: HTMLAudioElement | null = null;

export default function AudioButton({ text, languageCode }: AudioButtonProps) {
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [usingCloud, setUsingCloud] = useState(false);
  
  // Track native voice availability
  const [hasNativeVoice, setHasNativeVoice] = useState(false);
  const [bestNativeVoice, setBestNativeVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Keep a reference to the active utterance to cancel if needed
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    
    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return; // Wait for onvoiceschanged
      
      const targetLangBase = languageCode.split('-')[0].toLowerCase();
      const match = voices.find(v => v.lang.toLowerCase().startsWith(targetLangBase));
      
      if (match) {
        setBestNativeVoice(match);
        setHasNativeVoice(true);
      } else {
        setHasNativeVoice(false);
      }
    };

    checkVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = checkVoices;
    }
    
    return () => {
      stopPlayback();
    };
  }, [languageCode]);

  const stopPlayback = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentGlobalAudio) {
      currentGlobalAudio.pause();
      currentGlobalAudio.currentTime = 0;
      currentGlobalAudio = null;
    }
    setAudioState('idle');
  };

  const playWithCloudTTS = async () => {
    setUsingCloud(true);
    setAudioState('loading');
    
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageCode }),
      });
      
      if (!res.ok) {
        const errorBody = await res.text();
        console.error('Cloud TTS returned non-OK response', {
          status: res.status,
          statusText: res.statusText,
          body: errorBody
        });
        throw new Error('Cloud TTS failed');
      }
      
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      currentGlobalAudio = audio;
      
      audio.onended = () => {
        setAudioState('idle');
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        console.error('HTMLAudioElement playback error');
        setAudioState('idle');
        alert('Audio is currently unavailable for this language.');
      };
      
      setAudioState('playing');
      await audio.play();
      
    } catch (error) {
      console.error('Google Cloud TTS fallback failed', error);
      setAudioState('idle');
      alert('Audio is currently unavailable for this language.');
    }
  };

  const togglePlay = () => {
    if (audioState === 'playing' || audioState === 'loading') {
      stopPlayback();
      return;
    }
    
    // Stop any existing global audio before starting this one
    stopPlayback();

    // Priority 1: Browser TTS
    if (hasNativeVoice && 'speechSynthesis' in window && bestNativeVoice) {
      setUsingCloud(false);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = bestNativeVoice;
      utteranceRef.current = utterance;

      utterance.onstart = () => {
        setAudioState('playing');
      };

      utterance.onend = () => {
        setAudioState('idle');
      };

      utterance.onerror = (e) => {
        console.error('Speech synthesis error', e);
        // If native TTS fails (e.g. language-unavailable despite our check), fallback to Cloud
        window.speechSynthesis.cancel();
        playWithCloudTTS();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Priority 2: Google Cloud TTS
      playWithCloudTTS();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={togglePlay}
        disabled={audioState === 'loading'}
        className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded text-sm transition-colors border ${
          audioState === 'playing'
            ? 'bg-[#EBF5ED] text-[#1F542A] border-[#EBF5ED]' 
            : audioState === 'loading'
            ? 'bg-[#F7F7F5] text-[#787774] border-[#E9E9E7] cursor-wait'
            : 'bg-white text-[#37352F] border-[#E9E9E7] hover:bg-[#F7F7F5]'
        }`}
      >
        {audioState === 'playing' && (
          <>
            <Square size={14} fill="currentColor" /> Playing
          </>
        )}
        {audioState === 'loading' && (
          <>
            <Loader2 size={14} className="animate-spin" /> Loading
          </>
        )}
        {audioState === 'idle' && (
          <>
            <Play size={14} fill="currentColor" /> Play Audio
          </>
        )}
      </button>
      
      {/* Subtle indicator for cloud TTS */}
      {audioState === 'playing' && usingCloud && (
        <span className="text-[10px] text-[#787774] flex items-center gap-1 font-mono uppercase tracking-wider">
          <Cloud size={10} /> Cloud
        </span>
      )}
    </div>
  );
}
