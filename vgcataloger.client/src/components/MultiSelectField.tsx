import { useEffect, useRef, useState } from 'react';

interface Props {
    label: string;
    options: string[];
    values: string[];
    placeholder: string;
    disabled?: boolean;
    compact?: boolean;
    onChange: (values: string[]) => void;
}

export default function MultiSelectField({
    label,
    options,
    values,
    placeholder,
    disabled,
    compact,
    onChange,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(query.toLowerCase())
    );

    const toggleValue = (option: string) => {
        if (values.includes(option)) {
            onChange(values.filter(v => v !== option));
        } else {
            onChange([...values, option]);
        }
    };

    return (
        <div className={`field ${compact ? 'field--small' : 'field--wide'}`} ref={containerRef}>
            <label className="field-label">{label}</label>
            <div className="multi-select">
                <button
                    type="button"
                    className="multi-select-trigger"
                    onClick={() => setIsOpen(open => !open)}
                    disabled={disabled}
                    aria-expanded={isOpen}
                >
                    <span className={values.length > 0 ? 'multi-select-value' : 'multi-select-placeholder'}>
                        {values.length > 0 ? `${values.length} selected` : placeholder}
                    </span>
                    <span className="multi-select-caret">▾</span>
                </button>
                {values.length > 0 && (
                    <div className="selected-chip-list">
                        {values.map(value => (
                            <button
                                key={value}
                                type="button"
                                className="chip chip-button"
                                onClick={() => toggleValue(value)}
                            >
                                {value} ×
                            </button>
                        ))}
                    </div>
                )}
                {isOpen && (
                    <div className="multi-select-panel">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Search ${label.toLowerCase()}...`}
                            className="multi-select-search"
                            autoFocus
                        />
                        <div className="multi-select-list">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(option => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`multi-select-option ${values.includes(option) ? 'selected' : ''}`}
                                        onClick={() => toggleValue(option)}
                                    >
                                        <span className="multi-select-check">{values.includes(option) ? '✓' : ''}</span>
                                        <span>{option}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="multi-select-empty">No matches found.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
