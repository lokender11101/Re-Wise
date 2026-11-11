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
    <Card className="space-y-5 animate-fadeIn border-cyan-900/30">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-cyan-400 uppercase">
              Active Recall
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-100">
              Interactive Flashcards
            </h3>
          </div>
        </div>

        {/* Action controls & Counter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
            title="Shuffle flashcards"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 bg-slate-800/80 rounded-lg text-xs font-mono font-medium text-slate-300 border border-slate-700/80">
            {currentIndex + 1} / {totalCards}
          </div>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Mastered: {knownCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Review: {learningCount}
          </span>
          <span>Remaining: {totalCards - (knownCount + learningCount)}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${(knownCount / totalCards) * 100}%` }}
          />
          <div
            className="bg-amber-500 transition-all duration-300"
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
        className="relative w-full min-h-[240px] md:min-h-[280px] cursor-pointer select-none rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 hover:border-cyan-500/50 shadow-xl group"
      >
        {/* Card Top Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500">#{currentIndex + 1}</span>
            {currentCard?.difficulty && (
              <Badge
                variant={
                  currentCard.difficulty === 'easy'
                    ? 'success'
                    : currentCard.difficulty === 'medium'
                    ? 'warning'
                    : 'danger'
                }
                size="sm"
              >
                {currentCard.difficulty}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {cardStatus === 'known' && (
              <Badge variant="success">
                <CheckCircle2 className="w-3 h-3 inline mr-1" /> Mastered
              </Badge>
            )}
            {cardStatus === 'learning' && (
              <Badge variant="warning">
                <HelpCircle className="w-3 h-3 inline mr-1" /> Needs Review
              </Badge>
            )}
          </div>
        </div>

        {/* Card Body (Question or Answer) */}
        <div className="my-auto py-6 text-center">
          <div className="text-xs uppercase tracking-wider font-semibold mb-2 text-cyan-400">
            {isFlipped ? 'Answer' : 'Question'}
          </div>
          <p className="text-base md:text-xl font-medium text-slate-100 leading-relaxed max-w-2xl mx-auto">
            {isFlipped ? currentCard?.answer : currentCard?.question}
          </p>
        </div>

        {/* Card Bottom Hint */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 group-hover:text-cyan-400/80 transition-colors">
          <RotateCw className="w-3.5 h-3.5" />
          <span>Click or press Space to {isFlipped ? 'view question' : 'reveal answer'}</span>
        </div>
      </div>

      {/* Navigation & Tagging Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
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
            variant={cardStatus === 'learning' ? 'danger' : 'outline'}
            size="sm"
            onClick={handleMarkReview}
            leftIcon={<HelpCircle className="w-3.5 h-3.5 text-amber-400" />}
            className="flex-1 sm:flex-initial text-xs"
          >
            Needs Review (2)
          </Button>
          <Button
            variant={cardStatus === 'known' ? 'success' : 'outline'}
            size="sm"
            onClick={handleMarkKnown}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            className="flex-1 sm:flex-initial text-xs"
          >
            Mastered (1)
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Legend */}
      <div className="hidden md:flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-card-border/40">
        <span className="flex items-center gap-1">
          <Keyboard className="w-3 h-3" /> Shortcuts:
        </span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">Space</kbd> Flip</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">→</kbd> Navigate</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">1</kbd> Mastered</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">2</kbd> Review</span>
      </div>
    </Card>
  );
};
