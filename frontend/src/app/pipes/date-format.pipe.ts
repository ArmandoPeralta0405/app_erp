import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateFormat',
    standalone: true
})
export class DateFormatPipe implements PipeTransform {
    transform(value: string | Date): string {
        if (!value) return '';

        const date = typeof value === 'string' ? new Date(value) : value;

        if (isNaN(date.getTime())) return '';

        // Formato DD/MM/YYYY (estilo sudamericano)
        // Usar UTC para evitar problemas de zona horaria
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();

        return `${day}/${month}/${year}`;
    }
}
