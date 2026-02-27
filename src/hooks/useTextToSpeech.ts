import { useState, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseTextToSpeechReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  speak: (text: string, voiceIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  setVoice: (index: number) => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const [isSupported] = useState(() => {
    return typeof window !== 'undefined' && ('speechSynthesis' in window || 'webkitSpeechSynthesis' in window);
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(options.rate ?? 1);
  const [pitch, setPitch] = useState(options.pitch ?? 1);
  const [volume, setVolume] = useState(options.volume ?? 1);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis and get available voices
  const initializeSynthesis = useCallback(() => {
    if (typeof window === 'undefined') return;

    const synth = window.speechSynthesis || (window as any).webkitSpeechSynthesis;
    synthRef.current = synth;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();

    // Some browsers load voices asynchronously
    synth.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  const speak = useCallback((text: string, voiceIndex: number = 0) => {
    if (!isSupported || !synthRef.current) {
      initializeSynthesis();
      if (!synthRef.current) return;
    }

    const synth = synthRef.current;

    // Cancel any ongoing speech
    synth.cancel();

    if (!voices.length) {
      initializeSynthesis();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const voiceToUse = voices[voiceIndex] || voices[0];
    if (voiceToUse) {
      utterance.voice = voiceToUse;
      setSelectedVoice(voiceToUse);
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, [isSupported, voices, rate, pitch, volume, initializeSynthesis]);

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const handleSetRate = useCallback((newRate: number) => {
    setRate(newRate);
    if (utteranceRef.current) {
      utteranceRef.current.rate = newRate;
    }
  }, []);

  const handleSetPitch = useCallback((newPitch: number) => {
    setPitch(newPitch);
    if (utteranceRef.current) {
      utteranceRef.current.pitch = newPitch;
    }
  }, []);

  const handleSetVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume;
    }
  }, []);

  const handleSetVoice = useCallback((index: number) => {
    if (voices[index]) {
      setSelectedVoice(voices[index]);
    }
  }, [voices]);

  // Initialize on first render
  if (isSupported && !synthRef.current) {
    initializeSynthesis();
  }

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    speak,
    pause,
    resume,
    stop,
    setRate: handleSetRate,
    setPitch: handleSetPitch,
    setVolume: handleSetVolume,
    setVoice: handleSetVoice,
  };
}
