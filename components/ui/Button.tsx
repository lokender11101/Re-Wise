'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2.5 gap-2 min-h-[40px]',
      lg: 'text-base px-5 py-3 gap-2.5 min-h-[46px]',
    };

    const variantStyles = {
      primary:
        'bg-white text-black hover:bg-[#E5E5E5] active:bg-[#D4D4D4] border border-transparent font-semibold shadow-none',
      secondary:
        'bg-[#181818] hover:bg-[#1D1D1D] text-[#F5F5F5] border border-[#252525] hover:border-[#383838]',
      outline:
        'bg-transparent hover:bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#252525] hover:border-[#444444]',
      ghost:
        'bg-transparent hover:bg-[#141414] text-[#737373] hover:text-[#F5F5F5] border border-transparent',
      danger:
        'bg-[#141010] hover:bg-[#1C1414] text-[#FCA5A5] border border-[#331F1F] hover:border-[#5C2424]',
      success:
        'bg-[#101411] hover:bg-[#141C16] text-[#86EFAC] border border-[#1F3325] hover:border-[#284E33]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon}
            <span>{children}</span>
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
