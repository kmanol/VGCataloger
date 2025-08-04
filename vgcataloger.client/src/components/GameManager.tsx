import { useState, useEffect } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    IconButton,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Chip,
    Stack,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Rating from '@mui/material/Rating';

import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import type {
    GridColDef,
    GridRenderCellParams,
    GridRenderEditCellParams,
} from '@mui/x-data-grid';

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

    const apiRef = useGridApiRef();

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

    const parseArray = (value: string | string[] | undefined): string[] =>
        !value ? [] : Array.isArray(value)
            ? value
            : value.split(',').map(s => s.trim()).filter(Boolean);

    const processRowUpdate = async (newRow: Game) => {
        const updatedRow: Game = {
            ...newRow,
            developers: parseArray(newRow.developers),
            publishers: parseArray(newRow.publishers),
            platforms: parseArray(newRow.platforms),
            genres: parseArray(newRow.genres),
            tags: parseArray(newRow.tags),
            statuses: parseArray(newRow.statuses),
            catalogs: parseArray(newRow.catalogs),
        };
        const response = await fetch(`games/${updatedRow.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedRow),
        });
        if (response.ok) {
            await refreshGames();
            return updatedRow;
        }
        return newRow;
    };

    // Render chips for array fields
    function renderChipsCell(values: string[]) {
        return (
            <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                alignItems="center"
                justifyContent="center"
                sx={{ height: '100%', width: '100%' }}
            >
                {values.map((value, idx) => (
                    <Chip key={idx} label={value} size="small" sx={{ mb: 0.5 }} />
                ))}
            </Stack>
        );
    }

    function renderEditSelectCell(options: string[], params: GridRenderEditCellParams) {
        return (
            <Select
                multiple
                value={parseArray(params.value)}
                onChange={e => {
                    const value = typeof e.target.value === 'string'
                        ? e.target.value.split(',')
                        : e.target.value;
                    params.api.setEditCellValue({ id: params.id, field: params.field, value }, e);
                }}
                size="small"
                fullWidth
                sx={{ width: '100%', height: '100%' }}
                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                renderValue={(selected) => (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {(selected as string[]).map((value, idx) => (
                            <Chip key={idx} label={value} size="small" sx={{ mb: 0.5 }} />
                        ))}
                    </Stack>
                )}
            >
                {options.map(option => (
                    <MenuItem key={option} value={option}>
                        <Checkbox checked={parseArray(params.value).indexOf(option) > -1} />
                        <ListItemText primary={option} />
                    </MenuItem>
                ))}
            </Select>
        );
    }
    function renderEditDateCell(params: GridRenderEditCellParams) {
        return (
            <TextField
                type="date"
                value={params.value ? params.value.substring(0, 10) : ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    params.api.setEditCellValue({
                        id: params.id,
                        field: params.field,
                        value: e.target.value
                    }, e);
                }}
                sx={{
                    minWidth: 0,
                    width: '100%',
                    '& .MuiInputBase-root': {
                        fontSize: '0.95rem',
                        height: '100%',
                    },
                    '& input': {
                        padding: '6px 8px',
                        textAlign: 'center',
                    },
                }}
            />
        );
    }

    function renderRatingCell(params: GridRenderCellParams<Game, number | undefined>) {
        return (
            <Rating
                value={params.value ?? null}
                max={5}
                readOnly
                size="small"
            />
        );
    }

    function renderEditRatingCell(params: GridRenderEditCellParams) {
        return (
            <Rating
                value={params.value ?? null}
                max={5}
                size="small"
                onChange={(_, value) => {
                    params.api.setEditCellValue({ id: params.id, field: params.field, value }, undefined);
                }}
            />
        );
    }

    const columns: GridColDef[] = [
        { field: 'title', headerName: 'Title', flex: 3, minWidth: 240, editable: true },
        {
            field: 'developers',
            headerName: 'Developers',
            flex: 2,
            minWidth: 180,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<Game, string[]>) =>
                renderChipsCell(parseArray(params.value)),
            renderEditCell: (params) => renderEditSelectCell(developerOptions, params),
        },
        {
            field: 'publishers',
            headerName: 'Publishers',
            flex: 2,
            minWidth: 180,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<Game, string[]>) =>
                renderChipsCell(parseArray(params.value)),
            renderEditCell: (params) => renderEditSelectCell(publisherOptions, params),
        },
        {
            field: 'platforms',
            headerName: 'Platforms',
            flex: 1,
            minWidth: 120,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<Game, string[]>) =>
                renderChipsCell(parseArray(params.value)),
            renderEditCell: (params) => renderEditSelectCell(platformOptions, params),
        },
        {
            field: 'genres',
            headerName: 'Genres',
            flex: 2,
            minWidth: 180,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<Game, string[]>) =>
                renderChipsCell(parseArray(params.value)),
            renderEditCell: (params) => renderEditSelectCell(genreOptions, params),
        },
        {
            field: 'tags',
            headerName: 'Tags',
            flex: 3,
            minWidth: 240,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<Game, string[]>) =>
                renderChipsCell(parseArray(params.value)),
            renderEditCell: (params) => renderEditSelectCell(tagOptions, params),
        },
        {
            field: 'releaseDate',
            headerName: 'Release Date',
            flex: 1,
            minWidth: 120,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderEditCell: renderEditDateCell,
        },
        {
            field: 'statuses',
            headerName: 'Status',
            flex: 1,
            minWidth: 120,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<Game, string[]>) =>
                renderChipsCell(parseArray(params.value)),
            renderEditCell: (params) => renderEditSelectCell(statusOptions, params),
        },
        {
            field: 'userRating',
            headerName: 'User Rating',
            flex: 1,
            minWidth: 120,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: renderRatingCell,
            renderEditCell: renderEditRatingCell,
        },
        {
            field: 'catalogs',
            headerName: 'Catalogs',
            flex: 1,
            minWidth: 120,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<Game, string[]>) =>
                renderChipsCell(parseArray(params.value)),
            renderEditCell: (params) => renderEditSelectCell(catalogOptions, params),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 60,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete((params.row as Game).id)}
                    sx={{ mx: 'auto', display: 'block' }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    return (
        <Box sx={{ mx: 'auto', mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    color={showAddGame ? "secondary" : "primary"}
                    onClick={() => setShowAddGame(v => !v)}
                >
                    {showAddGame ? "Close Add Game" : "Add Game"}
                </Button>
            </Box>
            {showAddGame && (
                <Card sx={{ mb: 3, mx: "auto" }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom align="center">
                            Add Game
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <Autocomplete
                                    freeSolo
                                    options={steamAppOptions}
                                    inputValue={form.title || ''}
                                    onInputChange={(_, value) => {
                                        setForm({ ...form, title: value });
                                        setAppSearch(value);
                                    }}
                                    loading={loading}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            name="title"
                                            label="Title"
                                            required
                                            size="small"
                                            fullWidth
                                            sx={{ flex: '2 1 200px', minWidth: 180 }}
                                            disabled={loading}
                                        />
                                    )}
                                />
                                <Select
                                    multiple
                                    name="developers"
                                    value={form.developers || []}
                                    onChange={e => handleSelectChange('developers', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                    renderValue={(selected) => (
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                            {(selected as string[]).map((value, idx) => (
                                                <Chip key={idx} label={value} size="small" sx={{ mb: 0.5 }} />
                                            ))}
                                        </Stack>
                                    )}
                                    size="small"
                                    fullWidth
                                    displayEmpty
                                    sx={{ flex: '2 1 180px', minWidth: 180 }}
                                    disabled={loading}
                                >
                                    {developerOptions.map(option => (
                                        <MenuItem key={option} value={option}>
                                            <Checkbox checked={(form.developers ?? []).indexOf(option) > -1} />
                                            <ListItemText primary={option} />
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Select
                                    multiple
                                    name="publishers"
                                    value={form.publishers || []}
                                    onChange={e => handleSelectChange('publishers', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                    renderValue={(selected) => (
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                            {(selected as string[]).map((value, idx) => (
                                                <Chip key={idx} label={value} size="small" sx={{ mb: 0.5 }} />
                                            ))}
                                        </Stack>
                                    )}
                                    size="small"
                                    fullWidth
                                    displayEmpty
                                    sx={{ flex: '2 1 180px', minWidth: 180 }}
                                    disabled={loading}
                                >
                                    {publisherOptions.map(option => (
                                        <MenuItem key={option} value={option}>
                                            <Checkbox checked={(form.publishers ?? []).indexOf(option) > -1} />
                                            <ListItemText primary={option} />
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Select
                                    multiple
                                    name="platforms"
                                    value={form.platforms || []}
                                    onChange={e => handleSelectChange('platforms', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                    renderValue={(selected) => (
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                            {(selected as string[]).map((value, idx) => (
                                                <Chip key={idx} label={value} size="small" sx={{ mb: 0.5 }} />
                                            ))}
                                        </Stack>
                                    )}
                                    size="small"
                                    fullWidth
                                    displayEmpty
                                    sx={{ flex: '2 1 180px', minWidth: 180 }}
                                    disabled={loading}
                                >
                                    {platformOptions.map(option => (
                                        <MenuItem key={option} value={option}>
                                            <Checkbox checked={(form.platforms ?? []).indexOf(option) > -1} />
                                            <ListItemText primary={option} />
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Select
                                    multiple
                                    name="genres"
                                    value={form.genres || []}
                                    onChange={e => handleSelectChange('genres', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                    renderValue={(selected) => (
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                            {(selected as string[]).map((value, idx) => (
                                                <Chip key={idx} label={value} size="small" sx={{ mb: 0.5 }} />
                                            ))}
                                        </Stack>
                                    )}
                                    size="small"
                                    fullWidth
                                    displayEmpty
                                    sx={{ flex: '2 1 180px', minWidth: 180 }}
                                    disabled={loading}
                                >
                                    {genreOptions.map(option => (
                                        <MenuItem key={option} value={option}>
                                            <Checkbox checked={(form.genres ?? []).indexOf(option) > -1} />
                                            <ListItemText primary={option} />
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Select
                                    multiple
                                    name="tags"
                                    value={form.tags || []}
                                    onChange={e => handleSelectChange('tags', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                    renderValue={(selected) => (
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                            {(selected as string[]).map((value, idx) => (
                                                <Chip key={idx} label={value} size="small" sx={{ mb: 0.5 }} />
                                            ))}
                                        </Stack>
                                    )}
                                    size="small"
                                    fullWidth
                                    displayEmpty
                                    sx={{ flex: '3 1 220px', minWidth: 220 }}
                                    disabled={loading}
                                >
                                    {tagOptions.map(option => (
                                        <MenuItem key={option} value={option}>
                                            <Checkbox checked={(form.tags ?? []).indexOf(option) > -1} />
                                            <ListItemText primary={option} />
                                        </MenuItem>
                                    ))}
                                </Select>
                                <TextField
                                    type="date"
                                    name="releaseDate"
                                    label="Release Date"
                                    value={form.releaseDate ? form.releaseDate.substring(0, 10) : ''}
                                    onChange={handleChange}
                                    required
                                    size="small"
                                    fullWidth
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    sx={{ flex: '1 1 120px', minWidth: 120 }}
                                    disabled={loading}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    sx={{ flex: '0 1 100px', minWidth: 100, alignSelf: 'center', height: 40 }}
                                >
                                    Add
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            )}
            <TextField
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Search ..."
                size="small"
                fullWidth
                sx={{
                    mb: 2,
                    borderRadius: 1,
                    boxShadow: 1,
                    backgroundColor: '#fff',
                    '& .MuiInputBase-root': {
                        backgroundColor: '#fff',
                        borderRadius: 1,
                    },
                    '& .MuiInputBase-input': {
                        color: '#222',
                    },
                }}
            />
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress />
                </Box>
            )}
            <DataGrid
                apiRef={apiRef}
                rows={filteredRows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10, page: 0 }
                    }
                }}
                disableRowSelectionOnClick
                getRowId={row => row.id}
                processRowUpdate={processRowUpdate}
                editMode="cell"
                onCellClick={(params) => {
                    if (params.colDef.editable && apiRef.current) {
                        apiRef.current.startCellEditMode({ id: params.id, field: params.field });
                    }
                }}
            />
        </Box>
    );
}