'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  showDots?: boolean
  showArrows?: boolean
}

export function ImageCarousel({
  images,
  alt,
  className,
  aspectRatio = 'video',
  showDots = true,
  showArrows = true
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-lg bg-muted flex items-center justify-center",
        aspectRatio === 'square' && "aspect-square",
        aspectRatio === 'video' && "aspect-video",
        className
      )}>
        <span className="text-muted-foreground">No image available</span>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg group",
      aspectRatio === 'square' && "aspect-square",
      aspectRatio === 'video' && "aspect-video",
      className
    )}>
      {/* Main Image */}
      <div className="relative w-full h-full">
        <Image
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          className="object-contain transition-all duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={currentIndex === 0}
        />
      </div>

      {/* Navigation Arrows - Only show if more than one image */}
      {images.length > 1 && showArrows && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-80 hover:opacity-100 transition-all duration-200 z-10"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              goToPrevious()
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-80 hover:opacity-100 transition-all duration-200 z-10"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              goToNext()
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Dots Indicator - Only show if more than one image */}
      {images.length > 1 && showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-200 border-2",
                index === currentIndex 
                  ? "bg-white border-white" 
                  : "bg-white/30 border-white/50 hover:bg-white/60 hover:border-white/80"
              )}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                goToSlide(index)
              }}
            />
          ))}
        </div>
      )}

      {/* Touch/Swipe Support for Mobile */}
      {images.length > 1 && (
        <div
          className="absolute inset-0 cursor-pointer touch-pan-x"
          style={{ zIndex: 1 }}
          onTouchStart={(e) => {
            const touch = e.touches[0]
            if (!touch) return
            
            const touchStart = touch.clientX
            let hasMoved = false
            
            const handleTouchMove = (moveEvent: TouchEvent) => {
              hasMoved = true
            }
            
            const handleTouchEnd = (endEvent: TouchEvent) => {
              if (!hasMoved) return // Don't interfere with button clicks
              
              const touchEnd = endEvent.changedTouches[0]
              if (!touchEnd) return
              
              const diff = touchStart - touchEnd.clientX
              
              if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                  goToNext()
                } else {
                  goToPrevious()
                }
              }
              
              document.removeEventListener('touchmove', handleTouchMove)
              document.removeEventListener('touchend', handleTouchEnd)
            }
            
            document.addEventListener('touchmove', handleTouchMove)
            document.addEventListener('touchend', handleTouchEnd)
          }}
        />
      )}
    </div>
  )
}
