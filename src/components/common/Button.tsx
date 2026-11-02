import React from 'react';

type ButtonVariant = 'terracotta' | 'forest' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'terracotta',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  // Phản hồi ngay khi nhấn (active:scale), nhả mượt theo đường cong spring
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full cursor-pointer select-none tracking-[-0.01em] ' +
    'transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ' +
    'active:scale-[0.97] active:duration-100 disabled:opacity-40 disabled:cursor-not-allowed';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-[13px] px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-[17px] px-7 py-3.5 gap-2.5'
  };

  const variantStyles: Record<ButtonVariant, string> = {
    terracotta: 'bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#0062c4]',
    forest: 'bg-[#1d1d1f] text-white hover:bg-[#333336] active:bg-black',
    secondary: 'bg-[#e8e8ed] text-[#1d1d1f] hover:bg-[#dcdce1]',
    outline: 'bg-transparent text-[#0071e3] border border-[#0071e3] hover:bg-[#0071e3] hover:text-white',
    ghost: 'bg-transparent text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/5'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
