import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    Box,
    Card,
    CardContent,
    Stack,
    TextField,
    Button,
    Typography,
    IconButton,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Grid
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
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [form, setForm] = useState<Partial<Game>>({});
    const [platformOptions, setPlatformOptions] = useState<string[]>([]);
    const [genreOptions, setGenreOptions] = useState<string[]>([]);
    const [tagOptions, setTagOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddGame, setShowAddGame] = useState(false);

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
        if (editingGame) {
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

    const gridRows = games.map(game => ({
        ...game,
        platforms: Array.isArray(game.platforms) ? game.platforms.join(', ') : '',
        genres: Array.isArray(game.genres) ? game.genres.join(', ') : '',
        tags: Array.isArray(game.tags) ? game.tags.join(', ') : '',
        releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().substring(0, 10) : '',
    }));

    const parseArray = (value: string) =>
        value.split(',').map(s => s.trim()).filter(Boolean);

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
            return {
                ...updatedRow,
                platforms: updatedRow.platforms.join(', '),
                genres: updatedRow.genres.join(', '),
                tags: updatedRow.tags.join(', '),
            };
        }
        return newRow;
    };

    function renderEditSelectCell(options: string[]) {
        return (params: any) => (
            <Select
                multiple
                value={params.value ? parseArray(params.value) : []}
                onChange={e => {
                    const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                    params.api.setEditCellValue({ id: params.id, field: params.field, value: value.join(', ') }, e);
                }}
                renderValue={(selected) => (selected as string[]).join(', ')}
                size="small"
                fullWidth
                sx={{ width: '100%', height: '100%' }}
                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
                {options.map(option => (
                    <MenuItem key={option} value={option}>
                        <Checkbox checked={params.value ? parseArray(params.value).indexOf(option) > -1 : false} />
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
        {
            field: 'title',
            headerName: 'Title',
            flex: 3,
            minWidth: 120,
            editable: true
        },
        {
            field: 'platforms',
            headerName: 'Platforms',
            flex: 1,
            minWidth: 120,
            editable: true,
            renderEditCell: renderEditSelectCell(platformOptions),
        },
        {
            field: 'genres',
            headerName: 'Genres',
            flex: 1,
            minWidth: 120,
            editable: true,
            renderEditCell: renderEditSelectCell(genreOptions),
        },
        {
            field: 'tags',
            headerName: 'Tags',
            flex: 3,
            minWidth: 120,
            editable: true,
            renderEditCell: renderEditSelectCell(tagOptions),
        },
        {
            field: 'releaseDate',
            headerName: 'Release Date',
            flex: 1,
            minWidth: 120,
            editable: true,
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
        <Box sx={{ maxWidth: 1800, minWidth: 900, mx: 'auto', mt: 4 }}>
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
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {editingGame ? 'Edit Game' : 'Add Game'}
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={2}>
                                    <TextField
                                        name="title"
                                        label="Title"
                                        value={form.title || ''}
                                        onChange={handleChange}
                                        required
                                        size="small"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <Select
                                        multiple
                                        name="platforms"
                                        value={form.platforms || []}
                                        onChange={e => handleSelectChange('platforms', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                        renderValue={(selected) => (selected as string[]).join(', ')}
                                        size="small"
                                        fullWidth
                                        displayEmpty
                                    >
                                        {platformOptions.map(option => (
                                            <MenuItem key={option} value={option}>
                                                <Checkbox checked={form.platforms?.indexOf(option) > -1} />
                                                <ListItemText primary={option} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <Select
                                        multiple
                                        name="genres"
                                        value={form.genres || []}
                                        onChange={e => handleSelectChange('genres', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                        renderValue={(selected) => (selected as string[]).join(', ')}
                                        size="small"
                                        fullWidth
                                        displayEmpty
                                    >
                                        {genreOptions.map(option => (
                                            <MenuItem key={option} value={option}>
                                                <Checkbox checked={form.genres?.indexOf(option) > -1} />
                                                <ListItemText primary={option} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Select
                                        multiple
                                        name="tags"
                                        value={form.tags || []}
                                        onChange={e => handleSelectChange('tags', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                        renderValue={(selected) => (selected as string[]).join(', ')}
                                        size="small"
                                        fullWidth
                                        displayEmpty
                                    >
                                        {tagOptions.map(option => (
                                            <MenuItem key={option} value={option}>
                                                <Checkbox checked={form.tags?.indexOf(option) > -1} />
                                                <ListItemText primary={option} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={12} sm={2}>
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
                                    />
                                </Grid>
                                <Grid item xs={12} sm={1} sx={{ display: 'flex', gap: 1 }}>
                                    <Button type="submit" variant="contained" color="primary" fullWidth>
                                        {editingGame ? 'Update' : 'Add'}
                                    </Button>
                                    {editingGame && (
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => {
                                                setEditingGame(null);
                                                setForm({});
                                            }}
                                            fullWidth
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>
            )}
            <DataGrid
                rows={gridRows}
                columns={columns}
                paginationModel={{ pageSize: 10, page: 0 }}
                pageSizeOptions={[10]}
                disableRowSelectionOnClick
                getRowId={row => row.id}
                autoHeight
                processRowUpdate={processRowUpdate}
                editMode="cell"
            />
        </Box>
    );
}