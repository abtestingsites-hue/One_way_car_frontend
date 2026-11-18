import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    wrapperClassName?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = "Search...",
    className = "",
    wrapperClassName = "max-w-md w-full",
    ...rest
}) => {
    return (
        <div className={`relative flex items-center h-10 ${wrapperClassName}`}>
            {/* Exactly positioned 16px icon with 14px left gutter */}
            <div className="absolute left-3.5 top-0 bottom-0 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500 z-10">
                <Search size={16} />
            </div>

            {/* Input with strict 42px left padding ensuring zero overlap */}
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full h-10 bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl pl-10 pr-4 text-xs font-medium text-dark-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/15 transition-all ${className}`}
                {...rest}
            />
        </div>
    );
};

export default SearchInput;
