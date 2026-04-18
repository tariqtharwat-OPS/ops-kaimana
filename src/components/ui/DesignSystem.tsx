import React from 'react';

// Button Component
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger',
  size?: 'sm' | 'md' | 'lg'
}> = ({ 
  children, variant = 'primary', size = 'md', className = '', ...props 
}) => {
  const base = "rounded-xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-ocean-800 text-white hover:bg-ocean-900 shadow-sm",
    secondary: "bg-ocean-50 text-ocean-800 border border-ocean-100 hover:bg-ocean-100",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Card Component
export const Card: React.FC<{ children: React.ReactNode, className?: string, noPadding?: boolean }> = ({ 
  children, className = '', noPadding = false 
}) => (
  <div className={`bg-white rounded-2xl border border-slate-100 ${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);

// Badge Component
export const Badge: React.FC<{ children: React.ReactNode, variant?: 'posted' | 'draft' | 'pending', className?: string }> = ({ 
  children, variant = 'draft', className = '' 
}) => {
  const styles = {
    posted: "bg-emerald-50 text-emerald-600 border-emerald-100",
    draft: "bg-slate-50 text-slate-500 border-slate-200",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Section Header
export const Header: React.FC<{ title: string, subtitle?: string, action?: React.ReactNode }> = ({ 
  title, subtitle, action 
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
      {subtitle && <p className="text-slate-500 font-medium text-sm mt-1">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-3">{action}</div>}
  </div>
);
