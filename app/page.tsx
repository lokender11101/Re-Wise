'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContextualRightSidebar } from '@/components/layout/ContextualRightSidebar';
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
import { LogoLoader } from '@/components/brand/LogoLoader';
import { useStudySession } from '@/hooks/useStudySession';
import { useGeneration } from '@/hooks/useGeneration';
import { MOCK_SAVED_SESSION, SAMPLE_STUDY_MATERIAL } from '@/lib/mockData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants } from '@/lib/motion';
import { Target, X } from 'lucide-react';
import type { DifficultyLevel, ContentBlockType, GenerateRequestPayload, QuizBlock } from '@/types/study';

export default function ReWiseDashboard() {
  const [sessionTrigger, setSessionTrigger] = useState(0);
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview-block');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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
    setShowMobileSidebar(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
          <div className="max-w-4xl mx-auto p-4 rounded-xl bg-[#161208] border border-[#3D2E14] text-[#EAB308] text-xs flex items-center justify-between gap-3 animate-fade-in">
            <span>{storageWarning}</span>
          </div>
        )}

        {/* Input Panel (always shown if no session or if user clicks "New Session") */}
        {(!session || showInputPanel) && !isGenerating && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
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
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <StreamingProgressIndicator progress={streamProgress} onCancel={abort} />
            <GenerationLoadingSkeleton />
          </div>
        )}

        {/* Active Session Content Wrapped in ErrorBoundary and Smooth Motion Transitions */}
        {session && !isGenerating && (
          <ErrorBoundary onReset={() => setSessionTrigger((prev) => prev + 1)}>
            <div className="flex flex-col xl:flex-row items-start gap-8">
              {/* Main Workspace Column */}
              <div className="flex-1 min-w-0 w-full space-y-6">
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
              </div>

              {/* Right Contextual Sidebar ("Session Intelligence") */}
              <aside className="hidden xl:block w-72 2xl:w-80 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
                <ContextualRightSidebar
                  session={session}
                  activeSection={activeSection}
                  onNavigate={handleNavigate}
                  onStartRetest={startRetest}
                  onResetQuiz={resetQuiz}
                  isRetesting={isRetesting}
                />
              </aside>
            </div>

            {/* Mobile/Tablet Floating Trigger Button */}
            <div className="xl:hidden fixed bottom-5 right-5 z-30">
              <button
                type="button"
                onClick={() => setShowMobileSidebar(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#151515] hover:bg-[#1E1E1E] border border-[#2E2E2E] shadow-2xl text-xs text-[#F5F5F5] font-medium transition-all"
                aria-label="Open Session Intelligence"
              >
                <Target className="w-3.5 h-3.5 text-[#A7D8B5]" />
                <span>Session Intelligence</span>
              </button>
            </div>

            {/* Mobile/Tablet Drawer Sheet */}
            {showMobileSidebar && (
              <div className="fixed inset-0 z-50 xl:hidden flex justify-end animate-fade-in">
                <div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                  onClick={() => setShowMobileSidebar(false)}
                />
                <div className="relative w-full max-w-sm h-full bg-[#0C0C0C] border-l border-[#222222] p-5 overflow-y-auto z-10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1F1F1F]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                      Session Intelligence
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMobileSidebar(false)}
                      className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#1A1A1A] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ContextualRightSidebar
                    session={session}
                    activeSection={activeSection}
                    onNavigate={handleNavigate}
                    onStartRetest={startRetest}
                    onResetQuiz={resetQuiz}
                    isRetesting={isRetesting}
                  />
                </div>
              </div>
            )}
          </ErrorBoundary>
        )}
      </div>
    </MainLayout>
  );
}
