import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { Navbar } from './components/navbar/navbar';
import { SpinnerComponent } from './components/spinner/spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    RouterModule,
    SpinnerComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
    showScrollTop = false;
    isDarkMode = false;

    constructor(
        private primeng: PrimeNG
    ) {}

    ngOnInit() {
        this.primeng.ripple.set(true);
        this.checkScrollPosition();

        // Always enable dark mode as it's the only theme
        this.enableDarkMode();
        this.isDarkMode = true;
    }

    toggleDarkMode() {
        if (this.isDarkMode) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }

        // Notification would go here
        console.log(`${this.isDarkMode ? 'Dark' : 'Light'} mode activated`);
    }

    enableDarkMode() {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        this.isDarkMode = true;
    }

    disableDarkMode() {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        this.isDarkMode = false;
    }

    @HostListener('window:scroll')
    checkScrollPosition() {
        // Not showing scroll button anymore as requested
        this.showScrollTop = false;
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
