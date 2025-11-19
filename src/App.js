import React, { useState, useEffect } from 'react';
import UserRegistration from './components/UserRegistration';
import AdminPanel from './components/AdminPanel';
import ResultsView from './components/ResultsView';
import './App.css';

function App() {
  const [participants, setParticipants] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeView, setActiveView] = useState('user');

  // Cargar datos del localStorage
  useEffect(() => {
    const savedParticipants = localStorage.getItem('participants');
    const savedItems = localStorage.getItem('items');
    const savedLocations = localStorage.getItem('locations');
    const savedAssignments = localStorage.getItem('assignments');

    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedLocations) setLocations(JSON.parse(savedLocations));
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  // Actualizar participantes cuando se hacen asignaciones
  useEffect(() => {
    const updatedParticipants = participants.map(participant => {
      const assignment = assignments.find(a => a.name === participant.name);
      return {
        ...participant,
        assigned: assignment ? assignment.assigned : false
      };
    });
    setParticipants(updatedParticipants);
  }, [assignments]);

  const handleParticipantAdd = (newParticipant) => {
    setParticipants(prev => [...prev, newParticipant]);
  };

  const handleParticipantsUpdate = (updatedParticipants) => {
    setParticipants(updatedParticipants);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎮 Uomo Ganga</h1>
        <nav className="main-nav">
          <button
            onClick={() => setActiveView('user')}
            className={activeView === 'user' ? 'active' : ''}
          >
            👤 Vista Usuario
          </button>
          <button
            onClick={() => setActiveView('admin')}
            className={activeView === 'admin' ? 'active' : ''}
          >
            ⚙️ Administrador
          </button>
          <button
            onClick={() => setActiveView('results')}
            className={activeView === 'results' ? 'active' : ''}
          >
            📊 Resultados
          </button>
        </nav>
      </header>

      <main>
        {activeView === 'user' && (
          <UserRegistration
            participants={participants}
            onParticipantAdd={handleParticipantAdd}
            assignments={assignments}
          />
        )}

        {activeView === 'admin' && (
          <AdminPanel
            participants={participants}
            onParticipantsUpdate={handleParticipantsUpdate}
            items={items}
            onItemsUpdate={setItems}
            locations={locations}
            onLocationsUpdate={setLocations}
            assignments={assignments}
            onAssignmentsUpdate={setAssignments}
          />
        )}

        {activeView === 'results' && (
          <ResultsView
            assignments={assignments}
            participants={participants}
            items={items}
            locations={locations}
          />
        )}
      </main>
    </div>
  );
}

export default App;