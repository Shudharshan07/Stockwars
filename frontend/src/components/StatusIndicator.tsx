/**
 * StatusIndicator component with pulsing animation
 * Validates: Requirements 2.3, 2.4, 7.1, 7.2, 7.5
 */

import { motion } from 'framer-motion';

export function StatusIndicator() {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="w-2 h-2 rounded-full bg-emerald-500"
        animate={{
          opacity: [1, 0.4, 1],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <span className="text-sm text-zinc-400 font-medium">
        Status: Systems Nominal
      </span>
    </div>
  );
}
