import { useState } from 'react';

interface Game {
    id: number;
    title: string;
    platforms: string[];
    genres: string[];
    tags: string[];
    releaseDate: string;
}

interface Props {
    games: Game[];
    onGamesChange: (games: Game[]) => void;
}

export default function GameManager({ games, onGamesChange }: Props) {
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [form, setForm] = useState<Partial<Game>>({});

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingGame) {
            // Edit
            const response = await fetch(`games/${editingGame.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (response.ok) {
                await refreshGames();
                setEditingGame(null);
                setForm({});
            }
        } else {
            // Add
            const response = await fetch('games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (response.ok) {
                await refreshGames();
                setForm({});
            }
        }
    };

    const handleDelete = async (id: number) => {
        const response = await fetch(`games/${id}`, { method: 'DELETE' });
        if (response.ok) {
            await refreshGames();
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    name="title"
                    value={form.title || ''}
                    onChange={handleChange}
                    placeholder="Title"
                    required
                />
                <input
                    name="platforms"
                    value={form.platforms ? form.platforms.join(', ') : ''}
                    onChange={e =>
                        setForm({ ...form, platforms: e.target.value.split(',').map(s => s.trim()) })
                    }
                    placeholder="Platforms (comma separated)"
                    required
                />
                <input
                    name="genres"
                    value={form.genres ? form.genres.join(', ') : ''}
                    onChange={e =>
                        setForm({ ...form, genres: e.target.value.split(',').map(s => s.trim()) })
                    }
                    placeholder="Genres (comma separated)"
                    required
                />
                <input
                    name="tags"
                    value={form.tags ? form.tags.join(', ') : ''}
                    onChange={e =>
                        setForm({ ...form, tags: e.target.value.split(',').map(s => s.trim()) })
                    }
                    placeholder="Tags (comma separated)"
                    required
                />
                <input
                    type="date"
                    name="releaseDate"
                    value={form.releaseDate ? form.releaseDate.substring(0, 10) : ''}
                    onChange={e =>
                        setForm({ ...form, releaseDate: e.target.value })
                    }
                    required
                />
                <button type="submit">{editingGame ? 'Update' : 'Add'} Game</button>
                {editingGame && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingGame(null);
                            setForm({});
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Platforms</th>
                        <th>Genres</th>
                        <th>Tags</th>
                        <th>Release Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map(game => (
                        <tr key={game.id}>
                            <td>{game.title}</td>
                            <td>{game.platforms.join(', ')}</td>
                            <td>{game.genres.join(', ')}</td>
                            <td>{game.tags.join(', ')}</td>
                            <td>{new Date(game.releaseDate).toLocaleDateString()}</td>
                            <td>
                                <button onClick={() => { setEditingGame(game); setForm(game); }}>Edit</button>
                                <button onClick={() => handleDelete(game.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
