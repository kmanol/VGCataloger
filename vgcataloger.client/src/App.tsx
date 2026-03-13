import { useEffect, useState } from 'react';
import { BrowserRouter as Router, NavLink, Route, Routes } from 'react-router-dom';
import GameManager from './components/GameManager';
import LovManager from './components/LovManager';
import './App.css';

interface Game {
    id: number;
    title: string;
    developers: string[];
    publishers: string[];
    platforms: string[];
    genres: string[];
    tags: string[];
    releaseDate: string; // ISO string from JSON;
    statuses: string[];
    userRating?: number; // 0-5
    catalogs: string[];
}

function App() {
    const [games, setGames] = useState<Game[]>();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        populateGamesData();
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    async function populateGamesData() {
        const response = await fetch('games');
        if (response.ok) {
            const data = await response.json();
            setGames(data);
        }
    }

    return (
        <Router>
            <div className="app-header">
                <nav className="view-toggle" aria-label="View selector">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `toggle-option${isActive ? ' active' : ''}`}
                    >
                        Games
                    </NavLink>
                    <NavLink
                        to="/manage-lov"
                        className={({ isActive }) => `toggle-option${isActive ? ' active' : ''}`}
                    >
                        Manage
                    </NavLink>
                </nav>
                <button
                    className="theme-toggle"
                    onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                >
                    Theme: {theme === 'light' ? 'Light' : 'Dark'}
                </button>
            </div>
            <Routes>
                <Route
                    path="/"
                    element={
                        games === undefined
                            ? <p><em>Loading...</em></p>
                            : <GameManager games={games} onGamesChange={setGames} />
                    }
                />
                <Route path="/manage-lov" element={<LovManager />} />
            </Routes>
        </Router>
    );
}

export default App;