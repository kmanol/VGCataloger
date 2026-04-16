import { useEffect, useState } from 'react';
import type { Game, SteamApp } from './types';
import TitleAutocompleteField from './TitleAutocompleteField';
import MultiSelectField from './MultiSelectField';
import { useLovData } from './useLovData';

interface Props {
    onGameAdded: (title: string) => void;
    onError?: (message: string) => void;
    onClose: () => void;
}

export default function AddGameForm({ onGameAdded, onError, onClose }: Props) {
    const [form, setForm] = useState<Partial<Game>>({ userRating: 0 });
    const [steamAppOptions, setSteamAppOptions] = useState<SteamApp[]>([]);
    const [appSearch, setAppSearch] = useState('');
    const [steamLoading, setSteamLoading] = useState(false);

    const { developers: developerOptions, publishers: publisherOptions, platforms: platformOptions,
            genres: genreOptions, tags: tagOptions, statuses: statusOptions, catalogs: catalogOptions,
            loading: metaLoading } = useLovData();

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
            .then((data: SteamApp[]) => setSteamAppOptions(data))
            .finally(() => setSteamLoading(false));

        return () => controller.abort();
    }, [appSearch]);

    const updateForm = <K extends keyof Game>(name: K, value: Game[K]) => {
        setForm(current => ({ ...current, [name]: value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(current => ({ ...current, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name: keyof Game, value: string[]) => {
        setForm(current => ({ ...current, [name]: value }));
    };

    const resetForm = () => {
        setForm({ userRating: 0 });
        setAppSearch('');
        setSteamAppOptions([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title: form.title ?? '',
            releaseDate: form.releaseDate ?? '',
            developers: form.developers ?? [],
            publishers: form.publishers ?? [],
            platforms: form.platforms ?? [],
            genres: form.genres ?? [],
            tags: form.tags ?? [],
            statuses: form.statuses ?? [],
            catalogs: form.catalogs ?? [],
            userRating: form.userRating ?? null,
            steamAppId: form.steamAppId ?? null,
        };
        const response = await fetch('games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (response.ok) {
            onGameAdded(payload.title);
            resetForm();
            onClose();
        } else {
            onError?.(`Failed to add "${payload.title}"`);
        }
    };

    return (
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
                            disabled={metaLoading}
                            onChange={(app) => {
                                setForm(current => ({
                                    ...current,
                                    title: app.name,
                                    steamAppId: app.appid || undefined,
                                }));
                                setAppSearch(app.name);
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
                                disabled={metaLoading}
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
                            disabled={metaLoading}
                            onChange={(values) => handleSelectChange('developers', values)}
                        />
                        <MultiSelectField
                            label="Publishers"
                            options={publisherOptions}
                            values={form.publishers || []}
                            placeholder="Select publishers"
                            disabled={metaLoading}
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
                            disabled={metaLoading}
                            compact
                            onChange={(values) => handleSelectChange('platforms', values)}
                        />
                        <MultiSelectField
                            label="Genres"
                            options={genreOptions}
                            values={form.genres || []}
                            placeholder="Select genres"
                            disabled={metaLoading}
                            onChange={(values) => handleSelectChange('genres', values)}
                        />
                        <MultiSelectField
                            label="Tags"
                            options={tagOptions}
                            values={form.tags || []}
                            placeholder="Select tags"
                            disabled={metaLoading}
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
                            disabled={metaLoading}
                            compact
                            onChange={(values) => handleSelectChange('statuses', values)}
                        />
                        <MultiSelectField
                            label="Catalogs"
                            options={catalogOptions}
                            values={form.catalogs || []}
                            placeholder="Select catalogs"
                            disabled={metaLoading}
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
                        onClick={() => { resetForm(); onClose(); }}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="form-button">
                        Add Game
                    </button>
                </div>
            </form>
        </div>
    );
}
