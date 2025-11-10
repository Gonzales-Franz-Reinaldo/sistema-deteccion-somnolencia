// ============================================
// HOOK PERSONALIZADO PARA FORMULARIO DE CHOFER
// Maneja estado, validaciones y envío del formulario
// Soporta tanto creación como edición
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { choferesApi } from '../services/choferesApi';
import type { ChoferFormData, ChoferFormErrors, ChoferCreateData, ChoferUpdateData } from '../types';

/**
 * Props del hook
 */
interface UseChoferFormProps {
  choferId?: number; // Si existe, modo edición
}

/**
 * Estado inicial del formulario
 */
const initialFormData: ChoferFormData = {
  // Datos personales
  nombres: '',
  apellidos: '',
  dni_ci: '',
  genero: '',
  nacionalidad: '',
  
  // Contacto
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  
  // Laboral (tipo_chofer removido - se hardcodea como 'empresa')
  id_empresa: '',
  numero_licencia: '',
  categoria_licencia: '',
  
  // Credenciales
  usuario: '',
  password: '',
  password_confirm: '',
  
  // Configuración
  activo: true,
  enviar_email: false, // Solo para creación
};

/**
 * Hook personalizado para manejar el formulario de chofer
 * Proporciona estado, validaciones y funciones para crear/editar
 */
