import React, { useState, useEffect } from 'react';
import GameService from './services/gameService';
import GameSetup from './components/GameSetup';
import GameAdminPanel from './components/GameAdminPanel';
import CharacterSelection from './components/CharacterSelection';
import UserDashboard from './components/UserDashboard';
import SessionService from './services/sessionService';
import './App.css';

function App() {
  const [currentGame, setCurrentGame] = useState(null);
  const [currentView, setCurrentView] = useState('welcome');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();

    // Limpiar sesiones expiradas al cargar
    SessionService.cleanupExpiredSessions();
  }, []);

  const initializeApp = async () => {
    try {
      // Cargar juego existente
      const game = GameService.getGame();
      if (game) {
        setCurrentGame(game);
      }

      // Verificar sesión de usuario (esto usa sessionStorage - única por pestaña)
      const session = await SessionService.getCurrentSession();
      console.log('Sesión actual:', session);

      if (session) {
        setCurrentUser(session);
        setCurrentView('user');
        setIsAdmin(false);

        // Verificar que el juego todavía existe y está activo
        if (!game || !GameService.canUserJoin()) {
          // Si el juego no está disponible, cerrar sesión
          await SessionService.logout();
          setCurrentUser(null);
          setCurrentView('welcome');
          setIsAdmin(true);
          alert('El juego ya no está disponible. Tu sesión ha sido cerrada.');
        }
      } else {
        // No hay sesión activa en ESTA pestaña
        setCurrentUser(null);
        setIsAdmin(true);
      }

    } catch (error) {
      console.error('Error initializing app:', error);
      // En caso de error, permitir acceso admin por defecto
      setIsAdmin(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGameCreated = (game) => {
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
      // Forzar logout incluso si hay error
      setCurrentUser(null);
      setCurrentView('welcome');
      setIsAdmin(true);
    }
  };

  const handleAdminAccess = () => {
    if (currentUser) {
      alert('No puedes acceder al panel de administrador mientras tengas una sesión de usuario activa. Cierra sesión primero.');
      return;
    }
    setCurrentView('admin');
  };

  const handleUserAccess = () => {
    if (!currentGame) {
      alert('No hay ninguna partida activa en este momento.');
      return;
    }

    if (!GameService.canUserJoin()) {
      alert('El juego no está listo para que se unan jugadores.');
      return;
    }

    setCurrentView('user');
  };

  // Función para forzar cierre de todas las sesiones (solo admin)
  const handleForceLogoutAll = async () => {
    if (window.confirm('¿Forzar desconexión de todos los jugadores? Esto los sacará del juego pero mantendrá la partida.')) {
      try {
        await SessionService.forceLogoutAllUsers();
        alert('Todos los jugadores han sido desconectados. Se darán cuenta cuando intenten actualizar la página.');
        // Recargar para actualizar el estado
        window.location.reload();
      } catch (error) {
        alert('Error al desconectar jugadores: ' + error.message);
      }
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
      <header className="App-header">
        <h1>🎮 SISTEMA DE JUEGO DE ASIGNACIONES</h1>
        <nav className="main-nav">
          {!currentGame ? (
            <button
              onClick={() => setCurrentView('setup')}
              className={currentView === 'setup' ? 'active' : ''}
            >
              🎮 CREAR PARTIDA
            </button>
          ) : (
            <>
              <button
                onClick={handleUserAccess}
                className={currentView === 'user' ? 'active' : ''}
              >
                👤 {currentUser ? 'MI PERSONAJE' : 'UNIRSE'}
              </button>
              <button
                onClick={handleAdminAccess}
                className={currentView === 'admin' ? 'active' : ''}
                disabled={!isAdmin}
              >
                ⚙️ {isAdmin ? 'ADMINISTRAR' : '🔒 BLOQUEADO'}
              </button>
            </>
          )}
        </nav>

        {currentUser && (
          <div className="user-indicator">
            <div className="user-info">
              👤 Conectado como: <strong>{currentUser.userName}</strong>
              ({currentUser.playerName})
              <span className="session-type">📱 Sesión individual</span>
            </div>
            <button onClick={handleUserLogout} className="header-logout-btn">
              🚪 Salir
            </button>
          </div>
        )}

        {isAdmin && currentGame && (
          <div className="admin-controls-header">
            <button onClick={handleForceLogoutAll} className="force-logout-btn">
              🚫 Desconectar a todos
            </button>
          </div>
        )}
      </header>

      <main>
        {currentView === 'welcome' && (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h2>BIENVENIDO AL JUEGO DE ASIGNACIONES</h2>
              <div className="session-info-banner">
                <p>💡 <strong>Nueva función:</strong> Cada pestaña/navegador tiene su propia sesión independiente</p>
              </div>
              <div className="welcome-options">
                {!currentGame ? (
                  <>
                    <div className="option-card">
                      <h3>🎮 ADMINISTRADOR</h3>
                      <p>Crea y gestiona una nueva partida</p>
                      <button onClick={() => setCurrentView('setup')}>
                        CREAR PARTIDA
                      </button>
                    </div>
                    <div className="option-card disabled">
                      <h3>👤 JUGADOR</h3>
                      <p>Únete a una partida existente</p>
                      <button disabled>ESPERANDO PARTIDA...</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="option-card">
                      <h3>👤 JUGADOR</h3>
                      <p>Únete a la partida actual</p>
                      <p className="feature-info">📱 Sesión independiente por pestaña</p>
                      <button onClick={handleUserAccess}>
                        UNIRME AL JUEGO
                      </button>
                    </div>
                    <div className="option-card">
                      <h3>🎮 ADMINISTRADOR</h3>
                      <p>Gestiona la partida en curso</p>
                      <button onClick={handleAdminAccess} disabled={!isAdmin}>
                        {isAdmin ? 'ADMINISTRAR' : '🔒 BLOQUEADO'}
                      </button>
                      {!isAdmin && (
                        <p className="admin-locked">Tienes una sesión de usuario activa en esta pestaña</p>
                      )}
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
            onForceLogoutAll={handleForceLogoutAll}
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