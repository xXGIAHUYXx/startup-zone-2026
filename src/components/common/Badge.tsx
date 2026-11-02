import React from 'react';

type BadgeVariant = 'terracotta' | 'forest' | 'sand' | 'charcoal' | 'gold' | 'outline' | 'demo';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'terracotta',
  className = '',
  size = 'md',
  icon
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-all tracking-wide';
  
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs font-semibold px-3 py-1'
  };

  const variantStyles: Record<BadgeVariant, string> = {
    terracotta: 'bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20',
    forest: 'bg-[#1d1d1f]/10 text-[#1d1d1f] border border-[#1d1d1f]/20',
    sand: 'bg-[#e8e8ed] text-[#003a75] border border-[#d2d2d7]',
    charcoal: 'bg-[#1d1d1f] text-[#fbfbfd] border border-[#1d1d1f]',
    gold: 'bg-amber-100 text-amber-900 border border-amber-300',
    outline: 'bg-transparent text-[#1d1d1f] border border-[#d2d2d7]',
    demo: 'bg-[#0071e3] text-white font-mono text-[10px] tracking-widest uppercase shadow-sm'
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
