import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'teal' | 'clay' | 'neutral' | 'mango' | 'purple' | 'indigo' | 'orange' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant | string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px] font-semibold gap-1 rounded-md' 
    : 'px-2.5 py-1 text-xs font-semibold gap-1.5 rounded-lg';

  const variantClasses: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    warning: 'bg-[#FEF9EB] text-[#B47805] border border-[#F2C14E]/50',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    teal: 'bg-[#E8F1F2] text-[#123F46] border border-[#123F46]/20',
    clay: 'bg-[#FDF3F0] text-[#D85C3A] border border-[#D85C3A]/25',
    neutral: 'bg-[#FAF8F5] text-slate-700 border border-[#ECE5D7]',
    mango: 'bg-[#FEF9EB] text-[#B47805] border border-[#F2C14E]/50',
    purple: 'bg-purple-50 text-purple-800 border border-purple-200/80',
    indigo: 'bg-indigo-50 text-indigo-800 border border-indigo-200/80',
    orange: 'bg-orange-50 text-orange-800 border border-orange-200/80',
    blue: 'bg-blue-50 text-blue-800 border border-blue-200/80',
  };

  const selectedVariantClass = variantClasses[variant] || variantClasses.neutral;

  return (
    <span className={`inline-flex items-center select-none font-medium whitespace-nowrap ${sizeClasses} ${selectedVariantClass} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