export const useChoferForm = ({ choferId }: UseChoferFormProps = {}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ChoferFormData>(initialFormData);
  const [errors, setErrors] = useState<ChoferFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(!!choferId);
  
  // Determinar si estamos en modo edición
  const isEditMode = !!choferId;

  /**
   * Cargar datos del chofer si estamos en modo edición
   */
  useEffect(() => {
    if (choferId) {
      loadChoferData(choferId);
    }
  }, [choferId]);

  /**
   * Carga los datos de un chofer existente
   */
  const loadChoferData = async (id: number) => {
    try {
      setLoadingInitialData(true);
      const data = await choferesApi.getById(id);
      
      // Separar nombre_completo en nombres y apellidos
      const nombreParts = data.nombre_completo.split(' ');
      const nombres = nombreParts.slice(0, Math.ceil(nombreParts.length / 2)).join(' ');
      const apellidos = nombreParts.slice(Math.ceil(nombreParts.length / 2)).join(' ');
      
      // Extraer letra de categoría (por ej: "Categoría A" -> "a")
      let categoriaLetra = '';
      if (data.categoria_licencia) {
        const match = data.categoria_licencia.match(/Categoría\s+([A-D])/i);
        if (match) {
          categoriaLetra = match[1].toLowerCase();
        }
      }
      
      // Transformar datos del backend al formato del formulario
      setFormData({
        nombres: nombres || '',
        apellidos: apellidos || '',
        dni_ci: data.dni_ci || '',
        genero: data.genero || '',
        nacionalidad: data.nacionalidad || '',
        email: data.email || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        ciudad: data.ciudad || '',
        id_empresa: data.id_empresa ? data.id_empresa.toString() : '',
        numero_licencia: data.numero_licencia || '',
        categoria_licencia: categoriaLetra as any,
        usuario: data.usuario || '',
        password: '', // Vacío en modo edición
        password_confirm: '', // Vacío en modo edición
        activo: data.activo,
        enviar_email: false, // No aplica en modo edición
      });
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Error al cargar datos del chofer';
      toast.error(errorMessage);
      console.error('Error al cargar chofer:', error);
      // Volver a la lista si hay error
      navigate('/admin/choferes');
    } finally {
      setLoadingInitialData(false);
    }
  };

  /**
   * Valida formato de email
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Valida formato de teléfono (permite varios formatos)
   */
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
  };

  /**
   * Valida formato de DNI/CI (solo números, 6-10 dígitos)
   */
  const isValidDNI = (dni: string): boolean => {
    const dniRegex = /^\d{6,10}$/;
    return dniRegex.test(dni);
  };

  /**
   * Valida todos los campos del formulario
   * Retorna true si no hay errores
   */
  const validateForm = (): boolean => {
    const newErrors: ChoferFormErrors = {};

    // Validar datos personales
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido';
    } else if (formData.nombres.trim().length < 2) {
      newErrors.nombres = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    if (!formData.dni_ci.trim()) {
      newErrors.dni_ci = 'El DNI/CI es requerido';
    } else if (!isValidDNI(formData.dni_ci)) {
      newErrors.dni_ci = 'DNI/CI inválido (6-10 dígitos)';
    }

    if (!formData.genero) {
      newErrors.genero = 'Seleccione un género';
    }

    // Validar contacto
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!isValidPhone(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido';
    }

    // Validar laboral (empresa SIEMPRE requerida ahora - tipo_chofer hardcoded)
    if (!formData.id_empresa) {
      newErrors.id_empresa = 'Seleccione una empresa';
    }

    if (!formData.numero_licencia.trim()) {
      newErrors.numero_licencia = 'El número de licencia es requerido';
    }

    if (!formData.categoria_licencia) {
      newErrors.categoria_licencia = 'Seleccione una categoría';
    }

    // Validar credenciales
    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El usuario es requerido';
    } else if (formData.usuario.trim().length < 5) {
      newErrors.usuario = 'El usuario debe tener al menos 5 caracteres';
    }

    // Validar contraseña: SOLO REQUERIDA EN MODO CREACIÓN
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (!formData.password_confirm) {
        newErrors.password_confirm = 'Confirme la contraseña';
      } else if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = 'Las contraseñas no coinciden';
      }
    } else {
      // En modo edición, validar solo si se proporcionó contraseña
      if (formData.password || formData.password_confirm) {
        if (formData.password && formData.password.length < 6) {
          newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        if (formData.password !== formData.password_confirm) {
          newErrors.password_confirm = 'Las contraseñas no coinciden';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Actualiza un campo del formulario
   */
  const handleChange = (field: keyof ChoferFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo si existe
    if (errors[field as keyof ChoferFormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof ChoferFormErrors];
        return newErrors;
      });
    }
  };

  /**
   * Transforma los datos del formulario al formato del backend (CREATE)
   */
  const transformFormDataForCreate = (): ChoferCreateData => {
    return {
      // Credenciales
      usuario: formData.usuario.trim(),
      password: formData.password,
      email: formData.email.trim().toLowerCase(),
      rol: 'chofer',
      
      // Datos personales (combinar nombres y apellidos)
      nombre_completo: `${formData.nombres.trim()} ${formData.apellidos.trim()}`,
      dni_ci: formData.dni_ci.trim(),
      genero: formData.genero as 'masculino' | 'femenino' | 'otro',
      nacionalidad: formData.nacionalidad.trim() || undefined,
      
      // Contacto
      telefono: formData.telefono.trim(),
      direccion: formData.direccion.trim() || undefined,
      ciudad: formData.ciudad.trim() || undefined,
      
      // Laboral (tipo_chofer hardcoded como 'empresa')
      tipo_chofer: 'empresa',
      id_empresa: formData.id_empresa 
        ? parseInt(formData.id_empresa) 
        : undefined,
      numero_licencia: formData.numero_licencia.trim(),
      categoria_licencia: formData.categoria_licencia === 'a' ? 'Categoría A - Motocicletas'
        : formData.categoria_licencia === 'b' ? 'Categoría B - Vehículos Livianos'
        : formData.categoria_licencia === 'c' ? 'Categoría C - Vehículos Pesados'
        : 'Categoría D - Transporte Público',
      
      // Estado
      activo: formData.activo,
      
      // Notificaciones (enviar credenciales por email)
      enviar_email: formData.enviar_email,
    };
  };

  /**
   * Transforma los datos del formulario al formato del backend (UPDATE)
   */
  const transformFormDataForUpdate = (): ChoferUpdateData => {
    const updateData: ChoferUpdateData = {
      // Datos personales
      nombre_completo: `${formData.nombres.trim()} ${formData.apellidos.trim()}`,
      dni_ci: formData.dni_ci.trim(),
      genero: formData.genero as 'masculino' | 'femenino' | 'otro',
      nacionalidad: formData.nacionalidad.trim() || undefined,
      
      // Contacto
      email: formData.email.trim().toLowerCase(),
      telefono: formData.telefono.trim(),
      direccion: formData.direccion.trim() || undefined,
      ciudad: formData.ciudad.trim() || undefined,
      
      // Laboral (tipo_chofer hardcoded como 'empresa')
      tipo_chofer: 'empresa',
      id_empresa: formData.id_empresa 
        ? parseInt(formData.id_empresa) 
        : undefined,
      numero_licencia: formData.numero_licencia.trim(),
      categoria_licencia: formData.categoria_licencia === 'a' ? 'Categoría A - Motocicletas'
        : formData.categoria_licencia === 'b' ? 'Categoría B - Vehículos Livianos'
        : formData.categoria_licencia === 'c' ? 'Categoría C - Vehículos Pesados'
        : 'Categoría D - Transporte Público',
      
      // Estado
      activo: formData.activo,
    };

    // Solo incluir password si se proporcionó
    if (formData.password && formData.password.trim()) {
      updateData.password = formData.password;
    }

    return updateData;
  };

  /**
   * Maneja el envío del formulario (CREATE o UPDATE)
   */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validar formulario
    if (!validateForm()) {
      toast.error('Por favor, corrija los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && choferId) {
        // MODO EDICIÓN
        const dataToSend = transformFormDataForUpdate();
        await choferesApi.update(choferId, dataToSend);
        toast.success('¡Chofer actualizado exitosamente!');
      } else {
        // MODO CREACIÓN
        const dataToSend = transformFormDataForCreate();
        await choferesApi.create(dataToSend);
        toast.success('¡Chofer registrado exitosamente!');
      }
      
      // Navegar a la lista de choferes
      setTimeout(() => {
        navigate('/admin/choferes');
      }, 1500);

    } catch (error: any) {
      // Manejar errores del backend
      const errorMessage = error?.response?.data?.detail || 
        (isEditMode ? 'Error al actualizar chofer' : 'Error al registrar chofer');
      toast.error(errorMessage);
      console.error('Error al procesar formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetea el formulario a valores iniciales
   */
  const handleReset = () => {
    if (isEditMode && choferId) {
      // En modo edición, recargar los datos originales
      loadChoferData(choferId);
    } else {
      // En modo creación, limpiar el formulario
      setFormData(initialFormData);
    }
    setErrors({});
  };

  /**
   * Cancela y vuelve a la página anterior
   */
  const handleCancel = () => {
    const message = isEditMode 
      ? '¿Está seguro de cancelar? Los cambios no se guardarán.'
      : '¿Está seguro de cancelar? Los datos no se guardarán.';
      
    if (confirm(message)) {
      navigate('/admin/choferes');
    }
  };

  return {
    formData,
    errors,
    loading,
    loadingInitialData,
    isEditMode,
    handleChange,
    handleSubmit,
    handleReset,
    handleCancel,
  };
};

export default useChoferForm;
