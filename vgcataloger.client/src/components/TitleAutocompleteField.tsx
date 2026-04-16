import { useEffect, useRef, useState } from 'react';
import type { SteamApp } from './types';

interface Props {
    value: string;
    options: SteamApp[];
    loading: boolean;
    disabled?: boolean;
    onChange: (app: SteamApp) => void;
}

export default function TitleAutocompleteField({ value, options, loading, disabled, onChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showDropdown = isOpen && value.trim().length >= 2;

    return (
        <div className="field field--wide" ref={containerRef}>
            <label className="field-label" htmlFor="game-title">Title</label>
            <input
                id="game-title"
                name="title"
                placeholder="Start typing a game title..."
                value={value}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                    onChange({ appid: 0, name: e.target.value });
                    setIsOpen(true);
                }}
                required
                className="form-input"
                disabled={disabled}
                autoComplete="off"
            />
            <div className="field-help">
                Type at least 2 characters to search Steam titles.
            </div>
            {showDropdown && (
                <div className="autocomplete-panel">
                    {loading ? (
                        <div className="autocomplete-state">Searching Steam…</div>
                    ) : options.length > 0 ? (
                        options.slice(0, 8).map(option => (
                            <button
                                key={option.appid}
                                type="button"
                                className="autocomplete-option"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                            >
                                {option.name}
                            </button>
                        ))
                    ) : (
                        <div className="autocomplete-state">No Steam matches found.</div>
                    )}
                </div>
            )}
        </div>
    );
}
