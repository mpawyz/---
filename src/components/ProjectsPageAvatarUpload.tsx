import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

interface ProjectsPageAvatarUploadProps {
  onFileSelect: (file: File | null, preview: string | null) => void;
  initialPreview?: string;
  providerType?: 'talent' | 'team' | 'agency';
}

export default function ProjectsPageAvatarUpload({
  onFileSelect,
  initialPreview,
  providerType = 'talent',
}: ProjectsPageAvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFile = (file: File) => {
    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      onFileSelect(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {providerType === 'talent' ? 'Profile Picture' : 'Logo/Avatar'}
      </label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-rose-400 bg-rose-500/10'
            : 'border-white/20 bg-white/5 hover:border-rose-400/50 hover:bg-rose-500/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 mx-auto rounded-lg object-cover border border-white/20"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">Image selected</p>
              <p className="text-xs text-gray-400">Click to change</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <div>
              <p className="text-sm font-medium text-white">
                Drag and drop your {providerType === 'talent' ? 'photo' : 'logo'}
              </p>
              <p className="text-xs text-gray-400">or click to browse (Max 5MB)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {preview && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setPreview(null);
            onFileSelect(null, null);
          }}
          className="flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
          Remove image
        </button>
      )}
    </div>
  );
}
