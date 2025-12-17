import React, { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface MuxPlayerProps {
  playbackId: string;
  thumbnailUrl?: string;
  title?: string;
  onDurationChange?: (duration: number) => void;
  onViewTracked?: () => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mux-player': MuxPlayerElement;
    }
  }
}

interface MuxPlayerElement extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  'playback-id'?: string;
  'poster'?: string;
  'metadata-video-title'?: string;
  'stream-type'?: string;
  'controls'?: boolean;
  'muted'?: boolean;
  'playsinline'?: boolean;
  'preload'?: 'auto' | 'metadata' | 'none';
  'target-live-window'?: number;
  'min-resolution'?: string;
  'max-resolution'?: string;
  ref?: React.Ref<HTMLElement>;
}

type NetworkConnection = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';

export default function MuxPlayer({
  playbackId,
  thumbnailUrl,
  title,
  onDurationChange,
  onViewTracked,
}: MuxPlayerProps) {
  const playerRef = useRef<HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [networkConnection, setNetworkConnection] = useState<NetworkConnection>('unknown');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQualityInfo, setShowQualityInfo] = useState(false);
  const doubleClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detect network connection type for adaptive bitrate
  useEffect(() => {
    const detectNetwork = () => {
      if ((navigator as any).connection) {
        const connection = (navigator as any).connection;
        const effectiveType = connection.effectiveType || 'unknown';
        setNetworkConnection(effectiveType as NetworkConnection);
      } else if ((navigator as any).mozConnection) {
        const connection = (navigator as any).mozConnection;
        const effectiveType = connection.type || 'unknown';
        setNetworkConnection(effectiveType as NetworkConnection);
      }
    };

    detectNetwork();

    // Listen for network changes
    const connection = (navigator as any).connection || (navigator as any).mozConnection;
    if (connection) {
      connection.addEventListener('change', detectNetwork);
      return () => connection.removeEventListener('change', detectNetwork);
    }
  }, []);

  // Determine max resolution based on network connection
  const getOptimalMaxResolution = (): string => {
    switch (networkConnection) {
      case 'slow-2g':
      case '2g':
        return '480p'; // Low quality for slow networks
      case '3g':
        return '720p'; // Medium quality for 3G
      case '4g':
        return '1080p'; // Full quality for 4G/5G
      default:
        return isMobile ? '720p' : '1080p';
    }
  };

  // Determine preload strategy based on device and network
  const getPreloadStrategy = (): 'auto' | 'metadata' | 'none' => {
    // On mobile with slow connection, don't preload the full video
    if (isMobile && (networkConnection === 'slow-2g' || networkConnection === '2g')) {
      return 'metadata';
    }
    // On mobile, preload just metadata initially
    if (isMobile) {
      return 'metadata';
    }
    // Desktop: preload auto for better UX
    return 'auto';
  };

  // Handle fullscreen with mobile optimization
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  // Double-tap to toggle fullscreen on mobile
  const handlePlayerDoubleClick = () => {
    if (!containerRef.current) return;

    if (doubleClickTimeoutRef.current) {
      clearTimeout(doubleClickTimeoutRef.current);
      doubleClickTimeoutRef.current = null;

      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen?.().catch(err => {
          console.warn('Fullscreen request failed:', err);
        });
      } else {
        document.exitFullscreen?.().catch(err => {
          console.warn('Exit fullscreen failed:', err);
        });
      }
    } else {
      doubleClickTimeoutRef.current = setTimeout(() => {
        doubleClickTimeoutRef.current = null;
      }, 300);
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Player script is pre-loaded in App.tsx, just check if it's ready
  useEffect(() => {
    if (typeof (window as any).MuxPlayer === 'undefined') {
      const timer = setTimeout(() => {
        // Script should be loaded now
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!playerRef.current) return;

    const player = playerRef.current as any;

    const handlePlay = () => {
      setIsPlaying(true);
      if (!hasTrackedView && onViewTracked) {
        setHasTrackedView(true);
        onViewTracked();
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleDurationChange = () => {
      if (onDurationChange && player.duration) {
        onDurationChange(player.duration);
      }
    };

    const handleLoadedmetadata = () => {
      if (onDurationChange && player.duration) {
        onDurationChange(player.duration);
      }
    };

    if (player.addEventListener) {
      player.addEventListener('play', handlePlay);
      player.addEventListener('pause', handlePause);
      player.addEventListener('durationchange', handleDurationChange);
      player.addEventListener('loadedmetadata', handleLoadedmetadata);
    }

    return () => {
      if (player.removeEventListener) {
        player.removeEventListener('play', handlePlay);
        player.removeEventListener('pause', handlePause);
        player.removeEventListener('durationchange', handleDurationChange);
        player.removeEventListener('loadedmetadata', handleLoadedmetadata);
      }
    };
  }, [onDurationChange, onViewTracked, hasTrackedView]);

  if (error) {
    return (
      <div className="w-full bg-black rounded-lg flex items-center justify-center" style={{ aspectRatio: isMobile ? '9/16' : '16/9' }}>
        <div className="text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-gray-400 text-xs mt-2">Playback ID: {playbackId}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      style={{ aspectRatio: isMobile ? '9/16' : '16/9' }}
      onDoubleClick={handlePlayerDoubleClick}
    >
      <mux-player
        ref={playerRef}
        playback-id={playbackId}
        poster={thumbnailUrl}
        metadata-video-title={title || 'Video'}
        stream-type="on-demand"
        controls="true"
        playsinline="true"
        preload={getPreloadStrategy()}
        max-resolution={getOptimalMaxResolution()}
        style={{
          width: '100%',
          height: '100%',
          '--media-object-fit': isMobile ? 'contain' : 'cover',
        } as React.CSSProperties}
      />

      {/* Network Status and Quality Info Overlay */}
      {isMobile && (
        <button
          onClick={() => setShowQualityInfo(!showQualityInfo)}
          className="absolute top-4 right-4 z-20 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Network and Quality Info"
        >
          {networkConnection === '2g' || networkConnection === 'slow-2g' ? (
            <WifiOff className="w-4 h-4 text-yellow-400" />
          ) : (
            <Wifi className="w-4 h-4 text-green-400" />
          )}
        </button>
      )}

      {/* Quality Info Tooltip */}
      {showQualityInfo && isMobile && (
        <div className="absolute top-12 right-4 z-30 bg-gray-900/95 backdrop-blur p-3 rounded-lg text-xs text-gray-300 whitespace-nowrap">
          <div className="font-semibold text-white mb-1">Network: {networkConnection.toUpperCase()}</div>
          <div>Max Quality: {getOptimalMaxResolution()}</div>
          <div>Preload: {getPreloadStrategy()}</div>
          <div className="text-gray-400 mt-1 text-[10px]">Double-tap to toggle fullscreen</div>
        </div>
      )}

      {/* Mobile Help Text */}
      {isMobile && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="text-center text-gray-300 text-sm bg-black/50 px-4 py-2 rounded">
            <p>Double-tap for fullscreen</p>
          </div>
        </div>
      )}
    </div>
  );
}
