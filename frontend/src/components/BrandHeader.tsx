/**
 * BrandHeader component for authentication interface
 * Validates: Requirements 2.1, 2.2, 2.5
 */

import { StatusIndicator } from './StatusIndicator';

export function BrandHeader() {
  return (
    <div className="flex items-center justify-between w-full">
      <h1 className="text-xl font-semibold text-emerald-500">
        GreenTerminal
      </h1>
      <StatusIndicator />
    </div>
  );
}
