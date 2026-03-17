/**
 * Button component with Framer Motion animations
 * Validates: Requirements 4.1, 4.2, 4.4, 4.5, 4.6, 7.1, 7.3, 7.5
 */

import { motion } from 'framer-motion';
import type { ButtonProps } from '../types';

export function Button({ children, onClick, variant }: ButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={`
        w-full py-3 px-4 rounded-lg font-semibold
        transition-colors duration-300
        ${variant === 'primary' 
          ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700' 
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }
      `}
    >
      {children}
    </motion.button>
  );
}
