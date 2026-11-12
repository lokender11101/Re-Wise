'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  Keyboard,
  Shuffle,
  Sparkles,
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsCoarsePointer(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  // Synchronize local cards state when block.cards prop updates, preserving current index position
  useEffect(() => {
    setCards(block.cards);
    setCurrentIndex((prev) => {
      if (block.cards.length === 0) return 0;
      return prev < block.cards.length ? prev : block.cards.length - 1;
    });
    setIsFlipped(false);
  }, [block.cards]);

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

  // 3D Perspective Tilt on pointer move (disabled on touch devices or reduced motion)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCoarsePointer || shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * 8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Scoped keyboard navigation — only active when user interacts with this flashcard block
  useKeyboardNav({
    onNext: handleNext,
    onPrev: handlePrev,
    onFlip: handleFlip,
    onMarkKnown: handleMarkKnown,
    onMarkReview: handleMarkReview,
    enabled: true,
    containerRef: blockRef,
  });

  const cardStatus = currentCard ? progressMap[currentCard.id] : undefined;

  // Calculate mastery statistics
  const knownCount = cards.filter((c) => progressMap[c.id] === 'known').length;
  const learningCount = cards.filter((c) => progressMap[c.id] === 'learning').length;

  return (
    <Card
      id="flashcards-block"
      ref={blockRef}
      tabIndex={0}
      className="space-y-6 animate-fade-in border-[#281F2B] bg-[#17131A] p-6 md:p-8 outline-none focus-within:border-[#3E2B45] scroll-mt-20"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#281F2B] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#241C29] border border-[#382840] text-[#C8ADD9]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#9E88AC] uppercase">
              Active Recall Engine
            </span>
            <h3 className="text-base md:text-lg font-semibold text-[#F5EEF8]">
              Interactive 3D Flashcards
            </h3>
          </div>
        </div>

        {/* Action controls & Counter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="p-2 text-[#9E88AC] hover:text-[#F5EEF8] hover:bg-[#201824] rounded-lg transition-colors border border-[#34243B] hover:border-[#4E355A]"
            title="Shuffle flashcards"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <div className="px-3 py-1 bg-[#201824] rounded-lg text-xs font-mono font-medium text-[#C8ADD9] border border-[#34243B]">
            {currentIndex + 1} / {totalCards}
          </div>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[#9E88AC]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8ADD9]" />
            Mastered: <span className="text-[#F5EEF8] font-mono font-medium">{knownCount}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5D4666]" />
            Needs Review: <span className="text-[#C8ADD9] font-mono font-medium">{learningCount}</span>
          </span>
          <span>
            Remaining: <span className="text-[#7C668A] font-mono">{totalCards - (knownCount + learningCount)}</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#0F0C12] rounded-full overflow-hidden flex">
          <div
            className="bg-[#C8ADD9] transition-all duration-300"
            style={{ width: `${(knownCount / totalCards) * 100}%` }}
          />
          <div
            className="bg-[#5D4666] transition-all duration-300"
            style={{ width: `${(learningCount / totalCards) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card Scene */}
      <div
        ref={cardContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full min-h-[260px] md:min-h-[300px] perspective-1200 cursor-pointer select-none"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard ${currentIndex + 1}: ${isFlipped ? 'Answer' : 'Question'}. Click to flip.`}
      >
        <motion.div
          animate={{
            rotateY: shouldReduceMotion ? 0 : isFlipped ? 180 : 0,
            rotateX: shouldReduceMotion ? 0 : tilt.x,
            rotateZ: shouldReduceMotion ? 0 : tilt.y * 0.15,
            opacity: shouldReduceMotion ? 1 : 1,
          }}
          transition={{
            duration: shouldReduceMotion ? 0.05 : 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative w-full h-full min-h-[260px] md:min-h-[300px] transform-style-3d transition-shadow"
          style={{
            boxShadow: isFlipped
              ? '0 16px 32px -8px rgba(0, 0, 0, 0.9), 0 0 0 1px #3E2B45'
              : '0 12px 24px -6px rgba(0, 0, 0, 0.8), 0 0 0 1px #281F2B',
          }}
        >
          {/* Front Face: Question */}
          <div
            className={`absolute inset-0 backface-hidden rounded-2xl p-6 md:p-8 flex flex-col justify-between bg-[#0F0C12] border border-[#281F2B] hover:border-[#3E2B45] transition-colors ${
              shouldReduceMotion && isFlipped ? 'hidden' : 'flex'
            }`}
          >
            {/* Front Top Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#7C668A] text-xs">Card #{currentIndex + 1}</span>
                {currentCard?.difficulty && (
                  <Badge variant="neutral" size="sm">
                    {currentCard.difficulty}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {cardStatus === 'known' && (
                  <Badge variant="primary">
                    <CheckCircle2 className="w-3 h-3 inline mr-1 text-white" /> Mastered
                  </Badge>
                )}
                {cardStatus === 'learning' && (
                  <Badge variant="neutral">
                    <HelpCircle className="w-3 h-3 inline mr-1 text-[#C8ADD9]" /> Needs Review
                  </Badge>
                )}
              </div>
            </div>

            {/* Front Question Body */}
            <div className="my-auto py-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201824] border border-[#34243B] text-[10px] uppercase tracking-widest font-semibold mb-3 text-[#C8ADD9]">
                Question
              </div>
              <p className="text-base md:text-xl font-medium text-[#F5EEF8] leading-relaxed max-w-2xl mx-auto">
                {currentCard?.question}
              </p>
            </div>

            {/* Front Bottom Hint */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#7C668A] hover:text-[#C8ADD9] transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click or press Space to reveal answer</span>
            </div>
          </div>

          {/* Back Face: Answer */}
          <div
            style={{ transform: shouldReduceMotion ? 'none' : 'rotateY(180deg)' }}
            className={`absolute inset-0 backface-hidden rounded-2xl p-6 md:p-8 flex flex-col justify-between bg-[#130E17] border border-[#382840] hover:border-[#4E355A] transition-colors ${
              shouldReduceMotion && !isFlipped ? 'hidden' : 'flex'
            }`}
          >
            {/* Back Top Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#9E88AC] text-xs">Card #{currentIndex + 1}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#281C30] text-[#E8D4F5] border border-[#442B52]">
                  <Sparkles className="w-3 h-3 text-[#C8ADD9]" /> Solution
                </span>
              </div>

              <div className="flex items-center gap-2">
                {cardStatus === 'known' && (
                  <Badge variant="primary">
                    <CheckCircle2 className="w-3 h-3 inline mr-1 text-white" /> Mastered
                  </Badge>
                )}
                {cardStatus === 'learning' && (
                  <Badge variant="neutral">
                    <HelpCircle className="w-3 h-3 inline mr-1 text-[#C8ADD9]" /> Needs Review
                  </Badge>
                )}
              </div>
            </div>

            {/* Back Answer Body */}
            <div className="my-auto py-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24172B] border border-[#442B52] text-[10px] uppercase tracking-widest font-semibold mb-3 text-[#E8D4F5]">
                Answer & Key Takeaway
              </div>
              <p className="text-base md:text-xl font-normal text-[#FFFFFF] leading-relaxed max-w-2xl mx-auto">
                {currentCard?.answer}
              </p>
            </div>

            {/* Back Bottom Hint */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#9E88AC] hover:text-[#C8ADD9] transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click or press Space to flip back to question</span>
            </div>
          </div>
        </motion.div>
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
            className={`flex-1 sm:flex-initial text-xs ${
              cardStatus === 'learning' ? 'bg-[#222222] border-[#444444] text-white font-semibold' : ''
            }`}
          >
            Needs Review (2)
          </Button>
          <Button
            variant={cardStatus === 'known' ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleMarkKnown}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            className={`flex-1 sm:flex-initial text-xs ${
              cardStatus === 'known' ? 'bg-[#222222] border-[#444444] text-white font-semibold' : ''
            }`}
          >
            Mastered (1)
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Legend */}
      <div className="hidden md:flex items-center justify-center gap-4 text-[11px] text-[#7C668A] pt-3 border-t border-[#281F2B]">
        <span className="flex items-center gap-1 font-medium text-[#9E88AC]">
          <Keyboard className="w-3 h-3 text-[#C8ADD9]" /> Shortcuts:
        </span>
        <span><kbd className="px-1.5 py-0.5 bg-[#201824] rounded border border-[#34243B] text-[#C8ADD9]">Space</kbd> Flip</span>
        <span><kbd className="px-1.5 py-0.5 bg-[#201824] rounded border border-[#34243B] text-[#C8ADD9]">←</kbd> <kbd className="px-1.5 py-0.5 bg-[#201824] rounded border border-[#34243B] text-[#C8ADD9]">→</kbd> Navigate</span>
        <span><kbd className="px-1.5 py-0.5 bg-[#201824] rounded border border-[#34243B] text-[#C8ADD9]">1</kbd> Mastered</span>
        <span><kbd className="px-1.5 py-0.5 bg-[#201824] rounded border border-[#34243B] text-[#C8ADD9]">2</kbd> Review</span>
      </div>
    </Card>
  );
};
