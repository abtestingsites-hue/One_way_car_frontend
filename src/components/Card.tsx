import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
    children, 
    className = '', 
    title, 
    subtitle,
    action,
    onClick 
}) => {
    return (
        <div 
            onClick={onClick} 
            className={`bg-white dark:bg-dark-950 rounded-2xl border border-slate-200/90 dark:border-dark-800 shadow-subtle p-4 sm:p-5 transition-all duration-200 ${
                onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-dark-700 hover:shadow-enterprise hover:-translate-y-0.5' : ''
            } ${className}`}
        >
            {(title || action) && (
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-dark-850">
                    <div>
                        <h3 className="text-xs sm:text-sm font-montserrat font-bold text-dark-950 dark:text-white tracking-tight">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
