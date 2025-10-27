// ============================================
// UTILIDAD PARA FORMATEAR FECHAS
// ============================================

/**
 * Formatea una fecha para mostrarla de forma amigable
 * 
 * @param dateString - Fecha en formato ISO string o null
 * @returns String formateado según la antigüedad:
 *   - "Hoy, 14:32" si es hoy
 *   - "Ayer, 18:45" si fue ayer
 *   - "27/10/2025" para fechas más antiguas
 *   - "Nunca" si es null
 * 
 * @example
 * formatDate('2025-10-27T14:30:00Z') // "Hoy, 14:30"
 * formatDate('2025-10-26T18:45:00Z') // "Ayer, 18:45"
 * formatDate('2025-10-20T10:00:00Z') // "20/10/2025"
 * formatDate(null) // "Nunca"
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Nunca';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Verificar que la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Si es hoy
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `Hoy, ${hours}:${minutes}`;
    }
    
    // Si fue ayer
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.getDate() === yesterday.getDate() && 
        date.getMonth() === yesterday.getMonth() && 
        date.getFullYear() === yesterday.getFullYear()) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `Ayer, ${hours}:${minutes}`;
    }
    
    // Para fechas más antiguas: formato DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha completa con hora
 * 
 * @param dateString - Fecha en formato ISO string
 * @returns String con formato "DD/MM/YYYY HH:MM"
 */
export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error al formatear fecha y hora:', error);
    return 'Fecha inválida';
  }
};
