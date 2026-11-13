import React, { useState, useEffect, useRef } from 'react';
import { ProductVisualBadge } from './LuxuryIcons';

export interface ProductImageProps {
  src?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  brand?: string;
  alt: string;
  category?: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet' | (string & {});
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  productId?: string | number;
  objectFit?: 'cover' | 'contain';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  image,
  imageUrl,
  image_url,
  brand,
  alt,
  category = 'bag',
  className = '',
  aspectRatio = 'square',
  productId,
  objectFit = 'cover'
}) => {
  // 1. Resolve source flexibly across all possible naming conventions
  const rawSrc = src ?? imageUrl ?? image ?? image_url;
  const effectiveSrc = typeof rawSrc === 'string' && rawSrc.trim() !== ''
    ? (rawSrc.startsWith('/') || rawSrc.startsWith('http://') || rawSrc.startsWith('https://') || rawSrc.startsWith('data:')
        ? rawSrc.trim()
        : '/' + rawSrc.trim())
    : null;

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sync state when effectiveSrc changes
  useEffect(() => {
    setHasError(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [effectiveSrc]);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : 'aspect-video';

  const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';

  // Fallback visual badge if no valid URL provided or loading errored out
  if (!effectiveSrc || hasError) {
    return (
      <div 
        className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center ${className}`}
        data-product-id={productId}
        data-image-status="fallback"
      >
        <ProductVisualBadge 
          brand={brand || alt} 
          category={category as any} 
          className="w-full h-full" 
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center ${className}`}
      data-product-id={productId}
      data-image-status={isLoaded ? 'ready' : 'loading'}
    >
      {/* Background loading pulse skeleton: rendered underneath image so it never obscures decoded content */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse z-0 pointer-events-none" 
          aria-hidden="true"
        />
      )}

      {/* 
        Image Element:
        - Never permanently hidden by opacity-0 to prevent browser caching/hydration race conditions.
        - Naturally displays pixels as soon as the browser decodes them.
      */}
      <img
        ref={(el) => {
          imgRef.current = el;
          if (el && el.complete && el.naturalWidth > 0 && !isLoaded) {
            setIsLoaded(true);
          }
        }}
        src={effectiveSrc}
        alt={alt}
        loading="eager"
        decoding="async"
        onLoad={() => {
          setIsLoaded(true);
          setHasError(false);
        }}
        onError={() => {
          console.warn(`[ProductImage] Failed to load "${effectiveSrc}" for "${alt}", falling back to badge.`);
          setHasError(true);
        }}
        className={`w-full h-full ${fitClass} object-center transition-opacity duration-300 relative z-10 ${
          isLoaded ? 'opacity-100' : 'opacity-95'
        }`}
      />
    </div>
  );
};
