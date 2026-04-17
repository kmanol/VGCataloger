import { useEffect, useState } from 'react';
import type { Game, PagedResult } from './types';
import AddGameForm from './AddGameForm';
import GamesTable from './GamesTable';
import FilterBar, { type Filters } from './FilterBar';
import ToastContainer from './ToastContainer';
import { useToast } from './useToast';
import { useLovData } from './useLovData';
import './GameManager.css';

const EMPTY_FILTERS: Filters = { platform: '', genre: '', status: '', catalog: '', minRating: 0 };

export default function GameManager() {
    const [games, setGames] = useState<Game[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(25);
    const [gamesLoading, setGamesLoading] = useState(false);
    const { toasts, showToast, dismiss } = useToast();
    const [showAddGame, setShowAddGame] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

    const { platforms: platformOptions, genres: genreOptions, statuses: statusOptions, catalogs: catalogOptions, error: lovError } = useLovData();

    useEffect(() => {
        if (lovError) showToast(lovError, 'error');
    }, [lovError]);

    // Debounce search: reset to page 1 after 300ms idle
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const buildParams = () => {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (filters.platform) params.set('platform', filters.platform);
        if (filters.genre) params.set('genre', filters.genre);
        if (filters.status) params.set('status', filters.status);
        if (filters.catalog) params.set('catalog', filters.catalog);
        if (filters.minRating > 0) params.set('minRating', String(filters.minRating));
        return params;
    };

    // Fetch games whenever page, debouncedSearch, or filters change
    useEffect(() => {
        setGamesLoading(true);
        fetch(`games?${buildParams()}`)
            .then(r => {
                if (!r.ok) throw new Error('Failed to load games');
                return r.json();
            })
            .then((data: PagedResult) => {
                setGames(data.items);
                setTotalCount(data.totalCount);
            })
            .catch(() => showToast('Failed to load games', 'error'))
            .finally(() => setGamesLoading(false));
    }, [page, pageSize, debouncedSearch, filters]);

    const handleFiltersChange = (next: Filters) => {
        setFilters(next);
        setPage(1);
    };

    const refreshGames = async () => {
        const response = await fetch(`games?${buildParams()}`);
        if (response.ok) {
            const data: PagedResult = await response.json();
            setGames(data.items);
            setTotalCount(data.totalCount);
        }
    };

    const handleEdit = (game: Game) => {
        setEditingGame(game);
        setShowAddGame(false);
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
                    onClick={() => { setShowAddGame(v => !v); setEditingGame(null); }}
                >
                    {showAddGame ? 'Close' : 'Add Game'}
                </button>
            </div>
            {(showAddGame || editingGame) && (
                <AddGameForm
                    key={editingGame?.id ?? 'new'}
                    initialGame={editingGame ?? undefined}
                    onGameAdded={async (title) => {
                        await refreshGames();
                        showToast(`"${title}" added to catalog`);
                    }}
                    onGameUpdated={async (title) => {
                        await refreshGames();
                        showToast(`"${title}" updated`);
                    }}
                    onError={msg => showToast(msg, 'error')}
                    onClose={() => { setShowAddGame(false); setEditingGame(null); }}
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
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPageChange={setPage}
            />
        </div>
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </>
    );
}
