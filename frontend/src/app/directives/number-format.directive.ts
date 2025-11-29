import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appNumberFormat]',
    standalone: true
})
export class NumberFormatDirective {
    @Input() decimals: number = 2;
    private el: HTMLInputElement;

    constructor(private elementRef: ElementRef) {
        this.el = this.elementRef.nativeElement;
    }

    @HostListener('blur')
    onBlur() {
        const value = this.el.value;
        if (!value || value === '') return;

        // Parsear el valor (puede venir con o sin formato)
        const numValue = this.parseValue(value);

        if (isNaN(numValue)) {
            this.el.value = '';
            return;
        }

        // Formatear y actualizar
        this.el.value = this.formatNumber(numValue, this.decimals);

        // Disparar evento para actualizar ngModel
        this.el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    @HostListener('focus')
    onFocus() {
        const value = this.el.value;
        if (!value || value === '') return;

        // Parsear el valor actual (puede ser número puro o formateado)
        const numValue = this.parseValue(value);

        if (!isNaN(numValue)) {
            // Mostrar con coma decimal pero sin separadores de miles
            // Usar replace para cambiar punto por coma
            const formatted = numValue.toFixed(this.decimals).replace('.', ',');
            this.el.value = formatted;
        }
    }

    private parseValue(value: string): number {
        if (!value) return 0;

        // Si el valor es un número puro (sin separadores), parsearlo directamente
        const cleanValue = String(value).trim();

        // Detectar si ya tiene formato (contiene punto como separador de miles)
        // Un número con formato tendrá puntos en posiciones específicas
        const hasThousandsSeparator = /\d+\.\d{3}/.test(cleanValue);

        if (hasThousandsSeparator) {
            // Tiene formato: remover puntos (separadores de miles) y reemplazar coma por punto
            return parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
        } else {
            // No tiene formato: puede ser número puro o con coma decimal
            // Reemplazar coma por punto para parsear
            return parseFloat(cleanValue.replace(',', '.'));
        }
    }

    private formatNumber(num: number, decimals: number): string {
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
