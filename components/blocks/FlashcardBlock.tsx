'use client';

import React, { useState } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  Keyboard,
  Shuffle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import type { FlashcardBlock as FlashcardBlockType } from '@/types/study';

export interface FlashcardBlockProps {
  block: FlashcardBlockType;
  progressMap?: { [cardId: string]: 'known' | 'learning' };
  onMarkCard?: (cardId: string, status: 'known' | 'learning') => void;
}

export const FlashcardBlock: React.FC<FlashcardBlockProps> = ({
  block,
  progressMap = {},
  onMarkCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState(block.cards);

  const currentCard = cards[currentIndex] || cards[0];
  const totalCards = cards.length;

  // Handle card navigation
  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleMarkKnown = () => {
    if (currentCard && onMarkCard) {
      onMarkCard(currentCard.id, 'known');
    }
  };

  const handleMarkReview = () => {
    if (currentCard && onMarkCard) {
      onMarkCard(currentCard.id, 'learning');
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  useKeyboardNav({
    onNext: handleNext,
    onPrev: handlePrev,
    onFlip: handleFlip,
    onMarkKnown: handleMarkKnown,
    onMarkReview: handleMarkReview,
    enabled: true,
  });

  const cardStatus = currentCard ? progressMap[currentCard.id] : undefined;

  // Calculate mastery statistics
  const knownCount = cards.filter((c) => progressMap[c.id] === 'known').length;
  const learningCount = cards.filter((c) => progressMap[c.id] === 'learning').length;

  return (
    <Card className="space-y-5 animate-fade-in border-[#252525] bg-[#101010]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F1F1F] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-medium tracking-wider text-[#737373] uppercase">
              Active Recall
            </span>
            <h3 className="text-base md:text-lg font-semibold text-[#F5F5F5]">
              Interactive Flashcards
            </h3>
          </div>
        </div>

        {/* Action controls & Counter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="p-1.5 text-[#737373] hover:text-[#F5F5F5] hover:bg-[#141414] rounded-lg transition-colors border border-[#252525]"
            title="Shuffle flashcards"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <div className="px-2.5 py-1 bg-[#141414] rounded-lg text-xs font-mono font-medium text-[#A3A3A3] border border-[#252525]">
            {currentIndex + 1} / {totalCards}
          </div>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[#737373]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            Mastered: <span className="text-[#A3A3A3] font-mono">{knownCount}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#525252]" />
            Review: <span className="text-[#A3A3A3] font-mono">{learningCount}</span>
          </span>
          <span>Remaining: <span className="text-[#A3A3A3] font-mono">{totalCards - (knownCount + learningCount)}</span></span>
        </div>
        <div className="h-1 w-full bg-[#181818] rounded-full overflow-hidden flex">
          <div
            className="bg-white transition-all duration-300"
            style={{ width: `${(knownCount / totalCards) * 100}%` }}
          />
          <div
            className="bg-[#525252] transition-all duration-300"
            style={{ width: `${(learningCount / totalCards) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleFlip();
          }
        }}
        aria-label={`Flashcard: ${isFlipped ? 'Answer' : 'Question'}. Click to flip.`}
        className="relative w-full min-h-[220px] md:min-h-[260px] cursor-pointer select-none rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-200 bg-[#0C0C0C] border border-[#252525] hover:border-[#444444] group"
      >
        {/* Card Top Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#525252]">#{currentIndex + 1}</span>
            {currentCard?.difficulty && (
              <Badge variant="neutral" size="sm">
                {currentCard.difficulty}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {cardStatus === 'known' && (
              <Badge variant="primary">
                <CheckCircle2 className="w-3 h-3 inline mr-1" /> Mastered
              </Badge>
            )}
            {cardStatus === 'learning' && (
              <Badge variant="neutral">
                <HelpCircle className="w-3 h-3 inline mr-1" /> Needs Review
              </Badge>
            )}
          </div>
        </div>

        {/* Card Body (Question or Answer) */}
        <div className="my-auto py-5 text-center">
          <div className="text-[11px] uppercase tracking-wider font-semibold mb-2 text-[#737373]">
            {isFlipped ? 'Answer' : 'Question'}
          </div>
          <p className="text-base md:text-lg font-medium text-[#F5F5F5] leading-relaxed max-w-2xl mx-auto">
            {isFlipped ? currentCard?.answer : currentCard?.question}
          </p>
        </div>

        {/* Card Bottom Hint */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#525252] group-hover:text-[#A3A3A3] transition-colors">
          <RotateCw className="w-3.5 h-3.5" />
          <span>Click or press Space to {isFlipped ? 'view question' : 'reveal answer'}</span>
        </div>
      </div>

      {/* Navigation & Tagging Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Previous / Next buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
            aria-label="Previous flashcard"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            rightIcon={<ChevronRight className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
            aria-label="Next flashcard"
          >
            Next
          </Button>
        </div>

        {/* Mastery Tagging Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant={cardStatus === 'learning' ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleMarkReview}
            leftIcon={<HelpCircle className="w-3.5 h-3.5 text-[#737373]" />}
            className={`flex-1 sm:flex-initial text-xs ${cardStatus === 'learning' ? 'bg-[#252525] border-[#444444] text-white' : ''}`}
          >
            Needs Review (2)
          </Button>
          <Button
            variant={cardStatus === 'known' ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleMarkKnown}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            className={`flex-1 sm:flex-initial text-xs ${cardStatus === 'known' ? 'bg-[#252525] border-[#444444] text-white' : ''}`}
          >
            Mastered (1)
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Legend */}
      <div className="hidden md:flex items-center justify-center gap-4 text-[11px] text-[#525252] pt-2 border-t border-[#1F1F1F]">
        <span className="flex items-center gap-1">
          <Keyboard className="w-3 h-3" /> Shortcuts:
        </span>
        <span><kbd className="px-1.5 py-0.5 bg-[#141414] rounded border border-[#252525]">Space</kbd> Flip</span>
        <span><kbd className="px-1.5 py-0.5 bg-[#141414] rounded border border-[#252525]">←</kbd> <kbd className="px-1.5 py-0.5 bg-[#141414] rounded border border-[#252525]">→</kbd> Navigate</span>
        <span><kbd className="px-1.5 py-0.5 bg-[#141414] rounded border border-[#252525]">1</kbd> Mastered</span>
        <span><kbd className="px-1.5 py-0.5 bg-[#141414] rounded border border-[#252525]">2</kbd> Review</span>
      </div>
    </Card>
  );
};
