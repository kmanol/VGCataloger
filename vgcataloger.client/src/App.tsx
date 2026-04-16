import { useEffect, useState } from 'react';
import { BrowserRouter as Router, NavLink, Route, Routes } from 'react-router-dom';
import GameManager from './components/GameManager';
import LovManager from './components/LovManager';
import './App.css';

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

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
                <Route path="/" element={<GameManager />} />
                <Route path="/manage-lov" element={<LovManager />} />
            </Routes>
        </Router>
    );
}

export default App;