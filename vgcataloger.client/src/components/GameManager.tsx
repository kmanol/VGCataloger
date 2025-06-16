import { useState, useEffect } from 'react';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
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
    Stack
} from '@mui/material';

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
    const [form, setForm] = useState<Partial<Game>>({});
    const [platformOptions, setPlatformOptions] = useState<string[]>([]);
    const [genreOptions, setGenreOptions] = useState<string[]>([]);
    const [tagOptions, setTagOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddGame, setShowAddGame] = useState(false);

    const apiRef = useGridApiRef();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('/platforms').then(r => r.json()),
            fetch('/genres').then(r => r.json()),
            fetch('/tags').then(r => r.json())
        ]).then(([platforms, genres, tags]) => {
            setPlatformOptions(platforms.map((p: any) => p.name ?? p));
            setGenreOptions(genres.map((g: any) => g.name ?? g));
            setTagOptions(tags.map((t: any) => t.name ?? t));
        }).finally(() => setLoading(false));
    }, []);

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
        const response = await fetch('games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
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
        platforms: Array.isArray(game.platforms) ? game.platforms : [],
        genres: Array.isArray(game.genres) ? game.genres : [],
        tags: Array.isArray(game.tags) ? game.tags : [],
        releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().substring(0, 10) : '',
    }));

    const parseArray = (value: string | string[]) =>
        Array.isArray(value)
            ? value
            : value.split(',').map(s => s.trim()).filter(Boolean);

    const processRowUpdate = async (newRow: any) => {
        const updatedRow: Game = {
            ...newRow,
            platforms: parseArray(newRow.platforms),
            genres: parseArray(newRow.genres),
            tags: parseArray(newRow.tags),
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

    // Custom edit cell for Select with checkboxes and chips
    function renderEditSelectCell(options: string[]) {
        return (params: any) => (
            <Select
                multiple
                value={parseArray(params.value)}
                onChange={e => {
                    const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                    params.api.setEditCellValue({ id: params.id, field: params.field, value }, e);
                }}
                renderValue={(selected) => (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {(selected as string[]).map((value, idx) => (
                            <Chip key={idx} label={value} size="small" sx={{ mb: 0.5 }} />
                        ))}
                    </Stack>
                )}
                size="small"
                fullWidth
                sx={{ width: '100%', height: '100%' }}
                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
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

    function renderEditDateCell(params: any) {
        return (
            <TextField
                type="date"
                value={params.value ? params.value.substring(0, 10) : ''}
                onChange={e => {
                    params.api.setEditCellValue({
                        id: params.id,
                        field: params.field,
                        value: e.target.value
                    }, e);
                }}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ width: '100%', height: '100%' }}
                InputProps={{
                    sx: { height: '100%', alignItems: 'center' }
                }}
            />
        );
    }

    const columns = [
        { field: 'title', headerName: 'Title', flex: 2, minWidth: 180, editable: true },
        {
            field: 'platforms',
            headerName: 'Platforms',
            flex: 2,
            minWidth: 180,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: any) => renderChipsCell(parseArray(params.value)),
            renderEditCell: renderEditSelectCell(platformOptions),
        },
        {
            field: 'genres',
            headerName: 'Genres',
            flex: 2,
            minWidth: 180,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: any) => renderChipsCell(parseArray(params.value)),
            renderEditCell: renderEditSelectCell(genreOptions),
        },
        {
            field: 'tags',
            headerName: 'Tags',
            flex: 3,
            minWidth: 220,
            editable: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: any) => renderChipsCell(parseArray(params.value)),
            renderEditCell: renderEditSelectCell(tagOptions),
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
            field: 'actions',
            headerName: 'Actions',
            minWidth: 60,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: any) => (
                <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(params.row.id)}
                    sx={{ mx: 'auto', display: 'block' }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    return (
        <Box sx={{ maxWidth: 1600, minWidth: 1100, mx: 'auto', mt: 4 }}>
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
                <Card sx={{ mb: 3, maxWidth: 1200, mx: "auto" }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom align="center">
                            Add Game
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <TextField
                                    name="title"
                                    label="Title"
                                    value={form.title || ''}
                                    onChange={handleChange}
                                    required
                                    size="small"
                                    fullWidth
                                    sx={{ flex: '2 1 200px', minWidth: 180 }}
                                />
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
                                >
                                    {platformOptions.map(option => (
                                        <MenuItem key={option} value={option}>
                                            <Checkbox checked={form.platforms?.indexOf(option) > -1} />
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
                                >
                                    {genreOptions.map(option => (
                                        <MenuItem key={option} value={option}>
                                            <Checkbox checked={form.genres?.indexOf(option) > -1} />
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
                                >
                                    {tagOptions.map(option => (
                                        <MenuItem key={option} value={option}>
                                            <Checkbox checked={form.tags?.indexOf(option) > -1} />
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
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ flex: '1 1 120px', minWidth: 120 }}
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
            <DataGrid
                apiRef={apiRef}
                rows={gridRows}
                columns={columns}
                paginationModel={{ pageSize: 10, page: 0 }}
                pageSizeOptions={[10]}
                disableRowSelectionOnClick
                getRowId={row => row.id}
                autoHeight
                processRowUpdate={processRowUpdate}
                editMode="cell"
                onCellClick={(params, event) => {
                    if (params.colDef.editable) {
                        apiRef.current.startCellEditMode({ id: params.id, field: params.field });
                    }
                }}
            />
        </Box>
    );
}