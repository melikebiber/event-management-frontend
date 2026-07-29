import { Component } from '@angular/core';
import {
  FormControl, //Tek bir form alanını yönetir.
  FormGroup, //Birden fazla alanı tek form altında toplar.
  ReactiveFormsModule, //HTML'de formGroup ve formControlName kullanmamızı sağlar.
  Validators //Form alanlarına doğrulama kuralları ekler.
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerMessage = ''; //Başarı veya hata mesajını tutar.
  isLoading = false; //Backend isteğinin devam edip etmediğini tutar.

  registerForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2)
      ]
    }),

    surname: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2)
      ]
    }),

    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    }),

    phone: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.pattern(/^0[0-9]{10}$/)
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
    private authService: Auth, //Auth: kayıt isteğini backend’e göndermek için
    private router: Router //Router: kayıt sonrası login sayfasına gitmek için
  ) {}

  onSubmit() {
    //Form geçersizse hata mesajlarının görünmesini sağlar.
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.registerMessage = '';

    //Formdaki name, surname, email, phone ve password değerlerini alır.
    const signupData = this.registerForm.getRawValue();

    //Form bilgilerini Auth service aracılığıyla backend'e gönderir.
    this.authService.signup(signupData).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.registerMessage =
          response.message || 'Kayıt işlemi başarılı.';

        //Başarı mesajını kısa süre gösterip login sayfasına yönlendirir.
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },

      error: (error) => {
        this.isLoading = false;

        this.registerMessage =
          error.error?.message ||
          error.error?.error ||
          'Kayıt işlemi başarısız.';
      }
    });
  }
}