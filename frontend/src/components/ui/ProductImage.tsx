import React, { useState } from 'react';
import { ProductVisualBadge } from './LuxuryIcons';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  category?: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet';
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export const ProductImage = ({
  src,
  alt,
  category = 'bag',
  className = '',
  aspectRatio = 'square'
}: ProductImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-video';

  // If no src is provided or image loading failed, fallback to the luxury vector visual badge
  if (!src || error) {
    return (
      <div className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center ${className}`}>
        <ProductVisualBadge category={category} className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center ${className}`}>
      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

