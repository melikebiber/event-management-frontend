import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink
} from '@angular/router';

import {
  UserProfile,
  UserService
} from '../../services/user';

interface HttpErrorResponse {
  status?: number;

  error?: {
    message?: string;
  };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  currentUser: UserProfile | null = null;

  isLoading = true;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.userService
      .getCurrentUser()
      .subscribe({
        next: (response) => {
          this.currentUser = response.data;
          this.isLoading = false;

          localStorage.setItem(
            'currentUser',
            JSON.stringify({
              id: response.data.user_id,
              name: response.data.name,
              surname: response.data.surname,
              email: response.data.email,
              phone: response.data.phone,
              role: response.data.role
            })
          );

          this.changeDetector.detectChanges();
        },

        error: (error: HttpErrorResponse) => {
          console.error(
            'Profil bilgileri alınamadı:',
            error
          );

          this.currentUser = null;
          this.isLoading = false;

          this.errorMessage =
            error.error?.message ??
            'Profil bilgileri yüklenirken bir hata oluştu.';

          if (
            error.status === 401 ||
            error.status === 403
          ) {
            this.logout();
            return;
          }

          this.changeDetector.detectChanges();
        }
      });
  }

  get fullName(): string {
    if (!this.currentUser) {
      return 'Kullanıcı';
    }

    const name =
      this.currentUser.name?.trim() ?? '';

    const surname =
      this.currentUser.surname?.trim() ?? '';

    return `${name} ${surname}`.trim() ||
      'Kullanıcı';
  }

  get userInitial(): string {
    return this.fullName
      .charAt(0)
      .toLocaleUpperCase('tr-TR');
  }

  get roleText(): string {
    if (this.currentUser?.role === 'ADMIN') {
      return 'Yönetici';
    }

    return 'Kullanıcı';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');

    this.router.navigate(['/login']);
  }
}