'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { NotesInput } from '@/components/input/NotesInput';
import { RefineBar } from '@/components/input/RefineBar';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { RetestSection } from '@/components/study/RetestSection';
import { MasteryStatsPanel } from '@/components/study/MasteryStatsPanel';
import { LearningIntelligence } from '@/components/study/LearningIntelligence';
import { SessionOverview } from '@/components/study/SessionOverview';
import { GenerationLoadingSkeleton } from '@/components/ui/Skeleton';
import { StreamingProgressIndicator } from '@/components/ui/StreamingProgressIndicator';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LogoLoader } from '@/components/brand/LogoLoader';
import { useStudySession } from '@/hooks/useStudySession';
import { useGeneration } from '@/hooks/useGeneration';
import { MOCK_SAVED_SESSION, SAMPLE_STUDY_MATERIAL } from '@/lib/mockData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants } from '@/lib/motion';
import type { DifficultyLevel, ContentBlockType, GenerateRequestPayload, QuizBlock } from '@/types/study';

export default function ReWiseDashboard() {
  const [sessionTrigger, setSessionTrigger] = useState(0);
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview-block');
  const latestPayloadRef = useRef<GenerateRequestPayload | null>(null);

  const {
    session,
    setSession,
    initNewSession,
    updateBlocks,
    markFlashcard,
    recordQuizAnswer,
    submitQuiz,
    resetQuiz,
    isRetesting,
    retestAnswers,
    retestSubmitted,
    retestScoreResult,
    startRetest,
    cancelRetest,
    recordRetestAnswer,
    submitRetest,
    toggleChecklistItem,
    loadSession,
    clearSession,
    undoRefinement,
    canUndoRefinement,
    undoSnapshotCount,
    storageWarning,
  } = useStudySession();

  const {
    isGenerating,
    isRefining,
    streamProgress,
    error,
    clearError,
    generate,
    refine,
    abort,
  } = useGeneration();

  // Handle generation submission
  const handleGenerate = async (payload: {
    notes: string;
    difficulty: DifficultyLevel;
    selectedTypes: ContentBlockType[];
  }) => {
    latestPayloadRef.current = payload;
    const result = await generate(payload);
    if (result) {
      initNewSession(result, payload);
      setShowInputPanel(false);
      setSessionTrigger((prev) => prev + 1);
    }
  };

  // Retry the last failed request
  const handleRetry = () => {
    if (latestPayloadRef.current) {
      handleGenerate(latestPayloadRef.current);
    }
  };

  // Handle refinement request
  const handleRefine = async (instruction: string) => {
    if (!session) return;
    const result = await refine({
      session: {
        title: session.title,
        topicOrNotes: session.topicOrNotes,
        difficulty: session.difficulty,
        blocks: session.blocks,
      },
      instruction,
    });

    if (result) {
      updateBlocks(result.blocks, result.title, instruction);
      setSessionTrigger((prev) => prev + 1);
    }
  };

  // 1-Click Load Pre-generated Demo Session
  const handleLoadDemoSession = () => {
    setSession(MOCK_SAVED_SESSION);
    setShowInputPanel(false);
    setSessionTrigger((prev) => prev + 1);
  };

  // Pre-fill sample topic into input
  const handleSelectSampleTopic = (topic: string) => {
    setShowInputPanel(true);
    handleGenerate({
      notes: `${topic}:\n${SAMPLE_STUDY_MATERIAL}`,
      difficulty: 'intermediate',
      selectedTypes: ['summary', 'flashcards', 'quiz', 'checklist', 'chart'],
    });
  };

  // Switch to new session
  const handleNewSession = () => {
    clearSession();
    clearError();
    setShowInputPanel(true);
  };

  // Get quiz questions filtered for retesting
  const quizBlock = session?.blocks.find((b): b is QuizBlock => b.type === 'quiz');
  const questionsToRetest = quizBlock
    ? quizBlock.questions.filter((q) =>
        session?.progress.quiz.incorrectQuestionIds?.includes(q.id)
      )
    : [];

  // Scroll spy with IntersectionObserver
  useEffect(() => {
    if (!session) return;
    const sectionIds = [
      'overview-block',
      'progress-block',
      'summary-block',
      'flashcards-block',
      'quiz-block',
      'checklist-block',
      'chart-block',
      'intelligence-block',
      'refine-block',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '-80px 0px -40% 0px',
        threshold: 0.15,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [session, isRetesting]);

  // Navigate smoothly to target section
  const handleNavigate = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <MainLayout
      activeSessionId={session?.id}
      session={session}
      activeSection={activeSection}
      onNavigate={handleNavigate}
      sessionTrigger={sessionTrigger}
      onSelectSession={(id) => {
        loadSession(id);
        setShowInputPanel(false);
      }}
      onNewSession={handleNewSession}
      isRetesting={isRetesting}
    >
      <div className="space-y-8 pb-16">
        {/* Error Alert with Retry button */}
        {error && (
          <div className="max-w-4xl mx-auto">
            <ErrorAlert
              title={error.code === 'API_KEY_MISSING' ? 'DeepSeek API Key Required' : 'Generation Failed'}
              message={error.message}
              code={error.code}
              retryable={error.retryable}
              onRetry={handleRetry}
              onDismiss={clearError}
            />
          </div>
        )}

        {/* Local Storage Protection Warning */}
        {storageWarning && (
          <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-[#161208] border border-[#3D2E14] text-[#EAB308] text-xs flex items-center justify-between gap-3 animate-fade-in">
            <span>{storageWarning}</span>
          </div>
        )}

        {/* Streaming Progress Indicator & Loading Skeleton */}
        {isGenerating && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-8">
            <StreamingProgressIndicator progress={streamProgress} onCancel={abort} />
            <GenerationLoadingSkeleton />
          </div>
        )}

        {/* LANDING MODE: Hero Section + Commercial Creation Studio + Feature Showcase */}
        {(!session || showInputPanel) && !isGenerating && (
          <div className="space-y-12 sm:space-y-16 animate-fade-in">
            {/* Zomato / Apple Inspired Editorial Hero */}
            <HeroSection
              onLoadDemo={handleLoadDemoSession}
              onScrollToInput={() => {
                const el = document.getElementById('study-input-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectSampleTopic={handleSelectSampleTopic}
            />

            {/* 4-Step Commercial Creation Studio */}
            <div className="max-w-5xl mx-auto">
              <NotesInput onGenerate={handleGenerate} isLoading={isGenerating} />
            </div>

            {/* Asymmetric Editorial Feature Showcase Grid */}
            <FeatureShowcase />
          </div>
        )}

        {/* ACTIVE STUDY MODE: Editorial Session Masthead, Mastery Panel & Interactive Blocks */}
        {session && !isGenerating && (
          <ErrorBoundary onReset={() => setSessionTrigger((prev) => prev + 1)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={session.id}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8 max-w-5xl mx-auto"
              >
                {/* 1. Session Overview Masthead */}
                <SessionOverview
                  session={session}
                  onNewSession={handleNewSession}
                  onDeleteSession={() => {
                    clearSession();
                    setSessionTrigger((prev) => prev + 1);
                  }}
                  onSessionRenamed={() => setSessionTrigger((prev) => prev + 1)}
                />

                {/* 2. Mastery & Retention Overview (Zomato style horizontal stats panel) */}
                <MasteryStatsPanel
                  session={session}
                  onScrollToInsights={() => handleNavigate('intelligence-block')}
                />

                {/* 3. Dedicated Wrong-Answer Retest View or All Study Blocks */}
                {isRetesting ? (
                  <RetestSection
                    questionsToRetest={questionsToRetest}
                    retestAnswers={retestAnswers}
                    submitted={retestSubmitted}
                    scoreResult={retestScoreResult}
                    previousQuizScore={
                      session.progress.quiz.score !== undefined && session.progress.quiz.total !== undefined
                        ? {
                            score: session.progress.quiz.score,
                            total: session.progress.quiz.total,
                          }
                        : undefined
                    }
                    onRecordRetestAnswer={recordRetestAnswer}
                    onSubmitRetest={submitRetest}
                    onExitRetest={cancelRetest}
                  />
                ) : (
                  <div className="space-y-8">
                    {session.blocks.map((block) => (
                      <BlockRenderer
                        key={block.id}
                        block={block}
                        flashcardProgress={session.progress.flashcards}
                        onMarkCard={markFlashcard}
                        quizAnswers={session.progress.quiz.answers}
                        quizSubmitted={session.progress.quiz.submitted}
                        onRecordQuizAnswer={recordQuizAnswer}
                        onSubmitQuiz={submitQuiz}
                        onResetQuiz={resetQuiz}
                        onStartRetest={startRetest}
                        checklistProgress={session.progress.checklist}
                        onToggleChecklistItem={toggleChecklistItem}
                      />
                    ))}
                  </div>
                )}

                {/* 4. Cognitive Learning Intelligence & Concept Diagnostics */}
                {!isRetesting && (
                  <LearningIntelligence
                    session={session}
                    onStartRetest={startRetest}
                    isRetesting={isRetesting}
                  />
                )}

                {/* 5. Adaptive Refinement Studio */}
                {!isRetesting && (
                  <div className="space-y-4">
                    {isRefining && (
                      <LogoLoader
                        message="Refining your study material..."
                        submessage="DeepSeek is adapting content to your instructions while preserving your learning progress"
                        size="sm"
                      />
                    )}
                    <RefineBar
                      onRefine={handleRefine}
                      isLoading={isRefining}
                      onUndo={undoRefinement}
                      canUndo={canUndoRefinement}
                      undoCount={undoSnapshotCount}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        )}
      </div>
    </MainLayout>
  );
}
