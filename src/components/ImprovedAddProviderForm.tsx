import React, { useState } from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import ProjectsPageAvatarUpload from './ProjectsPageAvatarUpload';

interface ImprovedAddProviderFormProps {
  onCreate: (provider: any, kind: 'talent' | 'team' | 'agency') => void;
  isLoading?: boolean;
}

export default function ImprovedAddProviderForm({
  onCreate,
  isLoading = false,
}: ImprovedAddProviderFormProps) {
  const [kind, setKind] = useState<'talent' | 'team' | 'agency'>('talent');
  const [name, setName] = useState('');
  const [titleOrType, setTitleOrType] = useState('');
  const [category, setCategory] = useState('digital-marketing');
  const [workLocation, setWorkLocation] = useState('remote');
  const [optionalLocation, setOptionalLocation] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [startingRate, setStartingRate] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [description, setDescription] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const categories = [
    'digital-marketing',
    'brand-ambassador',
    'media-communications',
    'media-production',
    'art-&-design',
    'modelling',
    'dance-&-choreography',
    'acting',
    'film-video-production',
    'audio-production',
    'music',
    'event-management',
    'photography',
    'design',
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Name is required';
    if (!titleOrType.trim()) {
      errors.titleOrType = kind === 'talent' ? 'Title is required' : 'Type/Role is required';
    }
    if (!description.trim()) errors.description = 'Description is required';
    if (services.length === 0) errors.services = 'Add at least one service';

    if (kind === 'talent') {
      if (!hourlyRate || Number(hourlyRate) <= 0) {
        errors.hourlyRate = 'Valid hourly rate is required';
      }
    } else {
      if (!startingRate || Number(startingRate) < 0) {
        errors.startingRate = 'Valid starting rate is required';
      }
      if (!teamSize || Number(teamSize) <= 0) {
        errors.teamSize = 'Valid team size is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddService = () => {
    const trimmed = serviceInput.trim();
    if (trimmed && !services.includes(trimmed) && services.length < 10) {
      setServices([...services, trimmed]);
      setServiceInput('');
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const provider: any = {
      name: name.trim(),
      title_or_type: titleOrType.trim(),
      category,
      work_location: workLocation,
      optional_location: optionalLocation.trim() || null,
      description: description.trim(),
      avatar_file: avatarFile, // File object, not URL
      services,
      status: 'draft',
    };

    if (kind === 'talent') {
      provider.hourly_rate = Number(hourlyRate);
    } else if (kind === 'teams') {
      provider.starting_rate = Number(startingRate);
      provider.team_size = Number(teamSize);
    } else {
      provider.starting_rate = Number(startingRate);
      provider.team_size = Number(teamSize);
    }

    try {
      onCreate(provider, kind);
      // Reset form
      setName('');
      setTitleOrType('');
      setCategory('digital-marketing');
      setWorkLocation('remote');
      setOptionalLocation('');
      setHourlyRate('');
      setStartingRate('');
      setTeamSize('');
      setDescription('');
      setServices([]);
      setServiceInput('');
      setAvatarFile(null);
      setAvatarPreview(null);
      setValidationErrors({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Provider Type Selection */}
      <div className="grid grid-cols-3 gap-3">
        {(['talent', 'team', 'agency'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setKind(type);
              setValidationErrors({});
            }}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              kind === type
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg'
                : 'glass-effect text-gray-300 hover:text-white border border-white/10'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Avatar Upload */}
      <ProjectsPageAvatarUpload
        onFileSelect={(file, preview) => {
          setAvatarFile(file);
          setAvatarPreview(preview);
        }}
        initialPreview={avatarPreview}
        providerType={kind}
      />

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {kind === 'talent' ? 'Full Name' : 'Business Name'}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (validationErrors.name) {
              setValidationErrors({ ...validationErrors, name: '' });
            }
          }}
          placeholder={kind === 'talent' ? 'John Doe' : 'Creative Studios'}
          className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all ${
            validationErrors.name ? 'border-red-500/50' : 'border-white/20'
          }`}
        />
        {validationErrors.name && (
          <p className="mt-1 text-xs text-red-400">{validationErrors.name}</p>
        )}
      </div>

      {/* Title/Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {kind === 'talent' ? 'Professional Title' : 'Business Type/Role'}
        </label>
        <input
          type="text"
          value={titleOrType}
          onChange={(e) => {
            setTitleOrType(e.target.value);
            if (validationErrors.titleOrType) {
              setValidationErrors({ ...validationErrors, titleOrType: '' });
            }
          }}
          placeholder={kind === 'talent' ? 'e.g., Digital Marketer' : 'e.g., Production House'}
          className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all ${
            validationErrors.titleOrType ? 'border-red-500/50' : 'border-white/20'
          }`}
        />
        {validationErrors.titleOrType && (
          <p className="mt-1 text-xs text-red-400">{validationErrors.titleOrType}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-gray-800">
              {cat.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Work Location */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Work Location</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['remote', 'on-site', 'hybrid', 'flexible'] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setWorkLocation(loc)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                workLocation === loc
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white'
                  : 'glass-effect text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {loc.charAt(0).toUpperCase() + loc.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Location */}
      {(workLocation === 'on-site' || workLocation === 'hybrid') && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
          <input
            type="text"
            value={optionalLocation}
            onChange={(e) => setOptionalLocation(e.target.value)}
            placeholder="e.g., Kampala, Uganda"
            className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
          />
        </div>
      )}

      {/* Pricing */}
      {kind === 'talent' ? (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Hourly Rate (UGX)</label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => {
              setHourlyRate(e.target.value);
              if (validationErrors.hourlyRate) {
                setValidationErrors({ ...validationErrors, hourlyRate: '' });
              }
            }}
            placeholder="e.g., 50000"
            className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all ${
              validationErrors.hourlyRate ? 'border-red-500/50' : 'border-white/20'
            }`}
          />
          {validationErrors.hourlyRate && (
            <p className="mt-1 text-xs text-red-400">{validationErrors.hourlyRate}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Starting Rate (UGX)
            </label>
            <input
              type="number"
              value={startingRate}
              onChange={(e) => {
                setStartingRate(e.target.value);
                if (validationErrors.startingRate) {
                  setValidationErrors({ ...validationErrors, startingRate: '' });
                }
              }}
              placeholder="e.g., 500000"
              className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all ${
                validationErrors.startingRate ? 'border-red-500/50' : 'border-white/20'
              }`}
            />
            {validationErrors.startingRate && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.startingRate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Team Size</label>
            <input
              type="number"
              value={teamSize}
              onChange={(e) => {
                setTeamSize(e.target.value);
                if (validationErrors.teamSize) {
                  setValidationErrors({ ...validationErrors, teamSize: '' });
                }
              }}
              placeholder="e.g., 5"
              className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all ${
                validationErrors.teamSize ? 'border-red-500/50' : 'border-white/20'
              }`}
            />
            {validationErrors.teamSize && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.teamSize}</p>
            )}
          </div>
        </div>
      )}

      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Services/Specialties
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={serviceInput}
            onChange={(e) => setServiceInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddService();
              }
            }}
            placeholder="e.g., Brand Strategy"
            className="flex-1 px-4 py-3 glass-effect rounded-xl border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={handleAddService}
            disabled={!serviceInput.trim() || services.length >= 10}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            Add
          </button>
        </div>

        {services.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-rose-500/20 border border-rose-400/50 rounded-lg"
              >
                <span className="text-sm text-rose-300">{service}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {validationErrors.services && (
          <p className="mt-2 text-xs text-red-400">{validationErrors.services}</p>
        )}
        <p className="mt-2 text-xs text-gray-400">{services.length} / 10 services added</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (validationErrors.description) {
              setValidationErrors({ ...validationErrors, description: '' });
            }
          }}
          placeholder="Tell potential clients about your experience, expertise, and what makes you special..."
          className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all resize-none h-32 ${
            validationErrors.description ? 'border-red-500/50' : 'border-white/20'
          }`}
        />
        {validationErrors.description && (
          <p className="mt-1 text-xs text-red-400">{validationErrors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">{description.length} / 500 characters</p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setKind('talent');
            setName('');
            setTitleOrType('');
            setCategory('digital-marketing');
            setWorkLocation('remote');
            setOptionalLocation('');
            setHourlyRate('');
            setStartingRate('');
            setTeamSize('');
            setDescription('');
            setServices([]);
            setServiceInput('');
            setAvatarFile(null);
            setAvatarPreview(null);
            setValidationErrors({});
          }}
          className="px-6 py-3 glass-effect text-gray-300 hover:text-white rounded-xl border border-white/10 transition-colors font-medium"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {isLoading ? 'Creating...' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
}
