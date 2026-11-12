'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Sanitize message: never expose internal stack traces or secrets
    const safeMessage = error?.message && error.message.length < 200
      ? error.message
      : 'An unexpected component rendering error occurred.';

    return {
      hasError: true,
      errorMessage: safeMessage,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log sanitized error details for diagnostics
    console.error('ErrorBoundary caught an error:', error.message, errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 md:p-8 rounded-2xl bg-[#101010] border border-[#2E1E1E] text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-10 h-10 rounded-xl bg-[#1F1010] border border-[#4A1E1E] flex items-center justify-center mx-auto text-[#EF4444]">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-[#F5F5F5]">
              {this.props.fallbackTitle || 'Workspace Rendering Interrupted'}
            </h3>
            <p className="text-xs text-[#A3A3A3] max-w-md mx-auto leading-relaxed">
              A rendering issue occurred while displaying this study session. Your learning
              progress and stored sessions remain securely preserved.
            </p>
            {this.state.errorMessage && (
              <p className="text-[11px] font-mono text-[#737373] bg-[#0A0A0A] p-2 rounded-lg border border-[#1F1F1F] inline-block">
                {this.state.errorMessage}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-[#333333] hover:border-white text-xs bg-[#141414] hover:bg-[#1D1D1D]"
            >
              Reset Workspace & Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
