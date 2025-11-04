// ============================================
// HOOK PERSONALIZADO PARA FORMULARIO DE VIAJE
// Maneja estado, validaciones, carga dinámica de choferes y envío
// Soporta tanto creación como edición
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { viajesApi } from '../services/viajesApi';
import type { 
  ViajeFormData, 
  ViajeFormErrors, 
  ViajeCreateData, 
  ViajeUpdateData,
  ChoferDisponible,
  CategoriaLicencia
} from '../types';
import { HORAS_VALIDAS, MINUTOS_VALIDOS } from '../constants/departamentos';

/**
 * Props del hook
 */
interface UseViajeFormProps {
  viajeId?: number; // Si existe, modo edición
}

/**
 * Estado inicial del formulario
 */
const initialFormData: ViajeFormData = {
  // Filtros para chofer
  categoria_licencia: '',
  id_chofer: '',
  
  // Información de empresa (solo lectura)
  nombre_empresa_info: '',
  
  // Detalles del viaje
  origen: '',
  destino: '',
  
  // Duración
  horas: '0',
  minutos: '0',
  
  // Fecha y hora programada
  fecha_viaje_programada: '',
  hora_viaje_programada: '',
  
  // Distancia
  distancia_km: '',
  
  // Observaciones
  observaciones: '',
  
  // Configuración
  enviar_email: false,
};

/**
 * Hook personalizado para manejar el formulario de viaje
 * Proporciona estado, validaciones y funciones para crear/editar
 */
