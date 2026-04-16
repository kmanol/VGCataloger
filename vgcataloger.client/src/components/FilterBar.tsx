export interface Filters {
    platform: string;
    genre: string;
    status: string;
    catalog: string;
    minRating: number; // 0 = any
}

interface Props {
    platformOptions: string[];
    genreOptions: string[];
    statusOptions: string[];
    catalogOptions: string[];
    filters: Filters;
    onChange: (filters: Filters) => void;
}

const RATING_OPTIONS = [
    { value: 0, label: 'Any rating' },
    { value: 1, label: '★ and above' },
    { value: 2, label: '★★ and above' },
    { value: 3, label: '★★★ and above' },
    { value: 4, label: '★★★★ and above' },
    { value: 5, label: '★★★★★ only' },
];

export default function FilterBar({ platformOptions, genreOptions, statusOptions, catalogOptions, filters, onChange }: Props) {
    const set = (key: keyof Filters, value: string | number) =>
        onChange({ ...filters, [key]: value });

    const hasActiveFilters = filters.platform || filters.genre || filters.status || filters.catalog || filters.minRating > 0;

    return (
        <div className="filter-bar">
            <FilterSelect
                label="Platform"
                value={filters.platform}
                options={platformOptions}
                onChange={v => set('platform', v)}
            />
            <FilterSelect
                label="Genre"
                value={filters.genre}
                options={genreOptions}
                onChange={v => set('genre', v)}
            />
            <FilterSelect
                label="Status"
                value={filters.status}
                options={statusOptions}
                onChange={v => set('status', v)}
            />
            <FilterSelect
                label="Catalog"
                value={filters.catalog}
                options={catalogOptions}
                onChange={v => set('catalog', v)}
            />
            <div className="filter-field">
                <label className="filter-label">Min rating</label>
                <select
                    className="filter-select"
                    value={filters.minRating}
                    onChange={e => set('minRating', Number(e.target.value))}
                >
                    {RATING_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            {hasActiveFilters && (
                <button
                    className="filter-clear"
                    onClick={() => onChange({ platform: '', genre: '', status: '', catalog: '', minRating: 0 })}
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}

function FilterSelect({ label, value, options, onChange }: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
}) {
    return (
        <div className="filter-field">
            <label className="filter-label">{label}</label>
            <select className="filter-select" value={value} onChange={e => onChange(e.target.value)}>
                <option value="">All</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}
