import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numberFormat',
    standalone: true
})
export class NumberFormatPipe implements PipeTransform {
    transform(value: number | string, decimals: number = 2): string {
        if (value === null || value === undefined || value === '') return '';

        const num = typeof value === 'string' ? parseFloat(value) : value;

        if (isNaN(num)) return '';

        // Formatear con separador de miles (punto) y decimales (coma)
        const parts = num.toFixed(decimals).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimalPart = parts[1];

        if (decimals === 0) {
            return integerPart;
        }

        return `${integerPart},${decimalPart}`;
    }
}
