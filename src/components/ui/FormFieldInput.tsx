import React, { useState } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  as?: 'input' | 'select' | 'textarea';
  className?: string;
  helpText?: string;
}

export default function FormFieldInput({
  label,
  name,
  type = 'text',
  placeholder,
  value: controlledValue,
  onChange: controlledOnChange,
  error,
  required = false,
  disabled = false,
  options,
  as = 'input',
  className = '',
  helpText,
}: FormFieldProps) {
  // Support uncontrolled mode when value/onChange not provided
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const onChange = controlledOnChange || ((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setInternalValue(e.target.value));

  const baseClasses = `w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
    ${error 
      ? 'border-red-300 bg-red-50 focus:border-red-500' 
      : 'border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${className}`;

  const renderInput = () => {
    if (as === 'select' && options) {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={baseClasses}
          required={required}
        >
          <option value="">Seleccionar...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (as === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseClasses} min-h-[100px] resize-y`}
          required={required}
        />
      );
    }

    return (
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={baseClasses}
        required={required}
      />
    );
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
