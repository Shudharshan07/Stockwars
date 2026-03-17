import React from 'react';
import type { InputFieldProps } from '../types';

/**
 * InputField Component
 * A reusable controlled input component with focus state styling
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */
export const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-zinc-900 text-white rounded-md outline-none transition-all duration-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
    />
  );
};
