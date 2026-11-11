import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReWise — AI-Powered Active Learning Platform',
  description: 'Study smarter. Remember longer. Transforms study notes into interactive flashcards, quizzes, summaries, and revision checklists.',
  keywords: ['Active Learning', 'Flashcards', 'Quiz', 'AI Study Assistant', 'ReWise', 'DeepSeek'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background min-h-screen text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
