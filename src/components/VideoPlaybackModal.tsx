import React, { useState } from 'react';
import { X, Heart, Share2, Eye } from 'lucide-react';
import MuxPlayer from './MuxPlayer';

interface ContentItem {
  id: string;
  user_id: string;
  title: string;
  creator: string;
  description?: string;
  thumbnail_url: string;
  content_url: string;
  duration?: string;
  like_count: number;
  views_count?: number;
  type: string;
}

interface VideoPlaybackModalProps {
  isOpen: boolean;
  content: ContentItem | null;
  isLiked: boolean;
  onClose: () => void;
  onLikeToggle: (contentId: string) => void;
  onFollowToggle?: (creator: string) => void;
  isFollowing?: boolean;
}

export default function VideoPlaybackModal({
  isOpen,
  content,
  isLiked,
  onClose,
  onLikeToggle,
  onFollowToggle,
  isFollowing,
}: VideoPlaybackModalProps) {
  const [duration, setDuration] = useState<number | null>(null);

  if (!isOpen || !content) return null;

  // Extract playback ID from Mux stream URL or use it directly
  const getPlaybackId = () => {
    if (!content.content_url) return '';
    
    // If it's a Mux stream URL (https://stream.mux.com/{playback-id}.m3u8)
    if (content.content_url.includes('stream.mux.com')) {
      const match = content.content_url.match(/stream\.mux\.com\/([a-zA-Z0-9]+)/);
      return match ? match[1] : '';
    }
    
    // If it's already a playback ID
    if (!content.content_url.includes('://')) {
      return content.content_url;
    }
    
    return '';
  };

  const playbackId = getPlaybackId();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 z-50"
      onClick={onClose}
    >
      <div
        className={`glass-effect ${isMobile ? 'rounded-none' : 'rounded-2xl'} w-full ${isMobile ? 'h-full' : 'max-w-5xl max-h-[90vh]'}`}
        style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Hidden on mobile fullscreen */}
        {!isMobile && (
          <div className="sticky top-0 flex justify-between items-center p-4 border-b border-white/10 bg-gray-900/80 backdrop-blur z-10">
            <h2 className="text-xl font-bold text-white truncate">{content.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
          </div>
        )}

        {/* Scrollable Content Wrapper */}
        <div className="overflow-y-auto flex-1">
          {/* Video Player Section */}
          <div className={`bg-black flex justify-center ${isMobile ? 'p-0' : 'p-6'}`}>
            <div className={`w-full ${isMobile ? 'max-w-none' : 'max-w-4xl'}`}>
              {playbackId ? (
                <MuxPlayer
                  playbackId={playbackId}
                  thumbnailUrl={content.thumbnail_url}
                  title={content.title}
                  onDurationChange={(seconds) => setDuration(seconds)}
                />
              ) : (
                <div className="w-full bg-gray-800 rounded-lg flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                  <p className="text-red-400 text-sm">Unable to extract Mux playback ID from URL</p>
                </div>
              )}
            </div>
          </div>

          {/* Content Info */}
          <div className={`${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6'} border-t border-white/10`}>
            {/* Title and Duration */}
            <div>
              {isMobile && (
                <button
                  onClick={onClose}
                  className="mb-4 p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
              <h1 className={`${isMobile ? 'text-lg' : 'text-2xl md:text-3xl'} font-bold text-white mb-2`}>{content.title}</h1>
              <div className={`flex flex-wrap items-center ${isMobile ? 'gap-2 text-xs' : 'gap-4 text-sm'} text-gray-400`}>
                {content.views_count !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{content.views_count.toLocaleString()} views</span>
                  </div>
                )}
                {duration && (
                  <div className="flex items-center space-x-1">
                    <span>{formatDuration(duration)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{content.like_count.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'} py-4 border-y border-white/10`}>
              <div>
                <p className={`text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>By {content.creator}</p>
                <p className="text-gray-400 text-xs md:text-sm">Content Creator</p>
              </div>
              <button
                onClick={() => onFollowToggle?.(content.creator)}
                className={`${isMobile ? 'w-full' : ''} px-6 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Description */}
            {content.description && (
              <div>
                <h3 className={`text-white font-semibold mb-3 ${isMobile ? 'text-sm' : ''}`}>About this content</h3>
                <p className={`text-gray-300 leading-relaxed whitespace-pre-wrap ${isMobile ? 'text-xs' : 'text-sm'}`}>{content.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex gap-3 pt-4 border-t border-white/10 ${isMobile ? 'flex-col' : ''}`}>
              <button
                onClick={() => onLikeToggle(content.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all text-sm ${
                  isLiked
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'glass-effect text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart className="w-4 h-4 md:w-5 md:h-5" fill={isLiked ? 'currentColor' : 'none'} />
                <span>{isLiked ? 'Liked' : 'Like'}</span>
              </button>
              <button className={`flex-1 flex items-center justify-center space-x-2 py-3 glass-effect text-gray-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all text-sm`}>
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
