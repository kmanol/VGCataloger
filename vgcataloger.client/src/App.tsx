import { useEffect, useState } from 'react';
import './App.css';

interface Game {
    id: number;
    title: string;
    platform: string;
    genre: string;
    tags: string[];
    releaseDate: string; // ISO string from JSON
}

function App() {
    const [games, setGames] = useState<Game[]>();

    useEffect(() => {
        populateGamesData();
    }, []);

    const contents = games === undefined
        ? <p><em>Loading...</em></p>
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Release Date</th>
                </tr>
            </thead>
            <tbody>
                {games.map(game =>
                    <tr key={game.id}>
                        <td>{game.title}</td>
                        <td>{new Date(game.releaseDate).toLocaleDateString()}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    return (
        <div>
            <h1 id="tableLabel">Video Game Library</h1>
            <p>This component displays your video game collection from the server.</p>
            {contents}
        </div>
    );

    async function populateGamesData() {
        const response = await fetch('games');
        if (response.ok) {
            const data = await response.json();
            setGames(data);
        }
    }
}

export default App;