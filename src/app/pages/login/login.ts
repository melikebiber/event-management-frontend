import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginMessage = '';
  isLoading = false;
  isErrorModalOpen = false;

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(6)
      ]
    })
  });

  constructor(
    private authService: Auth,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginMessage = '';
    this.isErrorModalOpen = false;

    const loginData =
      this.loginForm.getRawValue();

    this.authService
      .login(loginData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if (
            response.success === false ||
            !response.token ||
            !response.user
          ) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');

            this.loginMessage =
              response.message ??
              'E-posta veya şifre hatalı.';

            this.isErrorModalOpen = true;
            this.changeDetector.detectChanges();

            return;
          }

          const userId =
            response.user.user_id ??
            response.user.id;

          if (!userId) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');

            this.loginMessage =
              'Kullanıcı bilgileri alınamadı.';

            this.isErrorModalOpen = true;
            this.changeDetector.detectChanges();

            return;
          }

          localStorage.setItem(
            'token',
            response.token
          );

          localStorage.setItem(
            'currentUser',
            JSON.stringify({
              id: userId,
              name: response.user.name,
              surname: response.user.surname,
              email: response.user.email,
              phone: response.user.phone,
              role: response.user.role
            })
          );

          this.router.navigate(['/events']);
        },

        error: (error) => {
          this.isLoading = false;

          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');

          if (error.status === 401) {
            this.loginMessage =
              'E-posta veya şifre hatalı.';
          } else if (error.status === 404) {
            this.loginMessage =
              'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.';
          } else if (error.status === 0) {
            this.loginMessage =
              'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.';
          } else {
            this.loginMessage =
              error.error?.message ??
              error.error?.error ??
              'Giriş işlemi gerçekleştirilemedi.';
          }

          this.isErrorModalOpen = true;
          this.changeDetector.detectChanges();

          console.error(
            'Giriş hatası:',
            error
          );
        }
      });
  }

  closeErrorModal(): void {
    this.isErrorModalOpen = false;
    this.changeDetector.detectChanges();
  }
}