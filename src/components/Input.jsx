import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  helperText,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900'
              : 'border-slate-200 hover:border-slate-300'
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
    </div>
  );
};

export const Select = ({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Chọn một mục...',
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 ${
          error ? 'border-rose-400' : 'border-slate-200 hover:border-slate-300'
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
};

export const Textarea = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 ${
          error ? 'border-rose-400' : 'border-slate-200 hover:border-slate-300'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
};
