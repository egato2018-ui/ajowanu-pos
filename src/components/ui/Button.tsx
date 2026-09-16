import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:translate-y-[0.5px]';

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-[11px] gap-1.5 h-7',
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 h-8',
    md: 'px-4 py-2 text-xs gap-2 h-9 sm:h-10',
    lg: 'px-5 py-2.5 text-sm gap-2.5 h-11',
    icon: 'p-2 w-9 h-9 sm:w-10 sm:h-10 shrink-0',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-[#D85C3A] hover:bg-[#C24B2B] text-white shadow-xs hover:shadow-sm focus-visible:ring-[#D85C3A]',
    secondary: 'bg-[#123F46] hover:bg-[#0E3238] text-white shadow-xs hover:shadow-sm focus-visible:ring-[#123F46]',
    outline: 'bg-white hover:bg-[#FAF8F5] text-[#111827] border border-[#ECE5D7] hover:border-[#D85C3A]/40 focus-visible:ring-[#123F46]',
    ghost: 'bg-transparent hover:bg-[#FAF8F5] text-slate-700 hover:text-[#111827] focus-visible:ring-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-500',
    gold: 'bg-[#F2C14E] hover:bg-[#E5B13A] text-[#111827] shadow-xs focus-visible:ring-[#F2C14E]',
  };

  return (
    <button
      className={`${baseClasses} ${fullWidth ? 'w-full' : ''} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