export const useViajeForm = ({ viajeId }: UseViajeFormProps = {}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ViajeFormData>(initialFormData);
  const [errors, setErrors] = useState<ViajeFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(!!viajeId);
  
  // Choferes disponibles según categoría
  const [choferesDisponibles, setChoferesDisponibles] = useState<ChoferDisponible[]>([]);
  const [loadingChoferes, setLoadingChoferes] = useState(false);
  
  // Estado de validación de disponibilidad en tiempo real
  const [validandoDisponibilidad, setValidandoDisponibilidad] = useState(false);
  const [disponible, setDisponible] = useState<boolean | null>(null);
  const [mensajeDisponibilidad, setMensajeDisponibilidad] = useState<string>('');
  
  // Determinar si estamos en modo edición
  const isEditMode = !!viajeId;

  /**
   * Cargar datos del viaje si estamos en modo edición
   */
  useEffect(() => {
    if (viajeId) {
      loadViajeData(viajeId);
    }
  }, [viajeId]);

  /**
   * Cargar choferes cuando cambia la categoría de licencia
   */
  useEffect(() => {
    if (formData.categoria_licencia) {
      loadChoferesDisponibles(formData.categoria_licencia);
    } else {
      setChoferesDisponibles([]);
      setFormData(prev => ({ 
        ...prev, 
        id_chofer: '', 
        nombre_empresa_info: '' 
      }));
    }
  }, [formData.categoria_licencia]);

  /**
   * Actualizar info de empresa cuando se selecciona un chofer
   */
  useEffect(() => {
    if (formData.id_chofer && choferesDisponibles.length > 0) {
      const choferSeleccionado = choferesDisponibles.find(
        c => c.id_usuario === parseInt(formData.id_chofer)
      );
      
      if (choferSeleccionado) {
        setFormData(prev => ({
          ...prev,
          nombre_empresa_info: choferSeleccionado.nombre_empresa || 'Sin empresa'
        }));
      }
    }
  }, [formData.id_chofer, choferesDisponibles]);

  /**
   * Validar disponibilidad del chofer en tiempo real
   * Se ejecuta cuando cambian: chofer o fecha (NO hora)
   */
  useEffect(() => {
    const validarDisponibilidad = async () => {
      // Solo validar si tenemos chofer y fecha (hora es opcional)
      if (!formData.id_chofer || !formData.fecha_viaje_programada) {
        setDisponible(null);
        setMensajeDisponibilidad('');
        return;
      }

      try {
        setValidandoDisponibilidad(true);
        
        const resultado = await viajesApi.validarDisponibilidad(
          parseInt(formData.id_chofer),
          formData.fecha_viaje_programada,
          formData.hora_viaje_programada || '00:00', // Hora dummy (no se usa)
          isEditMode ? viajeId : undefined
        );

        setDisponible(resultado.disponible);
        setMensajeDisponibilidad(resultado.mensaje);

        // Si no está disponible, agregar error al campo
        if (!resultado.disponible) {
          setErrors(prev => ({
            ...prev,
            fecha_viaje_programada: resultado.mensaje
          }));
        } else {
          // Limpiar error si está disponible
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.fecha_viaje_programada;
            return newErrors;
          });
        }

      } catch (error: any) {
        console.error('Error al validar disponibilidad:', error);
        setDisponible(null);
        setMensajeDisponibilidad('Error al validar disponibilidad');
      } finally {
        setValidandoDisponibilidad(false);
      }
    };

    validarDisponibilidad();
  }, [formData.id_chofer, formData.fecha_viaje_programada, isEditMode, viajeId]); // Removido hora_viaje_programada

  /**
   * Carga los datos de un viaje existente
   */
  const loadViajeData = async (id: number) => {
    try {
      setLoadingInitialData(true);
      const data = await viajesApi.getById(id);
      
      // Extraer horas y minutos de duracion_estimada
      // Formato esperado: "12 horas 30 minutos" o "5 horas" o "30 minutos"
      let horas = '0';
      let minutos = '0';
      
      if (data.duracion_estimada) {
        const horasMatch = data.duracion_estimada.match(/(\d+)\s*horas?/i);
        const minutosMatch = data.duracion_estimada.match(/(\d+)\s*minutos?/i);
        
        if (horasMatch) horas = horasMatch[1];
        if (minutosMatch) minutos = minutosMatch[1];
      }
      
      // Transformar datos del backend al formato del formulario
      setFormData({
        categoria_licencia: data.categoria_licencia as CategoriaLicencia || '',
        id_chofer: data.id_chofer.toString(),
        nombre_empresa_info: data.nombre_empresa || '',
        origen: data.origen as any,
        destino: data.destino as any,
        horas,
        minutos,
        fecha_viaje_programada: data.fecha_viaje_programada || '',
        hora_viaje_programada: data.hora_viaje_programada ? data.hora_viaje_programada.substring(0, 5) : '', // HH:MM:SS -> HH:MM
        distancia_km: data.distancia_km ? data.distancia_km.toString() : '',
        observaciones: data.observaciones || '',
        enviar_email: false, // No aplica en modo edición
      });
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Error al cargar datos del viaje';
      toast.error(errorMessage);
      console.error('Error al cargar viaje:', error);
      navigate('/admin/viajes');
    } finally {
      setLoadingInitialData(false);
    }
  };

  /**
   * Carga choferes disponibles según categoría de licencia
   */
  const loadChoferesDisponibles = async (categoria: CategoriaLicencia) => {
    try {
      setLoadingChoferes(true);
      const response = await viajesApi.getChoferesDisponibles(categoria);
      setChoferesDisponibles(response.choferes);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Error al cargar choferes';
      toast.error(errorMessage);
      console.error('Error al cargar choferes:', error);
      setChoferesDisponibles([]);
    } finally {
      setLoadingChoferes(false);
    }
  };

  /**
   * Maneja cambios en los campos del formulario
   */
  const handleChange = (field: keyof ViajeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[field as keyof ViajeFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Valida todos los campos del formulario
   * Retorna true si no hay errores
   */
  const validateForm = (): boolean => {
    const newErrors: ViajeFormErrors = {};

    // Validar categoría de licencia
    if (!formData.categoria_licencia) {
      newErrors.categoria_licencia = 'Seleccione una categoría de licencia';
    }

    // Validar chofer
    if (!formData.id_chofer) {
      newErrors.id_chofer = 'Seleccione un chofer';
    }

    // Validar origen
    if (!formData.origen) {
      newErrors.origen = 'Seleccione un origen';
    }

    // Validar destino
    if (!formData.destino) {
      newErrors.destino = 'Seleccione un destino';
    }

    // Validar que origen != destino
    if (formData.origen && formData.destino && formData.origen === formData.destino) {
      newErrors.destino = 'El origen y destino deben ser diferentes';
    }

    // Validar fecha programada
    if (!formData.fecha_viaje_programada) {
      newErrors.fecha_viaje_programada = 'Seleccione la fecha programada';
    } else {
      // Validar que no sea una fecha pasada
      const fechaHoy = new Date();
      fechaHoy.setHours(0, 0, 0, 0);
      const fechaSeleccionada = new Date(formData.fecha_viaje_programada + 'T00:00:00');
      
      if (fechaSeleccionada < fechaHoy) {
        newErrors.fecha_viaje_programada = 'No se puede programar un viaje en el pasado';
      }
    }

    // Validar hora programada
    if (!formData.hora_viaje_programada) {
      newErrors.hora_viaje_programada = 'Seleccione la hora programada';
    }

    // Validar duración (al menos 1 hora o 1 minuto)
    const horas = parseInt(formData.horas) || 0;
    const minutos = parseInt(formData.minutos) || 0;
    
    if (horas < HORAS_VALIDAS.MIN || horas > HORAS_VALIDAS.MAX) {
      newErrors.horas = `Horas debe estar entre ${HORAS_VALIDAS.MIN} y ${HORAS_VALIDAS.MAX}`;
    }
    
    if (minutos < MINUTOS_VALIDOS.MIN || minutos > MINUTOS_VALIDOS.MAX) {
      newErrors.minutos = `Minutos debe estar entre ${MINUTOS_VALIDOS.MIN} y ${MINUTOS_VALIDOS.MAX}`;
    }
    
    if (horas === 0 && minutos === 0) {
      newErrors.horas = 'La duración debe ser mayor a 0';
    }

    // Validar distancia (opcional, pero si se proporciona debe ser válida)
    if (formData.distancia_km) {
      const distancia = parseFloat(formData.distancia_km);
      if (isNaN(distancia) || distancia <= 0) {
        newErrors.distancia_km = 'Distancia inválida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Construye la cadena de duración estimada
   */
  const buildDuracionEstimada = (): string => {
    const horas = parseInt(formData.horas) || 0;
    const minutos = parseInt(formData.minutos) || 0;
    
    const parts: string[] = [];
    if (horas > 0) {
      parts.push(`${horas} ${horas === 1 ? 'hora' : 'horas'}`);
    }
    if (minutos > 0) {
      parts.push(`${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`);
    }
    
    return parts.join(' ');
  };

  /**
   * Envía el formulario (crear o actualizar)
   */
  const handleSubmit = async (): Promise<boolean> => {
    // Validar disponibilidad antes de enviar
    if (disponible === false) {
      toast.error('El chofer no está disponible para esta fecha y hora. Por favor seleccione otra fecha/hora.');
      return false;
    }

    // Validar formulario
    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return false;
    }

    setLoading(true);

    try {
      // Obtener empresa del chofer seleccionado
      const choferSeleccionado = choferesDisponibles.find(
        c => c.id_usuario === parseInt(formData.id_chofer)
      );
      
      if (!choferSeleccionado || !choferSeleccionado.id_empresa) {
        toast.error('El chofer seleccionado no tiene empresa asignada');
        return false;
      }

      if (isEditMode && viajeId) {
        // Modo edición
        const updateData: ViajeUpdateData = {
          id_chofer: parseInt(formData.id_chofer),
          id_empresa: choferSeleccionado.id_empresa,
          origen: formData.origen,
          destino: formData.destino,
          duracion_estimada: buildDuracionEstimada(),
          distancia_km: formData.distancia_km ? parseFloat(formData.distancia_km) : undefined,
          fecha_viaje_programada: formData.fecha_viaje_programada,
          hora_viaje_programada: formData.hora_viaje_programada + ':00', // Agregar segundos
          observaciones: formData.observaciones || undefined,
        };

        await viajesApi.update(viajeId, updateData);
        toast.success('Viaje actualizado correctamente');
      } else {
        // Modo creación
        const createData: ViajeCreateData = {
          id_chofer: parseInt(formData.id_chofer),
          id_empresa: choferSeleccionado.id_empresa,
          origen: formData.origen,
          destino: formData.destino,
          duracion_estimada: buildDuracionEstimada(),
          distancia_km: formData.distancia_km ? parseFloat(formData.distancia_km) : undefined,
          fecha_viaje_programada: formData.fecha_viaje_programada,
          hora_viaje_programada: formData.hora_viaje_programada + ':00', // Agregar segundos
          observaciones: formData.observaciones || undefined,
          enviar_email: formData.enviar_email,
        };

        await viajesApi.create(createData);
        toast.success('Viaje creado correctamente');
      }

      // Navegar a la lista de viajes
      navigate('/admin/viajes');
      return true;

    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 
                          `Error al ${isEditMode ? 'actualizar' : 'crear'} viaje`;
      toast.error(errorMessage);
      console.error('Error en submit:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reinicia el formulario
   */
  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setChoferesDisponibles([]);
  };

  /**
   * Cancela y vuelve a la lista
   */
  const handleCancel = () => {
    navigate('/admin/viajes');
  };

  return {
    // Estado del formulario
    formData,
    errors,
    loading,
    loadingInitialData,
    isEditMode,
    
    // Choferes
    choferesDisponibles,
    loadingChoferes,
    
    // Validación de disponibilidad en tiempo real
    validandoDisponibilidad,
    disponible,
    mensajeDisponibilidad,
    
    // Funciones
    handleChange,
    handleSubmit,
    handleReset,
    handleCancel,
    validateForm,
  };
};

export default useViajeForm;
