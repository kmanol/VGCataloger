import { useEffect, useState } from 'react';
import type { Game, PagedResult } from './types';
import AddGameForm from './AddGameForm';
import GamesTable from './GamesTable';
import FilterBar, { type Filters } from './FilterBar';
import ToastContainer from './ToastContainer';
import { useToast } from './useToast';
import './GameManager.css';

const EMPTY_FILTERS: Filters = { platform: '', genre: '', status: '', catalog: '', minRating: 0 };

type LovOption = { name: string } | string;
function toNames(items: LovOption[]) {
    return items.map(i => typeof i === 'string' ? i : i.name);
}

export default function GameManager() {
    const [games, setGames] = useState<Game[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(25);
    const [gamesLoading, setGamesLoading] = useState(false);
    const { toasts, showToast, dismiss } = useToast();
    const [showAddGame, setShowAddGame] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    const [platformOptions, setPlatformOptions] = useState<string[]>([]);
    const [genreOptions, setGenreOptions] = useState<string[]>([]);
    const [statusOptions, setStatusOptions] = useState<string[]>([]);
    const [catalogOptions, setCatalogOptions] = useState<string[]>([]);

    // Fetch LOV options for filter dropdowns once on mount
    useEffect(() => {
        Promise.all([
            fetch('/platforms').then(r => r.json()),
            fetch('/genres').then(r => r.json()),
            fetch('/statuses').then(r => r.json()),
            fetch('/catalogs').then(r => r.json()),
        ]).then(([platforms, genres, statuses, catalogs]) => {
            setPlatformOptions(toNames(platforms));
            setGenreOptions(toNames(genres));
            setStatusOptions(toNames(statuses));
            setCatalogOptions(toNames(catalogs));
        });
    }, []);

    // Debounce search: reset to page 1 after 300ms idle
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch games whenever page, debouncedSearch, or filters change
    useEffect(() => {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (filters.platform) params.set('platform', filters.platform);
        if (filters.genre) params.set('genre', filters.genre);
        if (filters.status) params.set('status', filters.status);
        if (filters.catalog) params.set('catalog', filters.catalog);
        if (filters.minRating > 0) params.set('minRating', String(filters.minRating));

        setGamesLoading(true);
        fetch(`games?${params}`)
            .then(r => r.json())
            .then((data: PagedResult) => {
                setGames(data.items);
                setTotalCount(data.totalCount);
            })
            .finally(() => setGamesLoading(false));
    }, [page, pageSize, debouncedSearch, filters]);

    const handleFiltersChange = (next: Filters) => {
        setFilters(next);
        setPage(1);
    };

    const refreshGames = async () => {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (filters.platform) params.set('platform', filters.platform);
        if (filters.genre) params.set('genre', filters.genre);
        if (filters.status) params.set('status', filters.status);
        if (filters.catalog) params.set('catalog', filters.catalog);
        if (filters.minRating > 0) params.set('minRating', String(filters.minRating));
        const response = await fetch(`games?${params}`);
        if (response.ok) {
            const data: PagedResult = await response.json();
            setGames(data.items);
            setTotalCount(data.totalCount);
        }
    };

    const handleDelete = async (game: Game) => {
        if (!window.confirm(`Delete "${game.title}" from your catalog?`)) return;
        const response = await fetch(`games/${game.id}`, { method: 'DELETE' });
        if (response.ok) {
            await refreshGames();
            showToast(`"${game.title}" deleted`);
        } else {
            showToast(`Failed to delete "${game.title}"`, 'error');
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

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

    return (
        <>
        <div className="game-manager-container">
            <div className="game-manager-toolbar">
                <button
                    className={`add-game-button ${showAddGame ? 'secondary' : ''}`}
                    onClick={() => setShowAddGame(v => !v)}
                >
                    {showAddGame ? 'Close Add Game' : 'Add Game'}
                </button>
            </div>
            {showAddGame && (
                <AddGameForm
                    onGameAdded={async (title) => {
                        await refreshGames();
                        showToast(`"${title}" added to catalog`);
                    }}
                    onClose={() => setShowAddGame(false)}
                />
            )}
            <div className="search-toolbar">
                <label className="field-label" htmlFor="game-search">Search library</label>
                <input
                    id="game-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title…"
                    className="search-input"
                />
            </div>
            <FilterBar
                platformOptions={platformOptions}
                genreOptions={genreOptions}
                statusOptions={statusOptions}
                catalogOptions={catalogOptions}
                filters={filters}
                onChange={handleFiltersChange}
            />
            <GamesTable
                rows={gridRows}
                loading={gamesLoading}
                search={search}
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                onDelete={handleDelete}
                onPageChange={setPage}
            />
        </div>
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </>
    );
}
