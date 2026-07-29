import { Component } from '@angular/core';

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
    private authService: Auth, //login isteğini backende göndermek için kullanılır.
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginMessage = ''; //daha önce ekranda kalan mesaj temizlenir

    const loginData =
      this.loginForm.getRawValue();

    console.log(
      'Form bilgileri:',
      loginData
    );

    this.authService
      .login(loginData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          console.log(
            'Backend cevabı:',
            response
          );

          if (!response.token) {
            this.loginMessage =
              'Giriş başarılı ancak token alınamadı.';
            return;
          }

          localStorage.setItem(
            'token',
            response.token
          );

          if (response.user) {
            const userId =
              response.user.user_id ?? //önce user_id değerini kullan yoksa id değerini kullan
              response.user.id;

            if (!userId) {
              this.loginMessage =
                'Kullanıcı ID bilgisi alınamadı.';

              localStorage.removeItem('token');
              return;
            }

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
          } else {
            this.loginMessage =
              'Kullanıcı bilgileri alınamadı.';

            localStorage.removeItem('token');
            return;
          }

          this.loginMessage =
            response.message ??
            'Giriş işlemi başarılı.';

          this.router.navigate(['/events']);
        },

        error: (error) => {
          this.isLoading = false;

          this.loginMessage =
            error.error?.message ??
            error.error?.error ??
            'Giriş işlemi başarısız.';

          console.error(
            'Giriş hatası:',
            error
          );
        }
      });
  }
}