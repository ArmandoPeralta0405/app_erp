import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appNextOnEnter]',
    standalone: true
})
export class NextOnEnterDirective {

    constructor(private el: ElementRef) { }

    @HostListener('keydown.enter', ['$event'])
    onEnter(event: Event) {
        event.preventDefault();

        const formElements = 'input:not([disabled]):not([readonly]), select:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), button:not([disabled])';
        const elements = Array.from(document.querySelectorAll(formElements)) as HTMLElement[];
        const index = elements.indexOf(this.el.nativeElement);

        if (index > -1 && index < elements.length - 1) {
            elements[index + 1].focus();
        }
    }
}
