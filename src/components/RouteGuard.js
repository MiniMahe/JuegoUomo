import React, { useState, useEffect } from 'react';
import GameService from '../services/gameService';
import SessionService from '../services/sessionService';

const RouteGuard = ({ type, children }) => {
    const [canAccess, setCanAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAccess();
    }, [type]);

    const checkAccess = async () => {
        try {
            if (type === 'admin') {
                // Para admin: verificar que NO haya sesión de usuario activa
                const currentSession = await SessionService.getCurrentSession();
                setCanAccess(!currentSession);
            } else if (type === 'user') {
                // Para usuario: verificar que HAYA sesión activa Y juego listo
                const currentSession = await SessionService.getCurrentSession();
                const canJoin = GameService.canUserJoin();
                setCanAccess(!!currentSession && canJoin);
            } else {
                setCanAccess(true);
            }
        } catch (error) {
            console.error('Error checking access:', error);
            setCanAccess(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="route-guard-loading">
                <div className="loading-spinner">🔒</div>
                <p>Verificando acceso...</p>
            </div>
        );
    }

    if (!canAccess) {
        if (type === 'admin') {
            return (
                <div className="access-denied">
                    <div className="denied-content">
                        <h2>🚫 ACCESO DENEGADO</h2>
                        <p>No puedes acceder al panel de administrador mientras tengas una sesión de usuario activa.</p>
                        <div className="denied-actions">
                            <button onClick={() => window.location.reload()}>Volver al Inicio</button>
                            <button onClick={async () => {
                                await SessionService.logout();
                                window.location.reload();
                            }}>Cerrar Sesión de Usuario</button>
                        </div>
                    </div>
                </div>
            );
        } else if (type === 'user') {
            return (
                <div className="access-denied">
                    <div className="denied-content">
                        <h2>🔒 SESIÓN NO VÁLIDA</h2>
                        <p>No tienes una sesión activa o el juego no está disponible.</p>
                        <div className="denied-actions">
                            <button onClick={() => window.location.reload()}>Volver al Inicio</button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return children;
};

export default RouteGuard;