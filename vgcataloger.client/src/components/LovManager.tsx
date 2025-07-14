import { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Select,
    MenuItem,
    TextField,
    Button,
    IconButton,
    Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

type LovType = 'platforms' | 'genres' | 'tags';

interface LovItem {
    id: number;
    name: string;
}

export default function LovManager() {
    const [type, setType] = useState<LovType>('platforms');
    const [items, setItems] = useState<LovItem[]>([]);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [search, setSearch] = useState('');

    const fetchLov = useCallback(async () => {
        const response = await fetch(type);
        if (response.ok) {
            setItems(await response.json());
        }
    }, [type]);

    useEffect(() => {
        fetchLov();
    }, [fetchLov]);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        const response = await fetch(type, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName }),
        });
        if (response.ok) {
            setNewName('');
            fetchLov();
        }
    };

    const handleDelete = async (id: number) => {
        const response = await fetch(`${type}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchLov();
        }
    };

    const handleEdit = (item: LovItem) => {
        setEditingId(item.id);
        setEditingName(item.name);
    };

    const handleEditSave = async (id: number) => {
        const response = await fetch(`${type}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editingName }),
        });
        if (response.ok) {
            setEditingId(null);
            setEditingName('');
            fetchLov();
        }
    };

    // Filter items by search
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom align="center">
                        Manage {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Typography>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <Select
                            value={type}
                            onChange={e => setType(e.target.value as LovType)}
                            size="small"
                            sx={{ minWidth: 160 }}
                        >
                            <MenuItem value="platforms">Platforms</MenuItem>
                            <MenuItem value="genres">Genres</MenuItem>
                            <MenuItem value="tags">Tags</MenuItem>
                        </Select>
                    </Box>
                    <TextField
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        placeholder="Search..."
                        size="small"
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
                        <Stack spacing={1}>
                            {filteredItems.map(item => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderBottom: '1px solid #eee',
                                        py: 1,
                                    }}
                                >
                                    {editingId === item.id ? (
                                        <>
                                            <TextField
                                                value={editingName}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                                                size="small"
                                                sx={{ flex: 1, mr: 1 }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleEditSave(item.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                autoFocus
                                            />
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEditSave(item.id)}
                                            >
                                                <SaveIcon />
                                            </IconButton>
                                            <IconButton
                                                color="inherit"
                                                size="small"
                                                onClick={() => setEditingId(null)}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
                                            <Typography sx={{ flex: 1 }}>{item.name}</Typography>
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
                        <TextField
                            value={newName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                            placeholder={`Add new ${type.slice(0, -1)}`}
                            size="small"
                            sx={{ flex: 1, mr: 1 }}
                            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={handleAdd}
                            sx={{ minWidth: 80, height: 36 }}
                        >
                            Add
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
