import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';

@Component({
    selector: 'app-main',
    imports: [RouterOutlet, Sidebar, Header, Footer],
    templateUrl: './main.html',
    styleUrl: './main.css',
})
export class Main {
    isSidebarToggled = false;

    toggleSidebar() {
        this.isSidebarToggled = !this.isSidebarToggled;
    }
}
