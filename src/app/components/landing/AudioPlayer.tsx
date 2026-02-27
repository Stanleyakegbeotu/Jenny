import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { trackAudioPlay } from '../../../lib/analytics';

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  bookId?: string;
  bookTitle?: string;
}

export function AudioPlayer({ audioUrl, title, bookId, bookTitle }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set up audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (bookId && bookTitle) {
        trackAudioPlay(bookId, bookTitle, audio.duration);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [bookId, bookTitle]);

  // Handle play/pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioUrl) {
      setError('No audio available');
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      if (!audio.src && audioUrl) {
        audio.src = audioUrl;
        setIsLoading(true);
      }
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        setError('Failed to play audio');
      });
    }
  };

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Demo mode if no audio URL provided
  const isDemo = !audioUrl;

  return (
    <>
      {/* Hidden audio element */}
      {!isDemo && <audio ref={audioRef} crossOrigin="anonymous" />}

      <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-4 border border-border/50 shadow-xl">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12"
            onClick={togglePlay}
            disabled={!audioUrl && !isDemo}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-muted-foreground w-12">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSliderChange}
                className="flex-1"
                disabled={!audioUrl && !isDemo}
              />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {formatTime(duration)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {title || 'Audio Narration'} {isLoading && '(Loading...)'}
            </div>
            {error && <div className="text-xs text-destructive mt-1">{error}</div>}
          </div>

          {/* Volume Control */}
          <div
            className="relative"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="relative"
            >
              {volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>

            {/* Volume slider popup */}
            {showVolumeSlider && (
              <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-lg p-2 w-8 flex justify-center">
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="h-24 vertical"
                  orientation="vertical"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
