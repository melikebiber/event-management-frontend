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
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ChangePasswordRequest,
  UpdateProfileRequest,
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
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  currentUser: UserProfile | null = null;

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  isProfileModalOpen = false;
  isPasswordModalOpen = false;

  isSavingProfile = false;
  isChangingPassword = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private userService: UserService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {
    this.profileForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      surname: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phone: ['']
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });
  }

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
    this.successMessage = '';

    this.userService
      .getCurrentUser()
      .subscribe({
        next: (response) => {
          this.currentUser = response.data;
          this.isLoading = false;

          this.saveCurrentUserToLocalStorage(
            response.data
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

  openProfileModal(): void {
    if (!this.currentUser) {
      return;
    }

    this.profileForm.patchValue({
      name: this.currentUser.name,
      surname: this.currentUser.surname,
      email: this.currentUser.email,
      phone: this.currentUser.phone ?? ''
    });

    this.errorMessage = '';
    this.successMessage = '';
    this.isProfileModalOpen = true;
  }

  closeProfileModal(): void {
    if (this.isSavingProfile) {
      return;
    }

    this.isProfileModalOpen = false;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.profileForm.getRawValue();

    const profileData: UpdateProfileRequest = {
      name: formValue.name,
      surname: formValue.surname,
      email: formValue.email,
      phone: formValue.phone ?? ''
    };

    this.isSavingProfile = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService
      .updateProfile(profileData)
      .subscribe({
        next: (response) => {
          this.currentUser = response.data;

          this.saveCurrentUserToLocalStorage(
            response.data
          );

          this.successMessage =
            response.message;

          this.isSavingProfile = false;
          this.isProfileModalOpen = false;

          this.changeDetector.detectChanges();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            error.error?.message ??
            'Profil bilgileri güncellenemedi.';

          this.isSavingProfile = false;

          this.changeDetector.detectChanges();
        }
      });
  }

  openPasswordModal(): void {
    this.passwordForm.reset();

    this.errorMessage = '';
    this.successMessage = '';
    this.isPasswordModalOpen = true;
  }

  closePasswordModal(): void {
    if (this.isChangingPassword) {
      return;
    }

    this.isPasswordModalOpen = false;
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.passwordForm.getRawValue();

    if (
      formValue.newPassword !==
      formValue.confirmPassword
    ) {
      this.errorMessage =
        'Yeni şifreler birbiriyle eşleşmiyor.';
      return;
    }

    const passwordData: ChangePasswordRequest = {
      currentPassword:
        formValue.currentPassword,

      newPassword:
        formValue.newPassword,

      confirmPassword:
        formValue.confirmPassword
    };

    this.isChangingPassword = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService
      .changePassword(passwordData)
      .subscribe({
        next: (response) => {
          this.successMessage =
            response.message;

          this.isChangingPassword = false;
          this.isPasswordModalOpen = false;

          this.passwordForm.reset();

          this.changeDetector.detectChanges();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            error.error?.message ??
            'Şifre değiştirilemedi.';

          this.isChangingPassword = false;

          this.changeDetector.detectChanges();
        }
      });
  }

  private saveCurrentUserToLocalStorage(
    user: UserProfile
  ): void {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: user.user_id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role
      })
    );
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