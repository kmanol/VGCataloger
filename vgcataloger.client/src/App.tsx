import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import GameManager from './components/GameManager';
import LovManager from './components/LovManager';
import './App.css';

interface Game {
    id: number;
    title: string;
    platforms: string[];
    genres: string[];
    tags: string[];
    releaseDate: string; // ISO string from JSON;
    userRating: number; // 0-5
}

function App() {
    const [games, setGames] = useState<Game[]>();

    useEffect(() => {
        populateGamesData();
    }, []);

    async function populateGamesData() {
        const response = await fetch('games');
        if (response.ok) {
            const data = await response.json();
            setGames(data);
        }
    }

    return (
        <Router>
            <nav>
                <Link to="/">Games</Link> | <Link to="/manage-lov">Manage</Link>
            </nav>
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