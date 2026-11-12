'use client';

import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';

export interface ErrorAlertProps {
  title?: string;
  message: string;
  code?: string;
  retryable?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  details?: unknown;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'AI Generation Error',
  message,
  code,
  retryable = true,
  onRetry,
  onDismiss,
  details,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      role="alert"
      className="rounded-2xl border border-[#331F1F] bg-[#141010] p-5 md:p-6 text-[#F5F5F5] shadow-lg animate-fade-in"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-[#1C1414] border border-[#442222] rounded-xl text-[#FCA5A5] shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-[#F5F5F5] text-sm md:text-base">{title}</h4>
            {code && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#1C1414] text-[#FCA5A5] font-mono border border-[#331F1F]">
                {code}
              </span>
            )}
          </div>

          <p className="text-xs md:text-sm text-[#A3A3A3] leading-relaxed">{message}</p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {retryable && onRetry && (
              <Button
                size="sm"
                variant="danger"
                onClick={onRetry}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry Generation
              </Button>
            )}

            {onDismiss && (
              <Button size="sm" variant="outline" onClick={onDismiss}>
                Dismiss
              </Button>
            )}

            {Boolean(details) && (
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="text-xs text-[#A3A3A3] hover:text-[#F5F5F5] flex items-center gap-1 underline underline-offset-4 ml-auto"
              >
                {showDetails ? (
                  <>
                    Hide Technical Details <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    View Diagnostics <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Collapsible diagnostic details */}
          {showDetails && Boolean(details) && (
            <pre className="mt-3 p-3 text-xs bg-[#0B0909] rounded-lg border border-[#252525] font-mono text-[#D4D4D4] overflow-x-auto max-h-48 whitespace-pre-wrap">
              {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close error alert"
            className="text-[#737373] hover:text-[#F5F5F5] p-1 -mr-1 -mt-1 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
