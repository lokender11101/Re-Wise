'use client';

import { useEffect } from 'react';

export interface UseKeyboardNavOptions {
  onNext?: () => void;
  onPrev?: () => void;
  onFlip?: () => void;
  onMarkKnown?: () => void;
  onMarkReview?: () => void;
  enabled?: boolean;
}

/**
 * Handles accessible keyboard navigation for flashcards and interactive study views.
 * Safely ignores key events when focused on input fields or textareas.
 */
export function useKeyboardNav({
  onNext,
  onPrev,
  onFlip,
  onMarkKnown,
  onMarkReview,
  enabled = true,
}: UseKeyboardNavOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.getAttribute('contenteditable') === 'true';

      if (isInput) return;

      switch (event.code) {
        case 'Space':
        case 'Enter':
          event.preventDefault();
          onFlip?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext?.();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrev?.();
          break;
        case 'Digit1':
        case 'KeyK':
          event.preventDefault();
          onMarkKnown?.();
          break;
        case 'Digit2':
        case 'KeyL':
          event.preventDefault();
          onMarkReview?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onNext, onPrev, onFlip, onMarkKnown, onMarkReview]);
}
