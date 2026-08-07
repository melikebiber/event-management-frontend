import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

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
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  isLogoutModalOpen = false;

  constructor(
    public authService: Auth,
    private router: Router,
    private changeDetector: ChangeDetectorRef
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

  openLogoutModal(): void {
    this.isLogoutModalOpen = true;
    this.changeDetector.detectChanges();
  }

  closeLogoutModal(): void {
    this.isLogoutModalOpen = false;
    this.changeDetector.detectChanges();
  }

  confirmLogout(): void {
    this.authService.logout();

    this.isLogoutModalOpen = false;

    this.router.navigate(['/login']);

    this.changeDetector.detectChanges();
  }
}