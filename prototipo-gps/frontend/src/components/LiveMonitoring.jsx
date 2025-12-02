/**
 * Componente de Monitoreo en Vivo
 * Muestra información del chofer y eventos de somnolencia en tiempo real
 */
import React from 'react';

// Configuración de colores por severidad
const severityConfig = {
  CRITICAL: { color: '#ef4444', bg: '#fef2f2', icon: '🔴', label: 'Crítico' },
  HIGH: { color: '#f97316', bg: '#fff7ed', icon: '🟠', label: 'Alto' },
  MEDIUM: { color: '#eab308', bg: '#fefce8', icon: '🟡', label: 'Medio' },
  LOW: { color: '#22c55e', bg: '#f0fdf4', icon: '🟢', label: 'Bajo' }
};

// Nombres amigables para tipos de eventos
const eventTypeNames = {
  microsueno: 'Microsueño',
  cabeceo: 'Cabeceo',
  bostezo: 'Bostezo',
  parpadeo_ojos: 'Parpadeo Excesivo',
  frotamiento_ojos: 'Frotamiento de Ojos'
};

// Iconos por tipo de evento
const eventTypeIcons = {
  microsueno: '😴',
  cabeceo: '🙇',
  bostezo: '🥱',
  parpadeo_ojos: '👁️',
  frotamiento_ojos: '🤦'
};

function LiveMonitoring({ liveData, isSimulating }) {
  if (!liveData) {
    return (
      <div className="live-monitoring-empty">
        <p>Selecciona un viaje y presiona "Iniciar Simulación" para ver el monitoreo en vivo</p>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="live-monitoring">
      {/* Información del Chofer */}
      <div className="driver-card">
        <div className="driver-avatar">
          <span>{liveData.driver_name?.charAt(0) || 'C'}</span>
        </div>
        <div className="driver-info">
          <h3>{liveData.driver_name || 'Conductor'}</h3>
          <span className="driver-type">Individual</span>
        </div>
      </div>

      {/* Información Personal */}
      <div className="info-section">
        <h4>👤 Información Personal</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">DNI/CI:</span>
            <span className="value">12345678</span>
          </div>
          <div className="info-item">
            <span className="label">Teléfono:</span>
            <span className="value">+591 70123456</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">conductor@email.com</span>
          </div>
        </div>
      </div>

      {/* Licencia de Conducir */}
      <div className="info-section">
        <h4>🪪 Licencia de Conducir</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Número:</span>
            <span className="value">LIC-123456</span>
          </div>
          <div className="info-item">
            <span className="label">Categoría:</span>
            <span className="value">Categoría C</span>
          </div>
          <div className="info-item">
            <span className="label">Vigencia:</span>
            <span className="value">Hasta 2026</span>
          </div>
        </div>
      </div>

      {/* Estadísticas de Eventos */}
      <div className="stats-section">
        <h4>📊 Estadísticas del Viaje</h4>
        <div className="stats-grid">
          <div className="stat-item critical">
            <span className="stat-value">{liveData.critical_events || 0}</span>
            <span className="stat-label">Críticos</span>
          </div>
          <div className="stat-item high">
            <span className="stat-value">{liveData.high_events || 0}</span>
            <span className="stat-label">Altos</span>
          </div>
          <div className="stat-item medium">
            <span className="stat-value">{liveData.medium_events || 0}</span>
            <span className="stat-label">Medios</span>
          </div>
          <div className="stat-item total">
            <span className="stat-value">{liveData.total_events || 0}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Eventos en Tiempo Real */}
      <div className="events-section">
        <h4>
          ⚡ Eventos en Tiempo Real
          {isSimulating && <span className="live-badge">EN VIVO</span>}
        </h4>
        <div className="events-list">
          {liveData.recent_events && liveData.recent_events.length > 0 ? (
            liveData.recent_events.map((event, index) => {
              const severity = severityConfig[event.nivel_severidad] || severityConfig.LOW;
              return (
                <div 
                  key={event.id || index} 
                  className="event-item"
                  style={{ borderLeftColor: severity.color }}
                >
                  <div className="event-icon">
                    {eventTypeIcons[event.tipo_evento] || '⚠️'}
                  </div>
                  <div className="event-content">
                    <div className="event-header">
                      <span className="event-type">
                        {eventTypeNames[event.tipo_evento] || event.tipo_evento}
                      </span>
                      <span 
                        className="event-severity"
                        style={{ 
                          backgroundColor: severity.bg, 
                          color: severity.color 
                        }}
                      >
                        {severity.label}
                      </span>
                    </div>
                    <div className="event-details">
                      <span>⏱️ {formatDuration(event.duracion_segundos)}</span>
                      <span>🚗 {event.velocidad_kmh?.toFixed(0) || 0} km/h</span>
                    </div>
                    <div className="event-time">
                      {formatTime(event.timestamp_evento)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-events">
              <span>✅</span>
              <p>No hay eventos de somnolencia detectados</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .live-monitoring {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .live-monitoring-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 150px;
          color: #64748b;
          text-align: center;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .driver-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          color: white;
        }

        .driver-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: bold;
          border: 2px solid rgba(255,255,255,0.5);
          flex-shrink: 0;
        }

        .driver-info h3 {
          margin: 0;
          font-size: 1rem;
          line-height: 1.2;
        }

        .driver-type {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .info-section {
          background: white;
          border-radius: 8px;
          padding: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .info-section h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.8rem;
          color: #667eea;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          padding: 0.15rem 0;
        }

        .info-item .label {
          color: #64748b;
        }

        .info-item .value {
          font-weight: 500;
          color: #1e293b;
        }

        .stats-section {
          background: white;
          border-radius: 8px;
          padding: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stats-section h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.8rem;
          color: #667eea;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
        }

        .stat-item {
          text-align: center;
          padding: 0.4rem 0.25rem;
          border-radius: 6px;
        }

        .stat-item.critical { background: #fef2f2; }
        .stat-item.high { background: #fff7ed; }
        .stat-item.medium { background: #fefce8; }
        .stat-item.total { background: #f0f9ff; }

        .stat-item .stat-value {
          display: block;
          font-size: 1.1rem;
          font-weight: bold;
          line-height: 1.2;
        }

        .stat-item.critical .stat-value { color: #ef4444; }
        .stat-item.high .stat-value { color: #f97316; }
        .stat-item.medium .stat-value { color: #eab308; }
        .stat-item.total .stat-value { color: #3b82f6; }

        .stat-item .stat-label {
          font-size: 0.65rem;
          color: #64748b;
        }

        .events-section {
          background: white;
          border-radius: 8px;
          padding: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          min-height: 120px;
          max-height: 250px;
          display: flex;
          flex-direction: column;
        }

        .events-section h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.8rem;
          color: #667eea;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-shrink: 0;
        }

        .live-badge {
          background: #ef4444;
          color: white;
          font-size: 0.6rem;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .events-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .event-item {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 3px solid #64748b;
        }

        .event-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .event-content {
          flex: 1;
          min-width: 0;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.15rem;
          gap: 0.5rem;
        }

        .event-type {
          font-weight: 600;
          font-size: 0.75rem;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .event-severity {
          font-size: 0.6rem;
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .event-details {
          display: flex;
          gap: 0.75rem;
          font-size: 0.7rem;
          color: #64748b;
        }

        .event-time {
          font-size: 0.65rem;
          color: #94a3b8;
          margin-top: 0.15rem;
        }

        .no-events {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          color: #64748b;
        }

        .no-events span {
          font-size: 1.5rem;
          margin-bottom: 0.35rem;
        }

        .no-events p {
          font-size: 0.8rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default LiveMonitoring;
