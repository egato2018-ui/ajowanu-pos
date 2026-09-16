import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#ECE5D7] flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] text-slate-400 flex items-center justify-center border border-[#ECE5D7] mb-1">
        {icon || <PackageOpen className="w-7 h-7 text-[#123F46]" />}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
