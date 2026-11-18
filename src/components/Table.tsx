import React, { useState } from 'react';
import SearchInput from './SearchInput';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
    actions?: (item: T) => React.ReactNode;
}

function Table<T extends { id?: string | number; _id?: string }>({ 
    data, 
    columns, 
    onSearch, 
    searchPlaceholder = "Search records...", 
    actions 
}: TableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearch) onSearch(query);
    };

    return (
        <div className="w-full space-y-3">
            {/* Standardized SearchInput Component */}
            {onSearch && (
                <SearchInput
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder={searchPlaceholder}
                    wrapperClassName="max-w-sm w-full"
                />
            )}

            <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="enterprise-table-header">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th 
                                        key={idx} 
                                        className={`first:pl-5 last:pr-5 whitespace-nowrap ${col.className || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                {actions && (
                                    <th className="text-right pr-5 whitespace-nowrap">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data && data.length > 0 ? (
                                data.map((item, idx) => (
                                    <tr 
                                        key={item.id || item._id || idx} 
                                        className="enterprise-table-row transition-colors"
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td 
                                                key={colIdx} 
                                                className={`first:pl-5 last:pr-5 align-middle ${col.className || ''}`}
                                            >
                                                {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="text-right whitespace-nowrap pr-5 align-middle">
                                                <div className="flex justify-end gap-1.5 items-center">{actions(item)}</div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td 
                                        colSpan={columns.length + (actions ? 1 : 0)} 
                                        className="h-32 text-center text-slate-400 text-xs font-medium"
                                    >
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Table;
