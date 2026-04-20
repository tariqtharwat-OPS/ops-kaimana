import React from 'react';

// Button Component
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger',
  size?: 'sm' | 'md' | 'lg'
}> = ({ 
  children, variant = 'primary', size = 'md', className = '', ...props 
}) => {
  const base = "rounded-xl font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-ocean-600 to-ocean-500 text-white shadow-lg shadow-ocean-500/20 hover:shadow-xl hover:shadow-ocean-500/30 hover:-translate-y-0.5",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-ocean-600",
    danger: "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 shadow-sm",
  };
  const sizes = {
    sm: "px-4 py-2 text-[10px] tracking-widest uppercase",
    md: "px-6 py-3 text-sm",
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
  <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${noPadding ? '' : 'p-8'} ${className}`}>
    {children}
  </div>
);

// Badge Component
export const Badge: React.FC<{ children: React.ReactNode, variant?: 'posted' | 'draft' | 'pending', className?: string }> = ({ 
  children, variant = 'draft', className = '' 
}) => {
  const styles = {
    posted: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/10",
    draft: "bg-slate-50 text-slate-500 border-slate-200",
    pending: "bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-500/10",
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Section Header
export const Header: React.FC<{ title: string, subtitle?: string, action?: React.ReactNode }> = ({ 
  title, subtitle, action 
}) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-slide-up">
    <div className="space-y-1">
      <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-tight">{title}</h1>
      {subtitle && <p className="text-slate-500 font-medium text-base">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-4">{action}</div>}
  </div>
);
