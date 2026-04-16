import { useState } from 'react';
import type { Game } from './types';

interface GameRow extends Game {
    releaseDate: string;
}

interface Props {
    rows: GameRow[];
    loading: boolean;
    search: string;
    page: number;
    totalPages: number;
    totalCount: number;
    onDelete: (game: GameRow) => void;
    onPageChange: (page: number) => void;
}

function CoverArt({ steamAppId }: { steamAppId?: number }) {
    const [failed, setFailed] = useState(false);

    if (!steamAppId || failed) {
        return <div className="cover-placeholder" />;
    }

    return (
        <img
            className="cover-img"
            src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/header.jpg`}
            alt=""
            onError={() => setFailed(true)}
        />
    );
}

function renderTableChips(values: string[]) {
    if (values.length === 0) {
        return <span className="muted-copy">—</span>;
    }

    const visible = values.slice(0, 3);
    const remaining = values.length - visible.length;

    return (
        <>
            {visible.map((value, idx) => (
                <span key={`${value}-${idx}`} className="chip">{value}</span>
            ))}
            {remaining > 0 && (
                <span className="chip chip-more" title={values.slice(3).join(', ')}>
                    +{remaining} more
                </span>
            )}
        </>
    );
}

export default function GamesTable({ rows, loading, search, page, totalPages, totalCount, onDelete, onPageChange }: Props) {
    if (loading) {
        return (
            <div className="loading">
                <div>Loading games…</div>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="empty-state">
                <h4>{search ? 'No matching games found' : 'No games in your catalog yet'}</h4>
                <p>
                    {search
                        ? 'Try adjusting your search terms or filters.'
                        : 'Use Add Game to create your first catalog entry.'}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="table-wrapper">
                <table className="game-table">
                    <thead>
                        <tr>
                            <th className="col-cover"></th>
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
                        {rows.map(game => (
                            <tr key={game.id}>
                                <td className="col-cover"><CoverArt steamAppId={game.steamAppId} /></td>
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
                                        onClick={() => onDelete(game)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {page} of {totalPages} ({totalCount} games)
                    </span>
                    <button
                        className="pagination-button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
}
