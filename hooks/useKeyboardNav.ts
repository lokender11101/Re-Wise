'use client';

import { useEffect, RefObject } from 'react';

export interface UseKeyboardNavOptions {
  onNext?: () => void;
  onPrev?: () => void;
  onFlip?: () => void;
  onMarkKnown?: () => void;
  onMarkReview?: () => void;
  enabled?: boolean;
  containerRef?: RefObject<HTMLElement | null>;
}

/**
 * Handles accessible keyboard navigation for flashcards and interactive study views.
 * Scoped so shortcuts only fire when the flashcard interaction is active (container has focus).
 * Safely ignores key events when focused on input fields, textareas, or external widgets (like quizzes).
 */
export function useKeyboardNav({
  onNext,
  onPrev,
  onFlip,
  onMarkKnown,
  onMarkReview,
  enabled = true,
  containerRef,
}: UseKeyboardNavOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const activeTag = (activeElement?.tagName || '').toLowerCase();
      const isInput =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeElement?.getAttribute('contenteditable') === 'true';

      if (isInput) return;

      // Scope check: if a containerRef is provided, ensure focus is currently inside this container.
      // This prevents multiple flashcard blocks from colliding and stops quiz numbers (1-6) from marking flashcards.
      if (containerRef && containerRef.current) {
        if (!containerRef.current.contains(activeElement)) {
          return;
        }
      }

      switch (event.code) {
        case 'Space':
        case 'Enter':
          event.preventDefault();
          onFlip?.();
          break;
        case 'ArrowRight':
        case 'KeyJ':
          event.preventDefault();
          onNext?.();
          break;
        case 'ArrowLeft':
        case 'KeyK':
          event.preventDefault();
          onPrev?.();
          break;
        case 'Digit1':
        case 'KeyM':
          event.preventDefault();
          onMarkKnown?.();
          break;
        case 'Digit2':
        case 'KeyR':
          event.preventDefault();
          onMarkReview?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onNext, onPrev, onFlip, onMarkKnown, onMarkReview, containerRef]);
}

