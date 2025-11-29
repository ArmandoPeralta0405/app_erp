export interface Usuario {
    id_usuario: number;
    nombre: string;
    apellido: string;
    cedula?: string;
    telefono?: string;
    direccion?: string;
    estado?: boolean;
    alias: string;
    clave: string;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
}
