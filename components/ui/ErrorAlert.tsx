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
      className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 md:p-6 text-slate-200 shadow-xl backdrop-blur-sm animate-fadeIn"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-rose-200 text-base">{title}</h4>
            {code && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-rose-900/40 text-rose-300 font-mono border border-rose-800/50">
                {code}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>

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
                className="text-xs text-rose-300/80 hover:text-rose-200 flex items-center gap-1 underline underline-offset-4 ml-auto"
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
            <pre className="mt-3 p-3 text-xs bg-slate-900/90 rounded-lg border border-slate-800 font-mono text-slate-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
              {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close error alert"
            className="text-slate-400 hover:text-slate-200 p-1 -mr-1 -mt-1 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
