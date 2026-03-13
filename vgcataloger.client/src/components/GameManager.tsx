import { useState, useEffect } from 'react';
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

export default function GameManager({ games, onGamesChange }: Props) {
    const [form, setForm] = useState<Partial<Game>>({});
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
            return;
        }
        const controller = new AbortController();
        fetch(`/steam/applist?search=${encodeURIComponent(appSearch)}`, { signal: controller.signal })
            .then(r => r.json())
            .then((data: SteamApp[]) => setSteamAppOptions(data.map((a) => a.name)))
            .catch(() => { });
        return () => controller.abort();
    }, [appSearch]);

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
            setForm({});
        }
    };

    const handleDelete = async (id: number) => {
        const response = await fetch(`games/${id}`, { method: 'DELETE' });
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

    return (
        <div className="game-manager-container">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <button
                    className={`add-game-button ${showAddGame ? 'secondary' : ''}`}
                    onClick={() => setShowAddGame(v => !v)}
                >
                    {showAddGame ? "Close Add Game" : "Add Game"}
                </button>
            </div>
            {showAddGame && (
                <div className="add-game-form">
                    <h3>Add Game</h3>
                    <form onSubmit={handleSubmit} className="form-row">
                        <input
                            list="steamApps"
                            name="title"
                            placeholder="Title"
                            value={form.title || ''}
                            onChange={(e) => { setForm({ ...form, title: e.target.value }); setAppSearch(e.target.value); }}
                            required
                            className="form-input"
                            disabled={loading}
                        />
                        <datalist id="steamApps">
                            {steamAppOptions.map(option => <option key={option} value={option} />)}
                        </datalist>
                        <select
                            multiple
                            name="developers"
                            value={form.developers || []}
                            onChange={e => handleSelectChange('developers', Array.from(e.target.selectedOptions, option => option.value))}
                            className="form-select"
                            disabled={loading}
                        >
                            {developerOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <select
                            multiple
                            name="publishers"
                            value={form.publishers || []}
                            onChange={e => handleSelectChange('publishers', Array.from(e.target.selectedOptions, option => option.value))}
                            className="form-select"
                            disabled={loading}
                        >
                            {publisherOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <select
                            multiple
                            name="platforms"
                            value={form.platforms || []}
                            onChange={e => handleSelectChange('platforms', Array.from(e.target.selectedOptions, option => option.value))}
                            className="form-select-sm"
                            disabled={loading}
                        >
                            {platformOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <select
                            multiple
                            name="genres"
                            value={form.genres || []}
                            onChange={e => handleSelectChange('genres', Array.from(e.target.selectedOptions, option => option.value))}
                            className="form-select"
                            disabled={loading}
                        >
                            {genreOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <select
                            multiple
                            name="tags"
                            value={form.tags || []}
                            onChange={e => handleSelectChange('tags', Array.from(e.target.selectedOptions, option => option.value))}
                            className="form-select"
                            disabled={loading}
                        >
                            {tagOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <select
                            multiple
                            name="statuses"
                            value={form.statuses || []}
                            onChange={e => handleSelectChange('statuses', Array.from(e.target.selectedOptions, option => option.value))}
                            className="form-select-sm"
                            disabled={loading}
                        >
                            {statusOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <select
                            multiple
                            name="catalogs"
                            value={form.catalogs || []}
                            onChange={e => handleSelectChange('catalogs', Array.from(e.target.selectedOptions, option => option.value))}
                            className="form-select-sm"
                            disabled={loading}
                        >
                            {catalogOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            name="releaseDate"
                            value={form.releaseDate ? form.releaseDate.substring(0, 10) : ''}
                            onChange={handleChange}
                            required
                            className="form-select-sm"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="form-button"
                        >
                            Add
                        </button>
                    </form>
                </div>
            )}
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ..."
                className="search-input"
            />
            {loading && (
                <div className="loading">
                    <div>Loading...</div>
                </div>
            )}
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
                            <td>
                                {game.developers.map((d, idx) => <span key={idx} className="chip">{d}</span>)}
                            </td>
                            <td>
                                {game.publishers.map((p, idx) => <span key={idx} className="chip">{p}</span>)}
                            </td>
                            <td>
                                {game.platforms.map((p, idx) => <span key={idx} className="chip">{p}</span>)}
                            </td>
                            <td>
                                {game.genres.map((g, idx) => <span key={idx} className="chip">{g}</span>)}
                            </td>
                            <td>
                                {game.tags.map((t, idx) => <span key={idx} className="chip">{t}</span>)}
                            </td>
                            <td>{game.releaseDate}</td>
                            <td>
                                {game.statuses.map((s, idx) => <span key={idx} className="chip">{s}</span>)}
                            </td>
                            <td>
                                {'★'.repeat(game.userRating || 0)}{'☆'.repeat(5 - (game.userRating || 0))}
                            </td>
                            <td>
                                {game.catalogs.map((c, idx) => <span key={idx} className="chip">{c}</span>)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDelete(game.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}