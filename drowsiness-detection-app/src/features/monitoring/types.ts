export interface ReporteSomnolencia {
    marca_tiempo: string;
    frotamiento_ojos_primera_mano: {
        reporte: boolean;
        conteo: number;
        duraciones: string[];
    };
    frotamiento_ojos_segunda_mano: {
        reporte: boolean;
        conteo: number;
        duraciones: string[];
    };
    parpadeo: {
        reporte: boolean;
        conteo: number;
    };
    microsueno: {
        reporte: boolean;
        conteo: number;
        duraciones: string[];
    };
    inclinacion: {
        reporte: boolean;
        conteo: number;
        duraciones: string[];
    };
    bostezo: {
        reporte: boolean;
        conteo: number;
        duraciones: string[];
    };
}

export interface WebSocketResponse {
    reporte_json: ReporteSomnolencia;
    imagen_bosquejo: string;
    imagen_original: string;
    error?: string;
}

export interface ConfiguracionCamara {
    with: number;
    height: number;
    modo_cara: 'user' | 'environment';
}