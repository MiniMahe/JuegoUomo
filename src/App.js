import React, { useState, useEffect } from 'react';
import GameService from './services/gameService';
import GameSetup from './components/GameSetup';
import GameAdminPanel from './components/GameAdminPanel';
import CharacterSelection from './components/CharacterSelection';
import UserDashboard from './components/UserDashboard';
import SessionService from './services/sessionService';
import EnvironmentChecker from './components/EnvironmentChecker';
import JsonBinSetup from './components/JsonBinSetup';
import './App.css';

function App() {
  const [currentGame, setCurrentGame] = useState(null);
  const [currentView, setCurrentView] = useState('welcome');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showJsonBinSetup, setShowJsonBinSetup] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const game = await GameService.getGame();
      if (game) {
        setCurrentGame(game);
      }

      const session = await SessionService.getCurrentSession();
      if (session) {
        setCurrentUser(session);
        setCurrentView('user');
        setIsAdmin(false);
      } else {
        setCurrentUser(null);
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameCreated = async (game) => {
    setCurrentGame(game);
    setCurrentView('admin');
    setIsAdmin(true);
  };

  const handleGameUpdated = (game) => {
    setCurrentGame(game);
  };

  const handleCharacterSelected = async (participant) => {
    setCurrentUser(participant);
    setCurrentView('user');
    setIsAdmin(false);
  };

  const handleUserLogout = async () => {
    try {
      await SessionService.logout();
      setCurrentUser(null);
      setCurrentView('welcome');
      setIsAdmin(true);
    } catch (error) {
      console.error('Error during logout:', error);
      setCurrentUser(null);
      setCurrentView('welcome');
      setIsAdmin(true);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <h1>🎮 Cargando Juego...</h1>
          <div className="loading-spinner">⏳</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <EnvironmentChecker />

      <header className="App-header">
        <h1>🎮 SISTEMA DE JUEGO DE ASIGNACIONES</h1>
        <nav className="main-nav">
          {!currentGame ? (
            <>
              <button
                onClick={() => setCurrentView('setup')}
                className={currentView === 'setup' ? 'active' : ''}
              >
                🎮 CREAR PARTIDA
              </button>
              <button
                onClick={() => setShowJsonBinSetup(!showJsonBinSetup)}
                className="config-btn"
              >
                ⚙️ CONFIGURAR
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('user')}
                className={currentView === 'user' ? 'active' : ''}
              >
                👤 {currentUser ? 'MI PERSONAJE' : 'UNIRSE'}
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={currentView === 'admin' ? 'active' : ''}
                disabled={!isAdmin}
              >
                ⚙️ {isAdmin ? 'ADMINISTRAR' : '🔒 BLOQUEADO'}
              </button>
              <button
                onClick={() => setShowJsonBinSetup(!showJsonBinSetup)}
                className="config-btn"
              >
                🔧 CONFIG
              </button>
            </>
          )}
        </nav>

        {currentUser && (
          <div className="user-indicator">
            <span>👤 Conectado como: <strong>{currentUser.userName}</strong></span>
            <button onClick={handleUserLogout} className="header-logout-btn">
              🚪 Salir
            </button>
          </div>
        )}
      </header>

      <main>
        {showJsonBinSetup && (
          <JsonBinSetup onClose={() => setShowJsonBinSetup(false)} />
        )}

        {currentView === 'welcome' && (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h2>BIENVENIDO AL JUEGO DE ASIGNACIONES</h2>
              <div className="welcome-options">
                {!currentGame ? (
                  <div className="option-card">
                    <h3>🎮 COMENZAR</h3>
                    <p>Crea una nueva partida o únete a una existente</p>
                    <button onClick={() => setCurrentView('setup')}>
                      CREAR PARTIDA
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="option-card">
                      <h3>👤 JUGADOR</h3>
                      <p>Únete a la partida actual</p>
                      <button onClick={() => setCurrentView('user')}>
                        UNIRME AL JUEGO
                      </button>
                    </div>
                    <div className="option-card">
                      <h3>🎮 ADMINISTRADOR</h3>
                      <p>Gestiona la partida en curso</p>
                      <button onClick={() => setCurrentView('admin')}>
                        ADMINISTRAR
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'setup' && (
          <GameSetup onGameCreated={handleGameCreated} />
        )}

        {currentView === 'admin' && currentGame && (
          <GameAdminPanel
            game={currentGame}
            onGameUpdated={handleGameUpdated}
          />
        )}

        {currentView === 'user' && currentGame && (
          <>
            {!currentUser ? (
              <CharacterSelection onCharacterSelected={handleCharacterSelected} />
            ) : (
              <UserDashboard
                user={currentUser}
                game={currentGame}
                onLogout={handleUserLogout}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;