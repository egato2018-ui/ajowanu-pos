import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'interactive' | 'accent';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantClasses: Record<string, string> = {
    default: 'bg-white border border-[#ECE5D7] shadow-xs',
    subtle: 'bg-[#FAF8F5] border border-[#ECE5D7]',
    interactive: 'bg-white border border-[#ECE5D7] shadow-xs hover:border-[#D85C3A]/50 hover:shadow-sm transition-all duration-150 cursor-pointer',
    accent: 'bg-white border-2 border-[#123F46]/20 shadow-xs ring-1 ring-[#123F46]/5',
  };

  return (
    <div
      className={`rounded-2xl p-5 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, badge, action, icon, className = '' }) => {
  return (
    <div className={`flex items-start justify-between gap-3 pb-3 border-b border-[#ECE5D7] ${className}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#123F46] flex items-center justify-center shrink-0 border border-[#ECE5D7]">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm truncate">{title}</h3>
            {badge}
          </div>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
