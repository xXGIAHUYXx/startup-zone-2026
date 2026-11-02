import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  bordered?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  bordered = true,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-[1.25rem] overflow-hidden
        ${bordered ? 'ring-1 ring-black/[0.06]' : ''}
        ${hoverable
          ? 'cursor-pointer transition-[transform,box-shadow] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.985] active:duration-100'
          : 'shadow-sm'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
