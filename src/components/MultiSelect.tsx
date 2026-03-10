'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
    options: string[];
    value: string; // comma-separated
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function MultiSelect({ options, value, onChange, placeholder, className }: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = value ? value.split(',').map(v => v.trim()).filter(Boolean) : [];

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggle = (opt: string) => {
        let next: string[];
        if (selected.includes(opt)) {
            next = selected.filter(s => s !== opt);
        } else {
            next = [...selected, opt];
        }
        onChange(next.join(', '));
    };

    const removeTag = (opt: string) => {
        onChange(selected.filter(s => s !== opt).join(', '));
    };

    return (
        <div ref={ref} className={`relative ${className || ''}`}>
            <div
                onClick={() => setOpen(!open)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer flex items-center justify-between gap-2 min-h-[42px] text-sm"
            >
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {selected.length === 0 && (
                        <span className="text-zinc-500">{placeholder || 'Select...'}</span>
                    )}
                    {selected.map(s => (
                        <span key={s} className="inline-flex items-center gap-1 bg-[#E8652D]/15 text-[#E8652D] text-xs px-2 py-0.5 rounded-md font-medium">
                            {s}
                            <button type="button" onClick={e => { e.stopPropagation(); removeTag(s); }} className="hover:text-red-400">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <ChevronDown className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
            {open && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    {options.map(opt => (
                        <label
                            key={opt}
                            className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer text-sm text-zinc-700 dark:text-zinc-300"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(opt)}
                                onChange={() => toggle(opt)}
                                className="accent-[#E8652D] h-4 w-4 rounded"
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
