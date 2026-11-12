import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const GoodChild: React.FC = () => <div>Safe Content</div>;

const BrokenChild: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Component crashed during block rendering');
  }
  return <div>Recovered Content</div>;
};

describe('ErrorBoundary Component Suite', () => {
  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe Content')).toBeDefined();
  });

  it('catches render errors and displays defensive fallback UI without leaking stack traces', () => {
    // Suppress console.error in test output for expected throw
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallbackTitle="Custom Workspace Failure">
        <BrokenChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Workspace Failure')).toBeDefined();
    expect(screen.getByText('Component crashed during block rendering')).toBeDefined();
    expect(screen.getByText('Reset Workspace & Retry')).toBeDefined();

    consoleSpy.mockRestore();
  });

  it('invokes onReset handler when user clicks reset button', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onResetMock = vi.fn();

    render(
      <ErrorBoundary onReset={onResetMock}>
        <BrokenChild />
      </ErrorBoundary>
    );

    const resetButton = screen.getByRole('button', { name: /reset workspace/i });
    fireEvent.click(resetButton);

    expect(onResetMock).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
});
