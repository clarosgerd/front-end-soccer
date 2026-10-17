import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function TextField({ label, error, id, className = '', disabled, ...rest }: TextFieldProps) {
  const fieldId = id ?? rest.name
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className={`text-sm font-medium ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>
        {label}
      </label>
      <input
        id={fieldId}
        disabled={disabled}
        className={`rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 ${
          error ? 'border-red-400' : 'border-slate-300'
        } ${disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400' : ''} ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
