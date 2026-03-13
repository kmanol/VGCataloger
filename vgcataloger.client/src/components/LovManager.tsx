import { useEffect, useState, useCallback } from 'react';
import './LovManager.css';

type LovType = 'catalogs' | 'platforms' | 'genres' | 'tags' | 'developers' | 'publishers' | 'statuses';

interface LovItem {
    id: number;
    name: string;
}

export default function LovManager() {
    const [type, setType] = useState<LovType>('catalogs');
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
        <div className="lov-manager-container">
            <div className="lov-card">
                <h3>Manage {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value as LovType)}
                        className="lov-select"
                    >
                        <option value="catalogs">Catalogs</option>
                        <option value="platforms">Platforms</option>
                        <option value="genres">Genres</option>
                        <option value="tags">Tags</option>
                        <option value="developers">Developers</option>
                        <option value="publishers">Publishers</option>
                        <option value="statuses">Statuses</option>
                    </select>
                </div>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="lov-search"
                />
                <div className="lov-list">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                className="lov-item"
                            >
                                {editingId === item.id ? (
                                    <>
                                        <input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="lov-input"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleEditSave(item.id);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            className="lov-button save"
                                            onClick={() => handleEditSave(item.id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="lov-button cancel"
                                            onClick={() => setEditingId(null)}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span>{item.name}</span>
                                        <button
                                            className="lov-button edit"
                                            onClick={() => handleEdit(item)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="lov-button delete"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lov-add-row">
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={`Add new ${type.slice(0, -1)}`}
                        className="lov-add-input"
                        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                    />
                    <button
                        className="lov-button"
                        onClick={handleAdd}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
