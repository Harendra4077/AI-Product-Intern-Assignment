import React from 'react';
import { cn } from '../../lib/utils';

// -------- Input --------

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-[#26352E]"
        >
          {label}
          {props.required && <span className="text-[#C76C64] ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-4 py-3 rounded-xl border text-sm text-[#26352E] bg-white',
          'placeholder:text-[#B0B8B0] transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#718B73]/30 focus:border-[#718B73]',
          error
            ? 'border-[#C76C64] focus:ring-[#C76C64]/20 focus:border-[#C76C64]'
            : 'border-[#E8E7DF] hover:border-[#B8C4B5]',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-[#788078]">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-[#C76C64] font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

// -------- Select --------

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-[#26352E]">
          {label}
          {props.required && <span className="text-[#C76C64] ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full px-4 py-3 rounded-xl border text-sm text-[#26352E] bg-white',
          'transition-all duration-200 appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-[#718B73]/30 focus:border-[#718B73]',
          error
            ? 'border-[#C76C64] focus:ring-[#C76C64]/20 focus:border-[#C76C64]'
            : 'border-[#E8E7DF] hover:border-[#B8C4B5]',
          className
        )}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-xs text-[#C76C64] font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

// -------- Textarea --------

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-[#26352E]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full px-4 py-3 rounded-xl border text-sm text-[#26352E] bg-white resize-none',
          'placeholder:text-[#B0B8B0] transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#718B73]/30 focus:border-[#718B73]',
          error
            ? 'border-[#C76C64] focus:ring-[#C76C64]/20 focus:border-[#C76C64]'
            : 'border-[#E8E7DF] hover:border-[#B8C4B5]',
          className
        )}
        rows={3}
        aria-invalid={!!error}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-[#788078]">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-[#C76C64] font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
