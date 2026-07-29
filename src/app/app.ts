import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, //anasayfayı ekranda gösteriyoruz
    RouterLink, // tıklanabilir sayfa bağlantısı oluşturduk
    RouterLinkActive //şu an açık olan bağlantıya css sınıfı ekler
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(
    public authService: Auth,
    private router: Router
  ) {}

  isAdmin(): boolean {
    const currentUserText =
      localStorage.getItem('currentUser');

    if (!currentUserText) {
      return false;
    }

    try {
      const currentUser = JSON.parse(
        currentUserText
      ) as {
        role?: string;
      };

      return currentUser.role === 'ADMIN';
    } catch {
      return false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}