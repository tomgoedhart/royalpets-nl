"use client";

import { ImageCard } from "./image-card";
import { Lightbox } from "./lightbox";

interface GalleryGridProps {
  images: string[];
  selectedIndex: number | null;
  lightboxOpen: boolean;
  lightboxIndex: number;
  onSelectImage: (index: number) => void;
  onOpenLightbox: (index: number) => void;
  onCloseLightbox: () => void;
  onNavigateLightbox: (index: number) => void;
}

export function GalleryGrid({
  images,
  selectedIndex,
  lightboxOpen,
  lightboxIndex,
  onSelectImage,
  onOpenLightbox,
  onCloseLightbox,
  onNavigateLightbox,
}: GalleryGridProps) {
  if (images.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
        <p className="text-gray-500">Geen afbeeldingen beschikbaar</p>
      </div>
    );
  }

  return (
    <>
      {/* 2x2 Grid */}
      <div 
        className="grid grid-cols-2 gap-4 sm:gap-6"
        data-testid="gallery-grid"
      >
        {images.map((imageUrl, index) => (
          <ImageCard
            key={index}
            imageUrl={imageUrl}
            index={index}
            isSelected={selectedIndex === index}
            onSelect={onSelectImage}
            onView={onOpenLightbox}
          />
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        selectedIndex={selectedIndex}
        onClose={onCloseLightbox}
        onNavigate={onNavigateLightbox}
        onSelect={onSelectImage}
      />
    </>
  );
}
