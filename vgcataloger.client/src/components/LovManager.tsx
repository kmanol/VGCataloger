import { useEffect, useState } from 'react';

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

    useEffect(() => {
        fetchLov();
    }, [type]);

    const fetchLov = async () => {
        const response = await fetch(type);
        if (response.ok) {
            setItems(await response.json());
        }
    };

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

    return (
        <div>
            <h2>Manage {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
            <select value={type} onChange={e => setType(e.target.value as LovType)}>
                <option value="platforms">Platforms</option>
                <option value="genres">Genres</option>
                <option value="tags">Tags</option>
            </select>
            <table className="table table-striped" style={{ marginTop: 16 }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th style={{ width: 120 }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>
                                {editingId === item.id ? (
                                    <input
                                        value={editingName}
                                        onChange={e => setEditingName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleEditSave(item.id);
                                            if (e.key === 'Escape') setEditingId(null);
                                        }}
                                        autoFocus
                                    />
                                ) : (
                                    item.name
                                )}
                            </td>
                            <td>
                                {editingId === item.id ? (
                                    <>
                                        <button onClick={() => handleEditSave(item.id)}>Save</button>
                                        <button onClick={() => setEditingId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(item)}>Edit</button>
                                        <button onClick={() => handleDelete(item.id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td>
                            <input
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder={`Add new ${type.slice(0, -1)}`}
                                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                            />
                        </td>
                        <td>
                            <button onClick={handleAdd}>Add</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
