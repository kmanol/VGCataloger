import { useEffect, useState } from 'react';

interface LovData {
    developers: string[];
    publishers: string[];
    platforms: string[];
    genres: string[];
    tags: string[];
    statuses: string[];
    catalogs: string[];
    loading: boolean;
    error: string | null;
}

function toNames(items: { name: string }[]): string[] {
    return items.map(i => i.name);
}

export function useLovData(): LovData {
    const [developers, setDevelopers] = useState<string[]>([]);
    const [publishers, setPublishers] = useState<string[]>([]);
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [statuses, setStatuses] = useState<string[]>([]);
    const [catalogs, setCatalogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('/developers').then(r => { if (!r.ok) throw new Error('developers'); return r.json(); }),
            fetch('/publishers').then(r => { if (!r.ok) throw new Error('publishers'); return r.json(); }),
            fetch('/platforms').then(r => { if (!r.ok) throw new Error('platforms'); return r.json(); }),
            fetch('/genres').then(r => { if (!r.ok) throw new Error('genres'); return r.json(); }),
            fetch('/tags').then(r => { if (!r.ok) throw new Error('tags'); return r.json(); }),
            fetch('/statuses').then(r => { if (!r.ok) throw new Error('statuses'); return r.json(); }),
            fetch('/catalogs').then(r => { if (!r.ok) throw new Error('catalogs'); return r.json(); }),
        ])
            .then(([devs, pubs, plats, gens, tgs, stats, cats]) => {
                setDevelopers(toNames(devs));
                setPublishers(toNames(pubs));
                setPlatforms(toNames(plats));
                setGenres(toNames(gens));
                setTags(toNames(tgs));
                setStatuses(toNames(stats));
                setCatalogs(toNames(cats));
            })
            .catch(() => setError('Failed to load metadata. Some options may be unavailable.'))
            .finally(() => setLoading(false));
    }, []);

    return { developers, publishers, platforms, genres, tags, statuses, catalogs, loading, error };
}
