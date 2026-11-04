import React, { useState, useEffect } from 'react';
import { ProductVisualBadge } from './LuxuryIcons';

export interface ProductImageProps {
  src?: string | null;
  alt: string;
  category?: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet' | (string & {});
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  productId?: string | number;
  objectFit?: 'cover' | 'contain';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category = 'bag',
  className = '',
  aspectRatio = 'square',
  productId,
  objectFit = 'cover'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Re-initialize state when src changes
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [src]);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : 'aspect-video';

  const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';

  // If no src is provided or image loading failed, fallback to the luxury vector visual badge
  if (!src || error) {
    if (import.meta.env?.DEV) {
      console.warn(`[ProductImage] Fallback badge rendered for "${alt}" (id: ${productId || 'unknown'}, src: ${src || 'null'})`);
    }
    return (
      <div 
        className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center ${className}`}
        data-product-id={productId}
        data-image-status="fallback"
      >
        <ProductVisualBadge category={category as any} className="w-full h-full" />
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center ${className}`}
      data-product-id={productId}
      data-image-status={loading ? 'loading' : 'ready'}
    >
      {/* Loading Skeleton */}
      {loading && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse z-0" 
          aria-hidden="true"
        />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={(e) => {
          if (e.currentTarget.naturalWidth > 0 && e.currentTarget.naturalHeight > 0) {
            setLoading(false);
          } else {
            console.error(`[ProductImage] Invalid zero-dimension image: ${src}`);
            setError(true);
            setLoading(false);
          }
        }}
        onError={() => {
          console.error(`[ProductImage] Failed to load image: ${src} for product "${alt}"`);
          setError(true);
          setLoading(false);
        }}
        className={`w-full h-full ${fitClass} object-center transition-opacity duration-300 z-10 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};
