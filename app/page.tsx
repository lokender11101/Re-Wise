'use client';

import React, { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { NotesInput } from '@/components/input/NotesInput';
import { RefineBar } from '@/components/input/RefineBar';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { RetestSection } from '@/components/study/RetestSection';
import { StudyProgress } from '@/components/study/StudyProgress';
import { SessionOverview } from '@/components/study/SessionOverview';
import { GenerationLoadingSkeleton } from '@/components/ui/Skeleton';
import { StreamingProgressIndicator } from '@/components/ui/StreamingProgressIndicator';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
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
    // Auto-generate or pre-fill
    handleGenerate({
      notes: `${topic}:\n${SAMPLE_STUDY_MATERIAL}`,
      difficulty: 'intermediate',
      selectedTypes: ['summary', 'flashcards', 'quiz', 'checklist'],
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

  return (
    <MainLayout
      activeSessionId={session?.id}
      sessionTrigger={sessionTrigger}
      onSelectSession={(id) => {
        loadSession(id);
        setShowInputPanel(false);
      }}
      onNewSession={handleNewSession}
    >
      <div className="space-y-6 pb-16">
        {/* Error Alert with Retry button */}
        {error && (
          <ErrorAlert
            title={error.code === 'API_KEY_MISSING' ? 'DeepSeek API Key Required' : 'Generation Failed'}
            message={error.message}
            code={error.code}
            retryable={error.retryable}
            onRetry={handleRetry}
            onDismiss={clearError}
          />
        )}

        {/* Local Storage Protection Warning */}
        {storageWarning && (
          <div className="p-4 rounded-xl bg-[#161208] border border-[#3D2E14] text-[#EAB308] text-xs flex items-center justify-between gap-3 animate-fade-in">
            <span>{storageWarning}</span>
          </div>
        )}

        {/* Input Panel (always shown if no session or if user clicks "New Session") */}
        {(!session || showInputPanel) && !isGenerating && (
          <div className="space-y-6 animate-fade-in">
            <NotesInput onGenerate={handleGenerate} isLoading={isGenerating} />
            {!session && (
              <EmptyState
                onSelectSampleTopic={handleSelectSampleTopic}
                onLoadDemoSession={handleLoadDemoSession}
              />
            )}
          </div>
        )}

        {/* Streaming Progress Indicator & Loading Skeleton */}
        {isGenerating && (
          <div className="space-y-6 animate-fade-in">
            <StreamingProgressIndicator progress={streamProgress} onCancel={abort} />
            <GenerationLoadingSkeleton />
          </div>
        )}

        {/* Active Session Content Wrapped in ErrorBoundary and Smooth Motion Transitions */}
        {session && !isGenerating && (
          <ErrorBoundary onReset={() => setSessionTrigger((prev) => prev + 1)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={session.id}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Session Header & Overview */}
                <SessionOverview
                  session={session}
                  onNewSession={handleNewSession}
                  onDeleteSession={() => {
                    clearSession();
                    setSessionTrigger((prev) => prev + 1);
                  }}
                  onSessionRenamed={() => setSessionTrigger((prev) => prev + 1)}
                />

                {/* Study Progress & Mastery Bar */}
                <StudyProgress session={session} />

                {/* Dedicated Wrong-Answer Retest View */}
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
                  /* All Study Blocks */
                  <div className="space-y-6">
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

                {/* Refinement Loop Bar */}
                {!isRetesting && (
                  <RefineBar
                    onRefine={handleRefine}
                    isLoading={isRefining}
                    onUndo={undoRefinement}
                    canUndo={canUndoRefinement}
                    undoCount={undoSnapshotCount}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        )}
      </div>
    </MainLayout>
  );
}
