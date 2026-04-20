import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
  compact?: boolean;
}

export function Table<T>({ data, columns, onRowClick, className = '', compact = false }: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 ${compact ? 'py-2' : 'py-4'} text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((item, rowIdx) => (
            <tr 
              key={rowIdx} 
              onClick={() => onRowClick?.(item)}
              className={`group transition-all duration-200 ${onRowClick ? 'cursor-pointer hover:bg-ocean-50/30' : ''}`}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`px-6 ${compact ? 'py-2' : 'py-4'} text-sm font-medium text-slate-600 group-hover:text-ocean-800 ${col.className || ''}`}>
                  {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as unknown as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
