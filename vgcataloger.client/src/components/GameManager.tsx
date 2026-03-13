import { useEffect, useRef, useState } from 'react';
import './GameManager.css';

interface Game {
    id: number;
    title: string;
    developers: string[];
    publishers: string[];
    platforms: string[];
    genres: string[];
    tags: string[];
    releaseDate: string;
    statuses: string[];
    userRating?: number;
    catalogs: string[];
}

interface Props {
    games: Game[];
    onGamesChange: (games: Game[]) => void;
}

interface SteamApp {
    appid: number;
    name: string;
}

interface TitleAutocompleteFieldProps {
    value: string;
    options: string[];
    loading: boolean;
    disabled?: boolean;
    onChange: (value: string) => void;
}

interface MultiSelectFieldProps {
    label: string;
    options: string[];
    values: string[];
    placeholder: string;
    disabled?: boolean;
    compact?: boolean;
    onChange: (values: string[]) => void;
}

function TitleAutocompleteField({ value, options, loading, disabled, onChange }: TitleAutocompleteFieldProps) {
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
                    onChange(e.target.value);
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
                                key={option}
                                type="button"
                                className="autocomplete-option"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                            >
                                {option}
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

function MultiSelectField({
    label,
    options,
    values,
    placeholder,
    disabled,
    compact,
    onChange,
}: MultiSelectFieldProps) {
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
            onChange(values.filter(value => value !== option));
            return;
        }

        onChange([...values, option]);
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

export default function GameManager({ games, onGamesChange }: Props) {
    const [form, setForm] = useState<Partial<Game>>({ userRating: 0 });
    const [developerOptions, setDeveloperOptions] = useState<string[]>([]);
    const [publisherOptions, setPublisherOptions] = useState<string[]>([]);
    const [platformOptions, setPlatformOptions] = useState<string[]>([]);
    const [genreOptions, setGenreOptions] = useState<string[]>([]);
    const [tagOptions, setTagOptions] = useState<string[]>([]);
    const [statusOptions, setStatusOptions] = useState<string[]>([]);
    const [catalogOptions, setCatalogOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddGame, setShowAddGame] = useState(false);
    const [search, setSearch] = useState('');
    const [steamAppOptions, setSteamAppOptions] = useState<string[]>([]);
    const [appSearch, setAppSearch] = useState('');
    const [steamLoading, setSteamLoading] = useState(false);

    type Option = { name: string } | string;

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('/developers').then(r => r.json()),
            fetch('/publishers').then(r => r.json()),
            fetch('/platforms').then(r => r.json()),
            fetch('/genres').then(r => r.json()),
            fetch('/tags').then(r => r.json()),
            fetch('/statuses').then(r => r.json()),
            fetch('/catalogs').then(r => r.json())
        ]).then(([developers, publishers, platforms, genres, tags, statuses, catalogs]) => {
            setDeveloperOptions((developers as Option[]).map(d => typeof d === "string" ? d : d.name));
            setPublisherOptions((publishers as Option[]).map(p => typeof p === "string" ? p : p.name));
            setPlatformOptions((platforms as Option[]).map(p => typeof p === "string" ? p : p.name));
            setGenreOptions((genres as Option[]).map(g => typeof g === "string" ? g : g.name));
            setTagOptions((tags as Option[]).map(t => typeof t === "string" ? t : t.name));
            setStatusOptions((statuses as Option[]).map(s => typeof s === "string" ? s : s.name));
            setCatalogOptions((catalogs as Option[]).map(c => typeof c === "string" ? c : c.name));
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (appSearch.length < 2) {
            setSteamAppOptions([]);
            setSteamLoading(false);
            return;
        }

        const controller = new AbortController();
        setSteamLoading(true);

        fetch(`/steam/applist?search=${encodeURIComponent(appSearch)}`, { signal: controller.signal })
            .then(r => r.json())
            .then((data: SteamApp[]) => setSteamAppOptions(data.map((a) => a.name)))
            .catch(() => { })
            .finally(() => setSteamLoading(false));

        return () => controller.abort();
    }, [appSearch]);

    const updateForm = <K extends keyof Game>(name: K, value: Game[K]) => {
        setForm(current => ({ ...current, [name]: value }));
    };

    const refreshGames = async () => {
        const response = await fetch('games');
        if (response.ok) {
            const data = await response.json();
            onGamesChange(data);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: keyof Game, value: string[]) => {
        setForm({ ...form, [name]: value });
    };

    const resetForm = () => {
        setForm({ userRating: 0 });
        setAppSearch('');
        setSteamAppOptions([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const completeForm = {
            title: form.title ?? "",
            releaseDate: form.releaseDate ?? "",
            developers: form.developers ?? [],
            publishers: form.publishers ?? [],
            platforms: form.platforms ?? [],
            genres: form.genres ?? [],
            tags: form.tags ?? [],
            statuses: form.statuses ?? [],
            catalogs: form.catalogs ?? [],
            userRating: form.userRating ?? null
        };
        const response = await fetch('games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(completeForm),
        });
        if (response.ok) {
            await refreshGames();
            resetForm();
            setShowAddGame(false);
        }
    };

    const handleDelete = async (game: Game) => {
        const confirmed = window.confirm(`Delete "${game.title}" from your catalog?`);
        if (!confirmed) {
            return;
        }

        const response = await fetch(`games/${game.id}`, { method: 'DELETE' });
        if (response.ok) {
            await refreshGames();
        }
    };

    // For grid, keep arrays for platforms/genres/tags
    const gridRows = games.map(game => ({
        ...game,
        developers: Array.isArray(game.developers) ? game.developers : [],
        publishers: Array.isArray(game.publishers) ? game.publishers : [],
        platforms: Array.isArray(game.platforms) ? game.platforms : [],
        genres: Array.isArray(game.genres) ? game.genres : [],
        tags: Array.isArray(game.tags) ? game.tags : [],
        statuses: Array.isArray(game.statuses) ? game.statuses : [],
        catalogs: Array.isArray(game.catalogs) ? game.catalogs : [],
        releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().substring(0, 10) : '',
    }));

    // Filter gridRows by search
    const filteredRows = gridRows.filter(game =>
        game.title.toLowerCase().includes(search.toLowerCase()) ||
        game.developers.some(d => d.toLowerCase().includes(search.toLowerCase())) ||
        game.publishers.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
        game.platforms.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
        game.genres.some(g => g.toLowerCase().includes(search.toLowerCase())) ||
        game.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        game.statuses.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
        game.catalogs.some(c => c.toLowerCase().includes(search.toLowerCase()))
    );

    const renderTableChips = (values: string[]) => {
        if (values.length === 0) {
            return <span className="muted-copy">—</span>;
        }

        const visibleValues = values.slice(0, 3);
        const remainingCount = values.length - visibleValues.length;

        return (
            <>
                {visibleValues.map((value, idx) => (
                    <span key={`${value}-${idx}`} className="chip">{value}</span>
                ))}
                {remainingCount > 0 && (
                    <span className="chip chip-more" title={values.slice(3).join(', ')}>
                        +{remainingCount} more
                    </span>
                )}
            </>
        );
    };

    return (
        <div className="game-manager-container">
            <div className="game-manager-toolbar">
                <button
                    className={`add-game-button ${showAddGame ? 'secondary' : ''}`}
                    onClick={() => setShowAddGame(v => !v)}
                >
                    {showAddGame ? "Close Add Game" : "Add Game"}
                </button>
            </div>
            {showAddGame && (
                <div className="add-game-form">
                    <div className="form-header">
                        <h3>Add Game</h3>
                        <p>Search Steam, choose metadata quickly, and review selections before saving.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="game-form">
                        <section className="form-section">
                            <h4>Basic Info</h4>
                            <div className="form-grid">
                                <TitleAutocompleteField
                                    value={form.title || ''}
                                    options={steamAppOptions}
                                    loading={steamLoading}
                                    disabled={loading}
                                    onChange={(value) => {
                                        updateForm('title', value);
                                        setAppSearch(value);
                                    }}
                                />
                                <div className="field field--small">
                                    <label className="field-label" htmlFor="releaseDate">Release Date</label>
                                    <input
                                        id="releaseDate"
                                        type="date"
                                        name="releaseDate"
                                        value={form.releaseDate ? form.releaseDate.substring(0, 10) : ''}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="field field--small">
                                    <span className="field-label">User Rating</span>
                                    <div className="rating-picker">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <button
                                                key={rating}
                                                type="button"
                                                className={`rating-star ${(form.userRating ?? 0) >= rating ? 'active' : ''}`}
                                                onClick={() => updateForm('userRating', rating)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            className="rating-clear"
                                            onClick={() => updateForm('userRating', 0)}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="form-section">
                            <h4>People</h4>
                            <div className="form-grid">
                                <MultiSelectField
                                    label="Developers"
                                    options={developerOptions}
                                    values={form.developers || []}
                                    placeholder="Select developers"
                                    disabled={loading}
                                    onChange={(values) => handleSelectChange('developers', values)}
                                />
                                <MultiSelectField
                                    label="Publishers"
                                    options={publisherOptions}
                                    values={form.publishers || []}
                                    placeholder="Select publishers"
                                    disabled={loading}
                                    onChange={(values) => handleSelectChange('publishers', values)}
                                />
                            </div>
                        </section>

                        <section className="form-section">
                            <h4>Classification</h4>
                            <div className="form-grid">
                                <MultiSelectField
                                    label="Platforms"
                                    options={platformOptions}
                                    values={form.platforms || []}
                                    placeholder="Select platforms"
                                    disabled={loading}
                                    compact
                                    onChange={(values) => handleSelectChange('platforms', values)}
                                />
                                <MultiSelectField
                                    label="Genres"
                                    options={genreOptions}
                                    values={form.genres || []}
                                    placeholder="Select genres"
                                    disabled={loading}
                                    onChange={(values) => handleSelectChange('genres', values)}
                                />
                                <MultiSelectField
                                    label="Tags"
                                    options={tagOptions}
                                    values={form.tags || []}
                                    placeholder="Select tags"
                                    disabled={loading}
                                    onChange={(values) => handleSelectChange('tags', values)}
                                />
                            </div>
                        </section>

                        <section className="form-section">
                            <h4>Tracking</h4>
                            <div className="form-grid">
                                <MultiSelectField
                                    label="Statuses"
                                    options={statusOptions}
                                    values={form.statuses || []}
                                    placeholder="Select statuses"
                                    disabled={loading}
                                    compact
                                    onChange={(values) => handleSelectChange('statuses', values)}
                                />
                                <MultiSelectField
                                    label="Catalogs"
                                    options={catalogOptions}
                                    values={form.catalogs || []}
                                    placeholder="Select catalogs"
                                    disabled={loading}
                                    compact
                                    onChange={(values) => handleSelectChange('catalogs', values)}
                                />
                            </div>
                        </section>

                        <div className="form-actions">
                            <button type="button" className="form-button form-button-secondary" onClick={resetForm}>
                                Reset
                            </button>
                            <button
                                type="button"
                                className="form-button form-button-secondary"
                                onClick={() => {
                                    resetForm();
                                    setShowAddGame(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="form-button">
                                Add Game
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <div className="search-toolbar">
                <label className="field-label" htmlFor="game-search">Search library</label>
                <input
                    id="game-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title, person, platform, genre, tag, status, or catalog"
                    className="search-input"
                />
            </div>
            {loading ? (
                <div className="loading">
                    <div>Loading metadata and games…</div>
                </div>
            ) : filteredRows.length === 0 ? (
                <div className="empty-state">
                    <h4>{search ? 'No matching games found' : 'No games in your catalog yet'}</h4>
                    <p>
                        {search
                            ? 'Try adjusting your search terms or filters.'
                            : 'Use Add Game to create your first catalog entry.'}
                    </p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="game-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Developers</th>
                                <th>Publishers</th>
                                <th>Platforms</th>
                                <th>Genres</th>
                                <th>Tags</th>
                                <th>Release Date</th>
                                <th>Status</th>
                                <th>User Rating</th>
                                <th>Catalogs</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map(game => (
                                <tr key={game.id}>
                                    <td>{game.title}</td>
                                    <td>{renderTableChips(game.developers)}</td>
                                    <td>{renderTableChips(game.publishers)}</td>
                                    <td>{renderTableChips(game.platforms)}</td>
                                    <td>{renderTableChips(game.genres)}</td>
                                    <td>{renderTableChips(game.tags)}</td>
                                    <td>{game.releaseDate}</td>
                                    <td>{renderTableChips(game.statuses)}</td>
                                    <td className="rating-display">
                                        {'★'.repeat(game.userRating || 0)}{'☆'.repeat(5 - (game.userRating || 0))}
                                    </td>
                                    <td>{renderTableChips(game.catalogs)}</td>
                                    <td className="table-actions">
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(game)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}