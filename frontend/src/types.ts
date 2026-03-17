/**
 * Component prop interfaces for GreenTerminal Authentication Interface
 * Validates: Requirements 8.1, 8.3, 8.4, 8.5
 */

/**
 * Props for the InputField component
 * Used for capturing user credentials (email, password, name)
 */
export interface InputFieldProps {
  type: 'text' | 'email' | 'password';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Props for the Button component
 * Supports different visual variants for various use cases
 */
export interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant: 'primary' | 'secondary';
}

/**
 * Authentication mode type
 * Determines whether the interface shows login or registration form
 */
export type AuthMode = 'login' | 'register';

/**
 * Props for the AuthCard component
 * Main authentication container that switches between modes
 */
export interface AuthCardProps {
  mode: AuthMode;
  onModeToggle: () => void;
}
